import type { GitLogBridgeApi } from '../../electron/gitLog/types';

export function getGitLogBridge(): GitLogBridgeApi {
  if (!window.gitLogApi) {
    throw new Error('Git log preload API is unavailable.');
  }

  return window.gitLogApi;
}
