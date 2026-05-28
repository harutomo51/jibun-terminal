import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { GitCommit, GitLogResult } from './types';

const execFileAsync = promisify(execFile);
const MAX_COMMITS = 200;
const FIELD_SEP = '';
const RECORD_SEP = '';

export function parseGitLogOutput(output: string): GitCommit[] {
  if (!output.trim()) {
    return [];
  }

  return output
    .split(RECORD_SEP)
    .map((record) => record.replace(/^[\r\n]+/, ''))
    .filter((record) => record.length > 0)
    .map((record) => {
      const [hash = '', parents = '', decorations = '', subject = ''] = record.split(FIELD_SEP);
      return {
        hash: hash.trim(),
        parents: parents
          .trim()
          .split(/\s+/)
          .filter((value) => value.length > 0),
        decorations: parseDecorations(decorations),
        subject: subject.trim()
      } satisfies GitCommit;
    })
    .filter((commit) => commit.hash.length > 0);
}

export async function readGitLog(rootPath: string): Promise<GitLogResult> {
  try {
    const rootResult = await execFileAsync('git', ['-C', rootPath, 'rev-parse', '--show-toplevel'], {
      windowsHide: true
    });
    const resolvedRoot = rootResult.stdout.trim() || rootPath;

    const logResult = await execFileAsync(
      'git',
      [
        '-C',
        rootPath,
        'log',
        '--all',
        '--date-order',
        '--decorate=short',
        `--max-count=${MAX_COMMITS}`,
        `--pretty=format:%h${FIELD_SEP}%p${FIELD_SEP}%D${FIELD_SEP}%s${RECORD_SEP}`
      ],
      {
        maxBuffer: 1024 * 1024 * 8,
        windowsHide: true
      }
    );

    return {
      ok: true,
      rootPath: resolvedRoot,
      commits: parseGitLogOutput(logResult.stdout)
    };
  } catch (error) {
    console.error('Failed to read Git log', error);
    return {
      ok: false,
      rootPath,
      error: error instanceof Error ? error.message : 'Git log could not be loaded.'
    };
  }
}

function parseDecorations(value: string): string[] {
  if (!value.trim()) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
