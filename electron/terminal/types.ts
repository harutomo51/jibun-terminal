export const TERMINAL_CHANNELS = {
  start: 'terminal:start',
  input: 'terminal:input',
  resize: 'terminal:resize',
  restart: 'terminal:restart',
  onData: 'terminal:onData',
  onExit: 'terminal:onExit'
} as const;

export type TerminalChannel = (typeof TERMINAL_CHANNELS)[keyof typeof TERMINAL_CHANNELS];

export interface ShellInfo {
  name: 'pwsh.exe' | 'powershell.exe';
  displayName: 'PowerShell 7' | 'Windows PowerShell';
}

export interface TerminalStartResult {
  ok: boolean;
  shell?: ShellInfo;
  error?: string;
}

export interface TerminalResizePayload {
  cols: number;
  rows: number;
}

export interface TerminalExitPayload {
  exitCode: number | null;
  signal?: number;
}

export interface TerminalBridgeApi {
  start: () => Promise<TerminalStartResult>;
  input: (data: string) => Promise<void>;
  resize: (payload: TerminalResizePayload) => Promise<void>;
  restart: () => Promise<TerminalStartResult>;
  onData: (callback: (data: string) => void) => () => void;
  onExit: (callback: (payload: TerminalExitPayload) => void) => () => void;
}
