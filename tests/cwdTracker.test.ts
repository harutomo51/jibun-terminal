import { describe, expect, it } from 'vitest';
import { createPowerShellPromptScript, extractOsc7Cwd } from '../electron/terminal/cwdTracker';

describe('extractOsc7Cwd', () => {
  it('extracts a Windows path from an OSC 7 sequence', () => {
    expect(extractOsc7Cwd('\u001b]7;file:///C:/Users/example/project\u0007')).toBe('C:\\Users\\example\\project');
  });

  it('returns null when data does not contain a cwd sequence', () => {
    expect(extractOsc7Cwd('PS C:\\Users> ')).toBeNull();
  });
});

describe('createPowerShellPromptScript', () => {
  it('separates PowerShell statements inside the prompt function', () => {
    const script = createPowerShellPromptScript();

    expect(script).toContain('$cwd = (Get-Location).ProviderPath;');
    expect(script).toContain('$uriPath = $cwd -replace "\\\\", "/";');
    expect(script).toContain('$esc = [char]27;');
    expect(script).toContain('$bel = [char]7;');
    expect(script).toContain('[Console]::Write("$esc]7;file:///$uriPath$bel");');
    expect(script).not.toContain('`e]7');
  });
});
