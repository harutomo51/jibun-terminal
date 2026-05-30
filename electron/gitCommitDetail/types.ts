export const GIT_COMMIT_DETAIL_CHANNELS = {
  open: 'gitCommitDetail:open'
} as const;

export interface GitCommitFileChange {
  status: string;
  path: string;
  oldPath?: string;
}

export interface GitCommitDetail {
  hash: string;
  abbrevHash: string;
  authorName: string;
  authorEmail: string;
  authorDate: string;
  committerName: string;
  committerEmail: string;
  commitDate: string;
  parents: string[];
  refs: string[];
  subject: string;
  body: string;
  files: GitCommitFileChange[];
}

export interface GitCommitDetailResult {
  ok: boolean;
  error?: string;
}

export interface GitCommitDetailBridgeApi {
  open: (hash: string, paneId?: string) => Promise<GitCommitDetailResult>;
}
