import { EventEmitter } from 'node:events';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import type { IPty } from 'node-pty';
import { createPowerShellPromptScript, extractOsc7Cwd } from './cwdTracker';
import { resolvePowerShellCandidate } from './shellResolver';
import type {
  ShellInfo,
  TerminalCwdChangePayload,
  TerminalDataPayload,
  TerminalExitPayload,
  TerminalResizePayload,
  TerminalStartResult
} from './types';

type PtyModule = typeof import('node-pty');

interface PaneProcess {
  ptyProcess: IPty;
  shell: ShellInfo;
  currentCwd: string;
}

export class PtyManager {
  private readonly panes = new Map<string, PaneProcess>();
  private readonly events = new EventEmitter();
  private readonly cwd: string;

  constructor(cwd = homedir()) {
    this.cwd = resolve(cwd || homedir());
  }

  onData(listener: (payload: TerminalDataPayload) => void): () => void {
    this.events.on('data', listener);
    return () => this.events.off('data', listener);
  }

  onExit(listener: (payload: TerminalExitPayload) => void): () => void {
    this.events.on('exit', listener);
    return () => this.events.off('exit', listener);
  }

  onCwdChange(listener: (payload: TerminalCwdChangePayload) => void): () => void {
    this.events.on('cwdChange', listener);
    return () => this.events.off('cwdChange', listener);
  }

  getCurrentCwd(paneId?: string): string {
    if (!paneId) {
      return this.cwd;
    }

    return this.panes.get(paneId)?.currentCwd ?? this.cwd;
  }

  async start(paneId: string, cwd?: string): Promise<TerminalStartResult> {
    const existingPane = this.panes.get(paneId);
    if (existingPane) {
      return { ok: true, shell: existingPane.shell, cwd: existingPane.currentCwd };
    }

    const shell = resolvePowerShellCandidate();
    if (!shell) {
      return { ok: false, error: 'pwsh.exe or powershell.exe was not found.' };
    }

    try {
      const pty = await this.loadPty();
      const initialCwd = cwd ? resolve(cwd) : this.cwd;
      const ptyProcess = pty.spawn(shell.name, ['-NoLogo', '-NoExit', '-Command', createPowerShellPromptScript()], {
        name: 'xterm-256color',
        cols: 100,
        rows: 30,
        cwd: initialCwd,
        env: process.env
      });

      const pane: PaneProcess = {
        ptyProcess,
        shell,
        currentCwd: initialCwd
      };
      this.panes.set(paneId, pane);

      ptyProcess.onData((data) => {
        this.updateCurrentCwd(paneId, data);
        this.events.emit('data', { paneId, data });
      });
      ptyProcess.onExit((event) => {
        const payload: TerminalExitPayload = {
          paneId,
          exitCode: event.exitCode,
          signal: event.signal
        };
        this.panes.delete(paneId);
        this.events.emit('exit', payload);
      });

      return { ok: true, shell, cwd: pane.currentCwd };
    } catch (error) {
      console.error('Failed to start PTY process', error);
      this.panes.delete(paneId);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to start the PTY process.'
      };
    }
  }

  async restart(paneId: string): Promise<TerminalStartResult> {
    this.close(paneId);
    return this.start(paneId);
  }

  write(paneId: string, data: string): void {
    const pane = this.panes.get(paneId);
    if (!pane) {
      throw new Error('PTY process is not running.');
    }

    pane.ptyProcess.write(data);
  }

  resize(payload: TerminalResizePayload): void {
    const pane = this.panes.get(payload.paneId);
    if (!pane) {
      return;
    }

    const cols = Math.max(2, Math.floor(payload.cols));
    const rows = Math.max(1, Math.floor(payload.rows));
    pane.ptyProcess.resize(cols, rows);
  }

  close(paneId: string): void {
    const pane = this.panes.get(paneId);
    if (!pane) {
      return;
    }

    try {
      pane.ptyProcess.kill();
    } catch (error) {
      console.error('Failed to kill PTY process', error);
    } finally {
      this.panes.delete(paneId);
    }
  }

  dispose(): void {
    for (const paneId of this.panes.keys()) {
      this.close(paneId);
    }
  }

  private async loadPty(): Promise<PtyModule> {
    try {
      return await import('node-pty');
    } catch (error) {
      console.error('Failed to load node-pty', error);
      throw new Error('Failed to load node-pty. Run npm install and check the Windows build tools.');
    }
  }

  private updateCurrentCwd(paneId: string, data: string): void {
    const pane = this.panes.get(paneId);
    const cwd = extractOsc7Cwd(data);
    if (!pane || !cwd || cwd === pane.currentCwd) {
      return;
    }

    pane.currentCwd = cwd;
    this.events.emit('cwdChange', { paneId, cwd });
  }
}
