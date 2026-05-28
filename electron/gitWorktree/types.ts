export const GIT_WORKTREE_CHANNELS = {
  list: 'gitWorktree:list'
} as const;

export interface GitWorktree {
  path: string;
  head: string | null;
  branch: string | null;
  isBare: boolean;
  isDetached: boolean;
  isLocked: boolean;
  lockReason: string | null;
  isPrunable: boolean;
  prunableReason: string | null;
}

export interface GitWorktreeResult {
  ok: boolean;
  rootPath?: string;
  worktrees?: GitWorktree[];
  error?: string;
}

export interface GitWorktreeBridgeApi {
  list: (paneId?: string) => Promise<GitWorktreeResult>;
}
