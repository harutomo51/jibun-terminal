import { EventEmitter } from 'node:events';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import type { IPty } from 'node-pty';
import { resolvePowerShellCandidate } from './shellResolver';
import type { ShellInfo, TerminalExitPayload, TerminalResizePayload, TerminalStartResult } from './types';

type PtyModule = typeof import('node-pty');

export class PtyManager {
  private ptyProcess: IPty | null = null;
  private shell: ShellInfo | null = null;
  private readonly events = new EventEmitter();
  private readonly cwd: string;

  constructor(cwd = resolve(process.cwd())) {
    this.cwd = cwd || homedir();
  }

  onData(listener: (data: string) => void): () => void {
    this.events.on('data', listener);
    return () => this.events.off('data', listener);
  }

  onExit(listener: (payload: TerminalExitPayload) => void): () => void {
    this.events.on('exit', listener);
    return () => this.events.off('exit', listener);
  }

  async start(): Promise<TerminalStartResult> {
    if (this.ptyProcess && this.shell) {
      return { ok: true, shell: this.shell };
    }

    const shell = resolvePowerShellCandidate();
    if (!shell) {
      return { ok: false, error: 'pwsh.exe または powershell.exe が見つかりませんでした。' };
    }

    try {
      const pty = await this.loadPty();
      this.shell = shell;
      this.ptyProcess = pty.spawn(shell.name, [], {
        name: 'xterm-256color',
        cols: 100,
        rows: 30,
        cwd: this.cwd,
        env: process.env
      });

      this.ptyProcess.onData((data) => this.events.emit('data', data));
      this.ptyProcess.onExit((event) => {
        const payload: TerminalExitPayload = {
          exitCode: event.exitCode,
          signal: event.signal
        };
        this.ptyProcess = null;
        this.events.emit('exit', payload);
      });

      return { ok: true, shell };
    } catch (error) {
      console.error('Failed to start PTY process', error);
      this.ptyProcess = null;
      this.shell = null;
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'PTYの起動に失敗しました。'
      };
    }
  }

  async restart(): Promise<TerminalStartResult> {
    this.dispose();
    return this.start();
  }

  write(data: string): void {
    if (!this.ptyProcess) {
      throw new Error('PTY process is not running.');
    }
    this.ptyProcess.write(data);
  }

  resize(payload: TerminalResizePayload): void {
    if (!this.ptyProcess) {
      return;
    }

    const cols = Math.max(2, Math.floor(payload.cols));
    const rows = Math.max(1, Math.floor(payload.rows));
    this.ptyProcess.resize(cols, rows);
  }

  dispose(): void {
    if (!this.ptyProcess) {
      return;
    }

    try {
      this.ptyProcess.kill();
    } catch (error) {
      console.error('Failed to kill PTY process', error);
    } finally {
      this.ptyProcess = null;
      this.shell = null;
    }
  }

  private async loadPty(): Promise<PtyModule> {
    try {
      return await import('node-pty');
    } catch (error) {
      console.error('Failed to load node-pty', error);
      throw new Error('node-pty のロードに失敗しました。npm install の結果とWindowsビルド環境を確認してください。');
    }
  }
}
