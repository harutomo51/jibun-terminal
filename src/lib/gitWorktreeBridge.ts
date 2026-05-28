import type { GitWorktreeBridgeApi } from '../../electron/gitWorktree/types';

export function getGitWorktreeBridge(): GitWorktreeBridgeApi {
  if (!window.gitWorktreeApi) {
    throw new Error('Git worktree preload API is unavailable.');
  }

  return window.gitWorktreeApi;
}
