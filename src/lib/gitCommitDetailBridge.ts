import type { GitCommitDetailBridgeApi } from '../../electron/gitCommitDetail/types';

export function getGitCommitDetailBridge(): GitCommitDetailBridgeApi {
  if (!window.gitCommitDetailApi) {
    throw new Error('Git commit detail preload API is unavailable.');
  }

  return window.gitCommitDetailApi;
}
