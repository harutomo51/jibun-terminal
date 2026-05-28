import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal } from '@xterm/xterm';
import { SquareSplitHorizontal, SquareSplitVertical, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { AppLogEntry } from '../App';
import { getTerminalBridge } from '../lib/terminalBridge';
import { shouldForwardTabToPty } from '../lib/terminalKeys';
import type { TerminalSplitDirection } from '../lib/terminalLayout';

interface TerminalViewProps {
  paneId: string;
  title: string;
  restartToken: number;
  isActive: boolean;
  canClose: boolean;
  onActivate: (paneId: string) => void;
  onClose: (paneId: string) => void;
  onShellChange: (paneId: string, shellName: string) => void;
  onLog: (message: string, level?: AppLogEntry['level']) => void;
  onSplit: (paneId: string, direction: TerminalSplitDirection) => void;
}

export function TerminalView({
  paneId,
  title,
  restartToken,
  isActive,
  canClose,
  onActivate,
  onClose,
  onShellChange,
  onLog,
  onSplit
}: TerminalViewProps): JSX.Element {
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

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    const bridge = getTerminalBridge();

    terminal.attachCustomKeyEventHandler((event) => {
      if (event.type === 'keydown' && shouldForwardTabToPty(event)) {
        event.preventDefault();
        bridge.input({ paneId, data: '\t' }).catch((inputError: unknown) => {
          console.error('Renderer tab IPC failed', inputError);
          setError('Tab key could not be sent to the PTY.');
        });
        return false;
      }

      return true;
    });

    const resizePty = () => {
      try {
        fitAddon.fit();
        void bridge.resize({ paneId, cols: terminal.cols, rows: terminal.rows });
      } catch (resizeError) {
        console.error('Renderer resize failed', resizeError);
        onLog('Terminal resize failed.', 'error');
      }
    };

    const observer = new ResizeObserver(resizePty);
    observer.observe(containerRef.current);

    removeDataListener = bridge.onData((payload) => {
      if (payload.paneId === paneId) {
        terminal.write(payload.data);
      }
    });
    removeExitListener = bridge.onExit((payload) => {
      if (payload.paneId === paneId) {
        onLog(`PTY exited: exitCode=${payload.exitCode ?? 'null'}`);
      }
    });

    const inputDisposable = terminal.onData((data) => {
      bridge.input({ paneId, data }).catch((inputError: unknown) => {
        console.error('Renderer input IPC failed', inputError);
        setError('Input could not be sent to the PTY.');
      });
    });

    const start = async () => {
      try {
        const result = restartToken > 0 ? await bridge.restart(paneId) : await bridge.start(paneId);
        if (!result.ok || !result.shell) {
          const message = result.error ?? 'Failed to start PowerShell.';
          setError(message);
          terminal.writeln(`\r\n[fun-terminal-win11] ${message}`);
          onLog(message, 'error');
          return;
        }

        setError(null);
        onShellChange(paneId, result.shell.displayName);
        onLog(`${result.shell.name} started.`);
        window.setTimeout(resizePty, 50);
      } catch (startError) {
        const message = startError instanceof Error ? startError.message : 'Renderer initialization failed.';
        console.error('Renderer terminal initialization failed', startError);
        setError(message);
        onLog(message, 'error');
      }
    };

    void start();

    return () => {
      observer.disconnect();
      inputDisposable.dispose();
      removeDataListener();
      removeExitListener();
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, [paneId, restartToken, onLog, onShellChange]);

  useEffect(() => {
    if (isActive) {
      terminalRef.current?.focus();
    }
  }, [isActive]);

  return (
    <section
      className={`terminal-frame${isActive ? ' terminal-frame--active' : ''}`}
      onMouseDown={() => onActivate(paneId)}
    >
      <div className="terminal-pane-label">{title}</div>
      <div className="terminal-pane-toolbar">
        <button type="button" title="Split vertically" onClick={() => onSplit(paneId, 'vertical')}>
          <SquareSplitHorizontal size={15} />
        </button>
        <button type="button" title="Split horizontally" onClick={() => onSplit(paneId, 'horizontal')}>
          <SquareSplitVertical size={15} />
        </button>
        <button type="button" title="Close pane" disabled={!canClose} onClick={() => onClose(paneId)}>
          <X size={15} />
        </button>
      </div>
      {error ? <div className="terminal-error">{error}</div> : null}
      <div className="terminal-host" ref={containerRef} />
    </section>
  );
}
