import type { GitCommit } from '../../electron/gitLog/types';

export interface GitGraphNode {
  hash: string;
  parents: string[];
  decorations: string[];
  subject: string;
  lane: number;
  row: number;
  isMerge: boolean;
}

export interface GitGraphEdge {
  fromLane: number;
  fromRow: number;
  toLane: number;
  toRow: number;
  colorLane: number;
  kind: 'first-parent' | 'merge-parent';
}

export interface GitGraphLayout {
  nodes: GitGraphNode[];
  edges: GitGraphEdge[];
  laneCount: number;
}

export function computeGitGraphLayout(commits: ReadonlyArray<GitCommit>): GitGraphLayout {
  if (commits.length === 0) {
    return { nodes: [], edges: [], laneCount: 0 };
  }

  const hashToIndex = new Map<string, number>();
  commits.forEach((commit, index) => {
    hashToIndex.set(commit.hash, index);
  });

  const openLanes: Array<string | null> = [];
  const nodes: GitGraphNode[] = [];
  let laneCount = 0;

  const allocateLane = (): number => {
    const freeIndex = openLanes.indexOf(null);
    if (freeIndex !== -1) {
      return freeIndex;
    }

    openLanes.push(null);
    return openLanes.length - 1;
  };

  commits.forEach((commit, row) => {
    let lane = openLanes.indexOf(commit.hash);
    if (lane === -1) {
      lane = allocateLane();
    }

    for (let index = 0; index < openLanes.length; index += 1) {
      if (index !== lane && openLanes[index] === commit.hash) {
        openLanes[index] = null;
      }
    }

    if (commit.parents.length > 0) {
      openLanes[lane] = commit.parents[0];
    } else {
      openLanes[lane] = null;
    }

    for (let parentIndex = 1; parentIndex < commit.parents.length; parentIndex += 1) {
      const parentHash = commit.parents[parentIndex];
      if (openLanes.indexOf(parentHash) === -1) {
        const newLane = allocateLane();
        openLanes[newLane] = parentHash;
      }
    }

    laneCount = Math.max(laneCount, openLanes.length, lane + 1);
    nodes.push({
      hash: commit.hash,
      parents: commit.parents,
      decorations: commit.decorations,
      subject: commit.subject,
      lane,
      row,
      isMerge: commit.parents.length > 1
    });
  });

  const edges: GitGraphEdge[] = [];
  nodes.forEach((node) => {
    node.parents.forEach((parentHash, parentIndex) => {
      const parentNodeIndex = hashToIndex.get(parentHash);
      if (parentNodeIndex === undefined) {
        return;
      }

      const parent = nodes[parentNodeIndex];
      const isFirstParent = parentIndex === 0;
      edges.push({
        fromLane: node.lane,
        fromRow: node.row,
        toLane: parent.lane,
        toRow: parent.row,
        colorLane: isFirstParent ? node.lane : parent.lane,
        kind: isFirstParent ? 'first-parent' : 'merge-parent'
      });
    });
  });

  return { nodes, edges, laneCount };
}
