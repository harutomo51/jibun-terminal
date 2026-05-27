import { useCallback, useState } from 'react';
import { StatusPanel } from './components/StatusPanel';
import { TerminalView } from './components/TerminalView';
import { TopBar } from './components/TopBar';
import './styles/terminal.css';

type BackgroundMode = 'aurora' | 'sunset' | 'image';
type OpacityMode = 'solid' | 'soft' | 'clear';

export interface AppLogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'error';
}

const opacityValues: Record<OpacityMode, number> = {
  solid: 0.94,
  soft: 0.78,
  clear: 0.58
};

export default function App(): JSX.Element {
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('aurora');
  const [opacityMode, setOpacityMode] = useState<OpacityMode>('soft');
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
      return 'aurora';
    });
  };

  const cycleOpacity = () => {
    setOpacityMode((current) => {
      if (current === 'solid') return 'soft';
      if (current === 'soft') return 'clear';
      return 'solid';
    });
  };

  const restartTerminal = () => {
    setRestartToken((value) => value + 1);
  };

  return (
    <main
      className={`app-shell app-shell--${backgroundMode}`}
      style={{ '--terminal-opacity': opacityValues[opacityMode] } as React.CSSProperties}
    >
      <div className="app-overlay" />
      <TopBar
        appName="fun-terminal-win11"
        shellName={shellName}
        backgroundMode={backgroundMode}
        opacityMode={opacityMode}
        onCycleBackground={cycleBackground}
        onCycleOpacity={cycleOpacity}
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
