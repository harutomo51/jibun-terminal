import { Image, RefreshCw, Sparkles } from 'lucide-react';

interface TopBarProps {
  appName: string;
  shellName: string;
  backgroundMode: string;
  opacityMode: string;
  onCycleBackground: () => void;
  onCycleOpacity: () => void;
  onRestart: () => void;
}

export function TopBar({
  appName,
  shellName,
  backgroundMode,
  opacityMode,
  onCycleBackground,
  onCycleOpacity,
  onRestart
}: TopBarProps): JSX.Element {
  return (
    <header className="top-bar">
      <div className="top-bar__identity">
        <span className="top-bar__app">{appName}</span>
        <span className="top-bar__shell">{shellName}</span>
      </div>
      <div className="top-bar__actions">
        <button type="button" title={`背景: ${backgroundMode}`} onClick={onCycleBackground}>
          <Image size={18} />
        </button>
        <button type="button" title={`透明度: ${opacityMode}`} onClick={onCycleOpacity}>
          <Sparkles size={18} />
        </button>
        <button type="button" title="PowerShellを再起動" onClick={onRestart}>
          <RefreshCw size={18} />
        </button>
      </div>
    </header>
  );
}
