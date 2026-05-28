import { describe, expect, it } from 'vitest';
import { parseGitWorktreeOutput } from '../electron/gitWorktree/gitWorktree';

describe('parseGitWorktreeOutput', () => {
  it('parses a single worktree on a branch', () => {
    const output = [
      'worktree C:/repos/sample',
      'HEAD 69019a16d2b9d34dca6f9a8c66a8e8b5af6f1a02',
      'branch refs/heads/main',
      ''
    ].join('\n');

    expect(parseGitWorktreeOutput(output)).toEqual([
      {
        path: 'C:/repos/sample',
        head: '69019a16d2b9d34dca6f9a8c66a8e8b5af6f1a02',
        branch: 'main',
        isBare: false,
        isDetached: false,
        isLocked: false,
        lockReason: null,
        isPrunable: false,
        prunableReason: null
      }
    ]);
  });

  it('parses multiple worktrees separated by blank lines', () => {
    const output = [
      'worktree C:/repos/sample',
      'HEAD aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      'branch refs/heads/main',
      '',
      'worktree C:/repos/sample-feature',
      'HEAD bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      'branch refs/heads/feature/login',
      ''
    ].join('\n');

    const result = parseGitWorktreeOutput(output);
    expect(result).toHaveLength(2);
    expect(result[0].branch).toBe('main');
    expect(result[1].branch).toBe('feature/login');
    expect(result[1].path).toBe('C:/repos/sample-feature');
  });

  it('marks a detached HEAD worktree', () => {
    const output = [
      'worktree C:/repos/sample-detached',
      'HEAD ccccccccccccccccccccccccccccccccccccccc',
      'detached',
      ''
    ].join('\n');

    const [entry] = parseGitWorktreeOutput(output);
    expect(entry.isDetached).toBe(true);
    expect(entry.branch).toBeNull();
    expect(entry.head).toBe('ccccccccccccccccccccccccccccccccccccccc');
  });

  it('captures locked and prunable flags with optional reasons', () => {
    const output = [
      'worktree C:/repos/sample-feature',
      'HEAD dddddddddddddddddddddddddddddddddddddddd',
      'branch refs/heads/feature/draft',
      'locked needs review',
      'prunable gitdir file points to non-existent location',
      ''
    ].join('\n');

    const [entry] = parseGitWorktreeOutput(output);
    expect(entry.isLocked).toBe(true);
    expect(entry.lockReason).toBe('needs review');
    expect(entry.isPrunable).toBe(true);
    expect(entry.prunableReason).toBe('gitdir file points to non-existent location');
  });

  it('captures locked flag without reason', () => {
    const output = [
      'worktree C:/repos/sample',
      'HEAD eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      'branch refs/heads/main',
      'locked',
      ''
    ].join('\n');

    const [entry] = parseGitWorktreeOutput(output);
    expect(entry.isLocked).toBe(true);
    expect(entry.lockReason).toBeNull();
  });

  it('marks bare worktrees', () => {
    const output = [
      'worktree C:/repos/sample.git',
      'bare',
      ''
    ].join('\n');

    const [entry] = parseGitWorktreeOutput(output);
    expect(entry.isBare).toBe(true);
    expect(entry.head).toBeNull();
    expect(entry.branch).toBeNull();
  });

  it('returns empty array for blank output', () => {
    expect(parseGitWorktreeOutput('')).toEqual([]);
    expect(parseGitWorktreeOutput('\n\n')).toEqual([]);
  });

  it('tolerates missing trailing newline', () => {
    const output = [
      'worktree C:/repos/sample',
      'HEAD ffffffffffffffffffffffffffffffffffffffff',
      'branch refs/heads/main'
    ].join('\n');

    const result = parseGitWorktreeOutput(output);
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('C:/repos/sample');
  });

  it('ignores unknown lines without losing valid fields', () => {
    const output = [
      'worktree C:/repos/sample',
      'HEAD 1111111111111111111111111111111111111111',
      'branch refs/heads/main',
      'foo bar baz',
      ''
    ].join('\n');

    const [entry] = parseGitWorktreeOutput(output);
    expect(entry.path).toBe('C:/repos/sample');
    expect(entry.branch).toBe('main');
  });
});
