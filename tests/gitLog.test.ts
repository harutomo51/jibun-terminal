import { describe, expect, it } from 'vitest';
import { parseGitLogOutput } from '../electron/gitLog/gitLog';
import { computeGitGraphLayout } from '../src/lib/gitGraphLayout';

const FIELD = '';
const RECORD = '';

function buildRecord(hash: string, parents: string, decorations: string, subject: string): string {
  return `${hash}${FIELD}${parents}${FIELD}${decorations}${FIELD}${subject}${RECORD}`;
}

describe('parseGitLogOutput', () => {
  it('parses hash, parents, decorations, and subject from a single record', () => {
    const output = buildRecord('e53a21b', 'aaaaaaa bbbbbbb', 'HEAD -> main, origin/main, tag: v0.1.0', 'feat: package app');

    expect(parseGitLogOutput(output)).toEqual([
      {
        hash: 'e53a21b',
        parents: ['aaaaaaa', 'bbbbbbb'],
        decorations: ['HEAD -> main', 'origin/main', 'tag: v0.1.0'],
        subject: 'feat: package app'
      }
    ]);
  });

  it('parses multiple records and ignores empty trailing record', () => {
    const output = [
      buildRecord('aaaaaaa', 'bbbbbbb', '', 'feat: one'),
      buildRecord('bbbbbbb', '', '', 'feat: root')
    ].join('');

    expect(parseGitLogOutput(output)).toEqual([
      { hash: 'aaaaaaa', parents: ['bbbbbbb'], decorations: [], subject: 'feat: one' },
      { hash: 'bbbbbbb', parents: [], decorations: [], subject: 'feat: root' }
    ]);
  });

  it('returns empty array for blank output', () => {
    expect(parseGitLogOutput('')).toEqual([]);
    expect(parseGitLogOutput('\n')).toEqual([]);
  });
});

describe('computeGitGraphLayout', () => {
  it('places a linear history on a single lane', () => {
    const layout = computeGitGraphLayout([
      { hash: 'a', parents: ['b'], decorations: [], subject: 'a' },
      { hash: 'b', parents: ['c'], decorations: [], subject: 'b' },
      { hash: 'c', parents: [], decorations: [], subject: 'c' }
    ]);

    expect(layout.laneCount).toBe(1);
    expect(layout.nodes.map((n) => n.lane)).toEqual([0, 0, 0]);
    expect(layout.edges).toHaveLength(2);
    expect(layout.edges.every((edge) => edge.kind === 'first-parent')).toBe(true);
  });

  it('allocates a new lane when a merge introduces a second parent', () => {
    const layout = computeGitGraphLayout([
      { hash: 'm', parents: ['a', 'b'], decorations: [], subject: 'merge' },
      { hash: 'a', parents: ['c'], decorations: [], subject: 'a' },
      { hash: 'b', parents: ['c'], decorations: [], subject: 'b' },
      { hash: 'c', parents: [], decorations: [], subject: 'c' }
    ]);

    const lanesByHash = Object.fromEntries(layout.nodes.map((n) => [n.hash, n.lane]));

    expect(lanesByHash).toEqual({ m: 0, a: 0, b: 1, c: 0 });
    expect(layout.laneCount).toBe(2);

    const mergeEdge = layout.edges.find((edge) => edge.kind === 'merge-parent');
    expect(mergeEdge).toBeDefined();
    expect(mergeEdge?.fromLane).toBe(0);
    expect(mergeEdge?.toLane).toBe(1);
    expect(mergeEdge?.colorLane).toBe(1);
  });

  it('marks merge commits with isMerge flag', () => {
    const layout = computeGitGraphLayout([
      { hash: 'm', parents: ['a', 'b'], decorations: [], subject: 'merge' },
      { hash: 'a', parents: [], decorations: [], subject: 'a' },
      { hash: 'b', parents: [], decorations: [], subject: 'b' }
    ]);

    expect(layout.nodes[0].isMerge).toBe(true);
    expect(layout.nodes[1].isMerge).toBe(false);
  });

  it('reuses freed lanes after a branch ends', () => {
    const layout = computeGitGraphLayout([
      { hash: 'a', parents: ['c'], decorations: [], subject: 'a' },
      { hash: 'b', parents: ['c'], decorations: [], subject: 'b' },
      { hash: 'c', parents: ['d'], decorations: [], subject: 'c' },
      { hash: 'd', parents: [], decorations: [], subject: 'd' }
    ]);

    const lanesByHash = Object.fromEntries(layout.nodes.map((n) => [n.hash, n.lane]));

    expect(lanesByHash.a).toBe(0);
    expect(lanesByHash.b).toBe(1);
    expect(lanesByHash.c).toBe(0);
    expect(lanesByHash.d).toBe(0);
    expect(layout.laneCount).toBe(2);
  });

  it('skips edges to parents outside the requested range', () => {
    const layout = computeGitGraphLayout([
      { hash: 'a', parents: ['missing'], decorations: [], subject: 'a' }
    ]);

    expect(layout.nodes).toHaveLength(1);
    expect(layout.edges).toHaveLength(0);
  });
});
