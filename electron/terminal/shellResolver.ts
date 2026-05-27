import { existsSync } from 'node:fs';
import { delimiter, join } from 'node:path';
import type { ShellInfo } from './types';

interface ResolveOptions {
  exists?: (candidate: string) => boolean;
  pathEnv?: string;
}

const CANDIDATES: ShellInfo[] = [
  { name: 'pwsh.exe', displayName: 'PowerShell 7' },
  { name: 'powershell.exe', displayName: 'Windows PowerShell' }
];

export function resolvePowerShellCandidate(options: ResolveOptions = {}): ShellInfo | null {
  const exists = options.exists ?? executableExists;

  for (const candidate of CANDIDATES) {
    if (exists(candidate.name)) {
      return candidate;
    }
  }

  return null;
}

function executableExists(name: string): boolean {
  if (existsSync(name)) {
    return true;
  }

  const pathEnv = process.env.PATH ?? '';
  return pathEnv
    .split(delimiter)
    .filter(Boolean)
    .some((directory) => existsSync(join(directory, name)));
}
