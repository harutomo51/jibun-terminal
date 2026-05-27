import { Image, Monitor, Palette, RefreshCw, SlidersHorizontal } from 'lucide-react';

interface TopBarProps {
  appName: string;
  shellName: string;
  backgroundMode: string;
  customBackgroundColor: string;
  terminalBackgroundColor: string;
  terminalOpacity: number;
  onCycleBackground: () => void;
  onCustomBackgroundColorChange: (value: string) => void;
  onTerminalBackgroundColorChange: (value: string) => void;
  onTerminalOpacityChange: (value: number) => void;
  onRestart: () => void;
}

export function TopBar({
  appName,
  shellName,
  backgroundMode,
  customBackgroundColor,
  terminalBackgroundColor,
  terminalOpacity,
  onCycleBackground,
  onCustomBackgroundColorChange,
  onTerminalBackgroundColorChange,
  onTerminalOpacityChange,
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
        <label className="color-picker" title="アプリ背景色を選択">
          <Palette size={18} />
          <input
            aria-label="アプリ背景色"
            type="color"
            value={customBackgroundColor}
            onChange={(event) => onCustomBackgroundColorChange(event.currentTarget.value)}
          />
        </label>
        <label className="color-picker" title="ターミナル背景色を選択">
          <Monitor size={18} />
          <input
            aria-label="ターミナル背景色"
            type="color"
            value={terminalBackgroundColor}
            onChange={(event) => onTerminalBackgroundColorChange(event.currentTarget.value)}
          />
        </label>
        <label className="opacity-slider" title={`ターミナル透明度: ${Math.round(terminalOpacity * 100)}%`}>
          <SlidersHorizontal size={18} />
          <input
            aria-label="ターミナル透明度"
            type="range"
            min="0.35"
            max="1"
            step="0.01"
            value={terminalOpacity}
            onChange={(event) => onTerminalOpacityChange(Number(event.currentTarget.value))}
          />
          <span>{Math.round(terminalOpacity * 100)}%</span>
        </label>
        <button type="button" title="PowerShellを再起動" onClick={onRestart}>
          <RefreshCw size={18} />
        </button>
      </div>
    </header>
  );
}
