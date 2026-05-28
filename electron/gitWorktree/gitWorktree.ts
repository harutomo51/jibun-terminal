import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { GitWorktree, GitWorktreeResult } from './types';

const execFileAsync = promisify(execFile);

function createEmptyEntry(path: string): GitWorktree {
  return {
    path,
    head: null,
    branch: null,
    isBare: false,
    isDetached: false,
    isLocked: false,
    lockReason: null,
    isPrunable: false,
    prunableReason: null
  };
}

function shortenBranchRef(ref: string): string {
  return ref.replace(/^refs\/heads\//, '');
}

export function parseGitWorktreeOutput(output: string): GitWorktree[] {
  if (!output.trim()) {
    return [];
  }

  const worktrees: GitWorktree[] = [];
  let current: GitWorktree | null = null;

  const finalize = () => {
    if (current) {
      worktrees.push(current);
      current = null;
    }
  };

  for (const rawLine of output.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (line.length === 0) {
      finalize();
      continue;
    }

    const separatorIndex = line.indexOf(' ');
    const key = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
    const value = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1);

    if (key === 'worktree') {
      finalize();
      current = createEmptyEntry(value);
      continue;
    }

    if (!current) {
      continue;
    }

    if (key === 'HEAD') {
      current.head = value || null;
      continue;
    }
    if (key === 'branch') {
      current.branch = value ? shortenBranchRef(value) : null;
      continue;
    }
    if (key === 'bare') {
      current.isBare = true;
      continue;
    }
    if (key === 'detached') {
      current.isDetached = true;
      current.branch = null;
      continue;
    }
    if (key === 'locked') {
      current.isLocked = true;
      current.lockReason = value || null;
      continue;
    }
    if (key === 'prunable') {
      current.isPrunable = true;
      current.prunableReason = value || null;
      continue;
    }
  }

  finalize();
  return worktrees;
}

export async function readGitWorktrees(rootPath: string): Promise<GitWorktreeResult> {
  try {
    const rootResult = await execFileAsync('git', ['-C', rootPath, 'rev-parse', '--show-toplevel'], {
      windowsHide: true
    });
    const resolvedRoot = rootResult.stdout.trim() || rootPath;

    const listResult = await execFileAsync('git', ['-C', rootPath, 'worktree', 'list', '--porcelain'], {
      maxBuffer: 1024 * 1024 * 4,
      windowsHide: true
    });

    return {
      ok: true,
      rootPath: resolvedRoot,
      worktrees: parseGitWorktreeOutput(listResult.stdout)
    };
  } catch (error) {
    console.error('Failed to read Git worktrees', error);
    return {
      ok: false,
      rootPath,
      error: error instanceof Error ? error.message : 'Git worktrees could not be loaded.'
    };
  }
}
