import { useCallback, useEffect, useState } from 'react';
import { AppearanceSettings } from './components/AppearanceSettings';
import { FilePanel } from './components/FilePanel';
import { StatusPanel } from './components/StatusPanel';
import { TerminalView } from './components/TerminalView';
import { getAppearanceBridge } from './lib/appearanceBridge';
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
  const [logs, setLogs] = useState<AppLogEntry[]>([]);
  const [isAppearanceOpen, setAppearanceOpen] = useState(false);

  const addLog = useCallback((message: string, level: AppLogEntry['level'] = 'info') => {
    setLogs((current) => [
      { timestamp: new Date().toLocaleTimeString(), message, level },
      ...current
    ].slice(0, 8));
  }, []);

  const ignoreShellChange = useCallback(() => undefined, []);

  const cycleBackground = useCallback(() => {
    setBackgroundMode((current) => {
      if (current === 'aurora') return 'sunset';
      if (current === 'sunset') return 'image';
      if (current === 'image') return 'custom';
      return 'aurora';
    });
  }, []);

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

  useEffect(() => {
    try {
      const bridge = getAppearanceBridge();
      return bridge.onCommand((payload) => {
        if (payload.command === 'open-settings') {
          setAppearanceOpen(true);
          return;
        }

        if (payload.command === 'cycle-background') {
          cycleBackground();
          setAppearanceOpen(true);
        }
      });
    } catch (error) {
      console.error('Failed to initialize appearance menu bridge', error);
      addLog('Appearance menu bridge is unavailable.', 'error');
      return undefined;
    }
  }, [addLog, cycleBackground]);

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
      <AppearanceSettings
        isOpen={isAppearanceOpen}
        backgroundMode={backgroundMode}
        customBackgroundColor={customBackgroundColor}
        terminalBackgroundColor={terminalBackgroundColor}
        terminalOpacity={terminalOpacity}
        onClose={() => setAppearanceOpen(false)}
        onCycleBackground={cycleBackground}
        onCustomBackgroundColorChange={updateCustomBackgroundColor}
        onTerminalBackgroundColorChange={updateTerminalBackgroundColor}
        onTerminalOpacityChange={updateTerminalOpacity}
      />
      <section className="workspace">
        <TerminalView
          restartToken={0}
          onShellChange={ignoreShellChange}
          onLog={addLog}
        />
        <aside className="side-panel">
          <FilePanel />
          <StatusPanel logs={logs} />
        </aside>
      </section>
    </main>
  );
}
