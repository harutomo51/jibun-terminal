import { Image, Monitor, Palette, SlidersHorizontal, X } from 'lucide-react';

interface AppearanceSettingsProps {
  isOpen: boolean;
  backgroundMode: string;
  customBackgroundColor: string;
  terminalBackgroundColor: string;
  terminalOpacity: number;
  onClose: () => void;
  onCycleBackground: () => void;
  onCustomBackgroundColorChange: (value: string) => void;
  onTerminalBackgroundColorChange: (value: string) => void;
  onTerminalOpacityChange: (value: number) => void;
}

export function AppearanceSettings({
  isOpen,
  backgroundMode,
  customBackgroundColor,
  terminalBackgroundColor,
  terminalOpacity,
  onClose,
  onCycleBackground,
  onCustomBackgroundColorChange,
  onTerminalBackgroundColorChange,
  onTerminalOpacityChange
}: AppearanceSettingsProps): JSX.Element | null {
  if (!isOpen) {
    return null;
  }

  return (
    <section className="appearance-panel" aria-label="Appearance settings">
      <header className="appearance-panel__header">
        <h2>Appearance</h2>
        <button type="button" title="Close appearance settings" onClick={onClose}>
          <X size={17} />
        </button>
      </header>

      <div className="appearance-panel__controls">
        <button type="button" className="appearance-action" title={`Background: ${backgroundMode}`} onClick={onCycleBackground}>
          <Image size={18} />
          <span>{backgroundMode}</span>
        </button>

        <label className="appearance-field" title="App background color">
          <span>
            <Palette size={18} />
            App color
          </span>
          <input
            aria-label="App background color"
            type="color"
            value={customBackgroundColor}
            onChange={(event) => onCustomBackgroundColorChange(event.currentTarget.value)}
          />
        </label>

        <label className="appearance-field" title="Terminal background color">
          <span>
            <Monitor size={18} />
            Terminal color
          </span>
          <input
            aria-label="Terminal background color"
            type="color"
            value={terminalBackgroundColor}
            onChange={(event) => onTerminalBackgroundColorChange(event.currentTarget.value)}
          />
        </label>

        <label className="appearance-field appearance-field--range" title={`Terminal opacity: ${Math.round(terminalOpacity * 100)}%`}>
          <span>
            <SlidersHorizontal size={18} />
            Opacity
          </span>
          <input
            aria-label="Terminal opacity"
            type="range"
            min="0.35"
            max="1"
            step="0.01"
            value={terminalOpacity}
            onChange={(event) => onTerminalOpacityChange(Number(event.currentTarget.value))}
          />
          <strong>{Math.round(terminalOpacity * 100)}%</strong>
        </label>
      </div>
    </section>
  );
}
