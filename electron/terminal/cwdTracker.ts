const OSC7_PATTERN = /\u001b]7;file:\/\/\/([^\u0007\u001b]+)(?:\u0007|\u001b\\)/;

export function extractOsc7Cwd(data: string): string | null {
  const match = data.match(OSC7_PATTERN);
  if (!match) {
    return null;
  }

  try {
    return decodeURIComponent(match[1]).replace(/\//g, '\\');
  } catch {
    return match[1].replace(/\//g, '\\');
  }
}

export function createPowerShellPromptScript(): string {
  return [
    'function global:prompt {',
    '  $cwd = (Get-Location).ProviderPath;',
    '  $uriPath = $cwd -replace "\\\\", "/";',
    '  $esc = [char]27;',
    '  $bel = [char]7;',
    '  [Console]::Write("$esc]7;file:///$uriPath$bel");',
    '  "PS $cwd> "',
    '}'
  ].join(' ');
}
