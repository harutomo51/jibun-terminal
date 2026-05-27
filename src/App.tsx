import { useCallback, useState } from 'react';
import { StatusPanel } from './components/StatusPanel';
import { TerminalView } from './components/TerminalView';
import { TopBar } from './components/TopBar';
import { normalizeHexColor } from './lib/backgroundColor';
import { normalizeOpacity } from './lib/opacity';
import './styles/terminal.css';

type BackgroundMode = 'aurora' | 'sunset' | 'image' | 'custom';

export interface AppLogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'error';
}

export default function App(): JSX.Element {
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('aurora');
  const [customBackgroundColor, setCustomBackgroundColor] = useState('#1f6feb');
  const [terminalBackgroundColor, setTerminalBackgroundColor] = useState('#05070d');
  const [terminalOpacity, setTerminalOpacity] = useState(0.78);
  const [shellName, setShellName] = useState('未起動');
  const [logs, setLogs] = useState<AppLogEntry[]>([]);
  const [restartToken, setRestartToken] = useState(0);

  const addLog = useCallback((message: string, level: AppLogEntry['level'] = 'info') => {
    setLogs((current) => [
      { timestamp: new Date().toLocaleTimeString(), message, level },
      ...current
    ].slice(0, 8));
  }, []);

  const cycleBackground = () => {
    setBackgroundMode((current) => {
      if (current === 'aurora') return 'sunset';
      if (current === 'sunset') return 'image';
      if (current === 'image') return 'custom';
      return 'aurora';
    });
  };

  const updateCustomBackgroundColor = (value: string) => {
    setCustomBackgroundColor(normalizeHexColor(value, customBackgroundColor));
    setBackgroundMode('custom');
  };

  const updateTerminalBackgroundColor = (value: string) => {
    setTerminalBackgroundColor(normalizeHexColor(value, terminalBackgroundColor));
  };

  const updateTerminalOpacity = (value: number) => {
    setTerminalOpacity(normalizeOpacity(value));
  };

  const restartTerminal = () => {
    setRestartToken((value) => value + 1);
  };

  return (
    <main
      className={`app-shell app-shell--${backgroundMode}`}
      style={{
        '--terminal-opacity': terminalOpacity,
        '--custom-background-color': customBackgroundColor,
        '--terminal-background-color': terminalBackgroundColor
      } as React.CSSProperties}
    >
      <div className="app-overlay" />
      <TopBar
        appName="fun-terminal-win11"
        shellName={shellName}
        backgroundMode={backgroundMode}
        customBackgroundColor={customBackgroundColor}
        terminalBackgroundColor={terminalBackgroundColor}
        terminalOpacity={terminalOpacity}
        onCycleBackground={cycleBackground}
        onCustomBackgroundColorChange={updateCustomBackgroundColor}
        onTerminalBackgroundColorChange={updateTerminalBackgroundColor}
        onTerminalOpacityChange={updateTerminalOpacity}
        onRestart={restartTerminal}
      />
      <section className="workspace">
        <TerminalView
          restartToken={restartToken}
          onShellChange={setShellName}
          onLog={addLog}
        />
        <StatusPanel logs={logs} />
      </section>
    </main>
  );
}
