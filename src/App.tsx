import { useCallback, useEffect, useState } from 'react';
import { AppearanceSettings } from './components/AppearanceSettings';
import { FilePanel } from './components/FilePanel';
import { StatusPanel } from './components/StatusPanel';
import { TerminalView } from './components/TerminalView';
import { getAppearanceBridge } from './lib/appearanceBridge';
import { normalizeHexColor } from './lib/backgroundColor';
import { normalizeOpacity } from './lib/opacity';
import { getTerminalBridge } from './lib/terminalBridge';
import {
  collectTerminalPaneIds,
  createInitialTerminalLayout,
  removeTerminalPane,
  splitTerminalPane,
  type TerminalLayoutNode,
  type TerminalSplitDirection
} from './lib/terminalLayout';
import './styles/terminal.css';

type BackgroundMode = 'aurora' | 'sunset' | 'image' | 'custom';

export interface AppLogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'error';
}

interface TerminalPane {
  id: string;
  shellName: string;
}

export default function App(): JSX.Element {
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('aurora');
  const [customBackgroundColor, setCustomBackgroundColor] = useState('#1f6feb');
  const [terminalBackgroundColor, setTerminalBackgroundColor] = useState('#05070d');
  const [terminalOpacity, setTerminalOpacity] = useState(0.78);
  const [logs, setLogs] = useState<AppLogEntry[]>([]);
  const [isAppearanceOpen, setAppearanceOpen] = useState(false);
  const [panes, setPanes] = useState<TerminalPane[]>([{ id: 'pane-1', shellName: 'Not started' }]);
  const [activePaneId, setActivePaneId] = useState('pane-1');
  const [terminalLayout, setTerminalLayout] = useState<TerminalLayoutNode>(() => createInitialTerminalLayout('pane-1'));

  const addLog = useCallback((message: string, level: AppLogEntry['level'] = 'info') => {
    setLogs((current) => [
      { timestamp: new Date().toLocaleTimeString(), message, level },
      ...current
    ].slice(0, 8));
  }, []);

  const updatePaneShell = useCallback((paneId: string, shellName: string) => {
    setPanes((current) => current.map((pane) => (pane.id === paneId ? { ...pane, shellName } : pane)));
  }, []);

  const splitPane = useCallback((paneId: string, direction: TerminalSplitDirection) => {
    const newPaneId = `pane-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    setTerminalLayout((current) => splitTerminalPane(current, paneId, newPaneId, direction));
    setPanes((current) => {
      const index = current.findIndex((pane) => pane.id === paneId);
      const newPane = { id: newPaneId, shellName: 'Not started' };
      if (index === -1) {
        return [...current, newPane];
      }

      return [
        ...current.slice(0, index + 1),
        newPane,
        ...current.slice(index + 1)
      ];
    });
    setActivePaneId(newPaneId);
  }, []);

  const closePane = useCallback((paneId: string) => {
    if (panes.length <= 1) {
      return;
    }

    void getTerminalBridge().close(paneId).catch((error: unknown) => {
      console.error('Renderer terminal close IPC failed', error);
      addLog('Terminal pane close failed.', 'error');
    });

    setTerminalLayout((current) => {
      const next = removeTerminalPane(current, paneId) ?? current;
      const nextPaneIds = collectTerminalPaneIds(next);
      if (activePaneId === paneId) {
        setActivePaneId(nextPaneIds[0]);
      }
      return next;
    });
    setPanes((current) => current.filter((pane) => pane.id !== paneId));
  }, [activePaneId, addLog, panes.length]);

  const renderTerminalLayout = useCallback((node: TerminalLayoutNode, paneOrder: string[]): JSX.Element => {
    if (node.type === 'split') {
      return (
        <div className={`terminal-split terminal-split--${node.direction}`}>
          {renderTerminalLayout(node.children[0], paneOrder)}
          {renderTerminalLayout(node.children[1], paneOrder)}
        </div>
      );
    }

    const pane = panes.find((item) => item.id === node.paneId);
    const paneIndex = paneOrder.indexOf(node.paneId);

    return (
      <TerminalView
        key={node.paneId}
        paneId={node.paneId}
        title={`Pane ${paneIndex + 1} - ${pane?.shellName ?? 'Not started'}`}
        restartToken={0}
        isActive={node.paneId === activePaneId}
        canClose={panes.length > 1}
        onActivate={setActivePaneId}
        onClose={closePane}
        onShellChange={updatePaneShell}
        onLog={addLog}
        onSplit={splitPane}
      />
    );
  }, [activePaneId, addLog, closePane, panes, splitPane, updatePaneShell]);

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

  const paneOrder = collectTerminalPaneIds(terminalLayout);

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
        <div className="terminal-layout-root">
          {renderTerminalLayout(terminalLayout, paneOrder)}
        </div>
        <aside className="side-panel">
          <FilePanel activePaneId={activePaneId} />
          <StatusPanel logs={logs} />
        </aside>
      </section>
    </main>
  );
}
