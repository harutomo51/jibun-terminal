import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal } from '@xterm/xterm';
import { useEffect, useRef, useState } from 'react';
import { getTerminalBridge } from '../lib/terminalBridge';
import type { AppLogEntry } from '../App';

interface TerminalViewProps {
  restartToken: number;
  onShellChange: (shellName: string) => void;
  onLog: (message: string, level?: AppLogEntry['level']) => void;
}

export function TerminalView({ restartToken, onShellChange, onLog }: TerminalViewProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    let removeDataListener: () => void = () => undefined;
    let removeExitListener: () => void = () => undefined;
    let disposed = false;

    const terminal = new Terminal({
      cursorBlink: true,
      convertEol: true,
      scrollback: 5000,
      fontFamily: '"Cascadia Mono", "Consolas", monospace',
      fontSize: 14,
      lineHeight: 1.2,
      theme: {
        background: 'rgba(8, 10, 16, 0)',
        foreground: '#f6f8ff',
        cursor: '#ffffff',
        selectionBackground: '#6171ff66'
      },
      allowTransparency: true
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(new WebLinksAddon());
    terminal.open(containerRef.current);
    terminal.focus();

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    const bridge = getTerminalBridge();

    const resizePty = () => {
      try {
        fitAddon.fit();
        void bridge.resize({ cols: terminal.cols, rows: terminal.rows });
      } catch (resizeError) {
        console.error('Renderer resize failed', resizeError);
        onLog('リサイズ処理に失敗しました。', 'error');
      }
    };

    const observer = new ResizeObserver(resizePty);
    observer.observe(containerRef.current);

    removeDataListener = bridge.onData((data) => terminal.write(data));
    removeExitListener = bridge.onExit((payload) => {
      onLog(`PTYが終了しました: exitCode=${payload.exitCode ?? 'null'}`);
    });

    terminal.onData((data) => {
      bridge.input(data).catch((inputError: unknown) => {
        console.error('Renderer input IPC failed', inputError);
        setError('入力をPTYへ送信できませんでした。');
      });
    });

    const start = async () => {
      try {
        const result = restartToken > 0 ? await bridge.restart() : await bridge.start();
        if (!result.ok || !result.shell) {
          const message = result.error ?? 'PowerShellの起動に失敗しました。';
          setError(message);
          terminal.writeln(`\r\n[fun-terminal-win11] ${message}`);
          onLog(message, 'error');
          return;
        }

        setError(null);
        onShellChange(result.shell.displayName);
        onLog(`${result.shell.name} を起動しました。`);
        window.setTimeout(resizePty, 50);
      } catch (startError) {
        const message = startError instanceof Error ? startError.message : 'renderer初期化に失敗しました。';
        console.error('Renderer terminal initialization failed', startError);
        setError(message);
        onLog(message, 'error');
      }
    };

    void start();

    return () => {
      disposed = true;
      observer.disconnect();
      removeDataListener();
      removeExitListener();
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
      void disposed;
    };
  }, [restartToken, onLog, onShellChange]);

  return (
    <section className="terminal-frame">
      {error ? <div className="terminal-error">{error}</div> : null}
      <div className="terminal-host" ref={containerRef} />
    </section>
  );
}
