export const GIT_LOG_CHANNELS = {
  list: 'gitLog:list'
} as const;

export interface GitCommit {
  hash: string;
  parents: string[];
  decorations: string[];
  subject: string;
}

export interface GitLogResult {
  ok: boolean;
  rootPath?: string;
  commits?: GitCommit[];
  error?: string;
}

export interface GitLogBridgeApi {
  list: (paneId?: string) => Promise<GitLogResult>;
}
