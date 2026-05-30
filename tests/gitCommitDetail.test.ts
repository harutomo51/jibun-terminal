import { describe, expect, it } from 'vitest';
import {
  isValidCommitHash,
  parseCommitDetail,
  parseCommitFiles
} from '../electron/gitCommitDetail/gitCommitDetail';

const FIELD = '\x1f';

function buildMeta(fields: string[]): string {
  return fields.join(FIELD);
}

describe('isValidCommitHash', () => {
  it('accepts abbreviated and full hex hashes', () => {
    expect(isValidCommitHash('e53a21b')).toBe(true);
    expect(isValidCommitHash('7999af4d2c1b0a9f8e7d6c5b4a3210fedcba9876')).toBe(true);
  });

  it('rejects empty, short, and non-hex values', () => {
    expect(isValidCommitHash('')).toBe(false);
    expect(isValidCommitHash('abc')).toBe(false);
    expect(isValidCommitHash('zzzzzzz')).toBe(false);
    expect(isValidCommitHash('e53a21b; rm -rf /')).toBe(false);
  });
});

describe('parseCommitFiles', () => {
  it('parses status and path from name-status lines', () => {
    const output = 'M\telectron/main.ts\nA\tsrc/lib/gitCommitDetailBridge.ts\nD\told.ts\n';

    expect(parseCommitFiles(output)).toEqual([
      { status: 'M', path: 'electron/main.ts' },
      { status: 'A', path: 'src/lib/gitCommitDetailBridge.ts' },
      { status: 'D', path: 'old.ts' }
    ]);
  });

  it('captures the old path for renames and copies', () => {
    const output = 'R100\told/name.ts\tnew/name.ts\nC75\tsource.ts\tcopy.ts\n';

    expect(parseCommitFiles(output)).toEqual([
      { status: 'R100', oldPath: 'old/name.ts', path: 'new/name.ts' },
      { status: 'C75', oldPath: 'source.ts', path: 'copy.ts' }
    ]);
  });

  it('ignores blank lines and returns empty array for blank output', () => {
    expect(parseCommitFiles('')).toEqual([]);
    expect(parseCommitFiles('\n\n')).toEqual([]);
  });
});

describe('parseCommitDetail', () => {
  it('parses every metadata field and changed files', () => {
    const meta = buildMeta([
      '7999af4d2c1b0a9f8e7d6c5b4a3210fedcba9876',
      '7999af4',
      'Tatsuya Miyazaki',
      'tatsuya.miyazaki@example.com',
      'Sat May 31 12:00:00 2026 +0900',
      'Tatsuya Miyazaki',
      'tatsuya.miyazaki@example.com',
      'Sat May 31 12:05:00 2026 +0900',
      'aaaaaaa bbbbbbb',
      'HEAD -> main, origin/main, tag: v0.1.0',
      'feat: rename project references',
      'Body line one.\nBody line two.\n'
    ]);
    const files = 'M\telectron/main.ts\nA\tREADME.md\n';

    expect(parseCommitDetail(meta, files)).toEqual({
      hash: '7999af4d2c1b0a9f8e7d6c5b4a3210fedcba9876',
      abbrevHash: '7999af4',
      authorName: 'Tatsuya Miyazaki',
      authorEmail: 'tatsuya.miyazaki@example.com',
      authorDate: 'Sat May 31 12:00:00 2026 +0900',
      committerName: 'Tatsuya Miyazaki',
      committerEmail: 'tatsuya.miyazaki@example.com',
      commitDate: 'Sat May 31 12:05:00 2026 +0900',
      parents: ['aaaaaaa', 'bbbbbbb'],
      refs: ['HEAD -> main', 'origin/main', 'tag: v0.1.0'],
      subject: 'feat: rename project references',
      body: 'Body line one.\nBody line two.',
      files: [
        { status: 'M', path: 'electron/main.ts' },
        { status: 'A', path: 'README.md' }
      ]
    });
  });

  it('handles a root commit with no parents, refs, body, or files', () => {
    const meta = buildMeta([
      'cccccccccccccccccccccccccccccccccccccccc',
      'ccccccc',
      'Author',
      'author@example.com',
      'Sat May 31 09:00:00 2026 +0900',
      'Author',
      'author@example.com',
      'Sat May 31 09:00:00 2026 +0900',
      '',
      '',
      'chore: initial commit',
      ''
    ]);

    const detail = parseCommitDetail(meta, '');

    expect(detail.parents).toEqual([]);
    expect(detail.refs).toEqual([]);
    expect(detail.body).toBe('');
    expect(detail.files).toEqual([]);
    expect(detail.subject).toBe('chore: initial commit');
  });
});
