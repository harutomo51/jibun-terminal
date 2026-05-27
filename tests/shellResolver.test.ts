import { describe, expect, it } from 'vitest';
import { resolvePowerShellCandidate } from '../electron/terminal/shellResolver';

describe('resolvePowerShellCandidate', () => {
  it('prefers pwsh.exe when both shells are available', () => {
    const shell = resolvePowerShellCandidate({
      exists: (name) => name === 'pwsh.exe' || name === 'powershell.exe'
    });

    expect(shell).toEqual({ name: 'pwsh.exe', displayName: 'PowerShell 7' });
  });

  it('falls back to powershell.exe when pwsh.exe is unavailable', () => {
    const shell = resolvePowerShellCandidate({
      exists: (name) => name === 'powershell.exe'
    });

    expect(shell).toEqual({ name: 'powershell.exe', displayName: 'Windows PowerShell' });
  });

  it('returns null when no supported shell is available', () => {
    const shell = resolvePowerShellCandidate({
      exists: () => false
    });

    expect(shell).toBeNull();
  });
});
