import type { AppLogEntry } from '../App';

interface StatusPanelProps {
  logs: AppLogEntry[];
}

export function StatusPanel({ logs }: StatusPanelProps): JSX.Element {
  return (
    <section className="status-panel" aria-label="terminal status log">
      <h2>Log</h2>
      <div className="status-panel__items">
        {logs.length === 0 ? (
          <p className="panel-empty">起動ログがここに表示されます。</p>
        ) : (
          logs.map((log) => (
            <p className={`status-panel__item status-panel__item--${log.level}`} key={`${log.timestamp}-${log.message}`}>
              <span>{log.timestamp}</span>
              {log.message}
            </p>
          ))
        )}
      </div>
    </section>
  );
}
