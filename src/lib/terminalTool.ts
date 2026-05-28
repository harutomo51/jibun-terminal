export type TerminalTool = 'none' | 'claude' | 'codex' | 'copilot' | 'gemini' | 'agy';

export function detectTerminalTool(command: string): TerminalTool {
  const normalized = command.trim().toLowerCase();
  if (!normalized) {
    return 'none';
  }

  const tokens = normalized.split(/\s+/);
  const executable = stripCommandPrefix(tokens[0]);

  if (executable === 'claude' || executable === 'claude-code') {
    return 'claude';
  }

  if (executable === 'codex') {
    return 'codex';
  }

  if (executable === 'copilot' || executable === 'github-copilot') {
    return 'copilot';
  }

  if ((executable === 'gh' || executable === 'github') && tokens[1] === 'copilot') {
    return 'copilot';
  }

  if (executable === 'gemini' || executable === 'gemini-cli') {
    return 'gemini';
  }

  if (executable === 'agy' || executable === 'antigrabity-cli' || executable === 'antigravity-cli') {
    return 'agy';
  }

  return 'none';
}

export function terminalOutputHasPromptMarker(data: string): boolean {
  return data.includes('\u001B]7;file:///') || data.includes('\x1B]7;file:///');
}

export function detectTerminalToolFromOutput(data: string): TerminalTool {
  const normalized = stripAnsi(data).toLowerCase();

  if (normalized.includes('claude code')) {
    return 'claude';
  }

  if (normalized.includes('openai codex') || normalized.includes(' codex ')) {
    return 'codex';
  }

  if (/\bcopilot\s+v\d/i.test(normalized) || normalized.includes('copilot uses ai')) {
    return 'copilot';
  }

  if (normalized.includes('gemini cli') || normalized.includes('google gemini')) {
    return 'gemini';
  }

  if (normalized.includes('antigrabity') || normalized.includes('antigravity') || /\bagy\b/.test(normalized)) {
    return 'agy';
  }

  return 'none';
}

function stripCommandPrefix(value: string): string {
  return value.replace(/^(&|\.)\\?/, '').replace(/\.(exe|cmd|bat|ps1)$/i, '');
}

function stripAnsi(value: string): string {
  return value
    .replace(/\x1B\][^\x07]*(\x07|\x1B\\)/g, '')
    .replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');
}
