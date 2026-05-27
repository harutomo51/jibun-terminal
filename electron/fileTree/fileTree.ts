import type { Dirent } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import type { FileTreeNode, FileTreeResult } from './types';

const EXCLUDED_NAMES = new Set([
  '.git',
  '.vite',
  'dist',
  'dist-electron',
  'node_modules',
  'out'
]);

const MAX_DEPTH = 3;
const MAX_NODES = 220;

export function shouldIncludeFileTreeEntry(name: string): boolean {
  return !EXCLUDED_NAMES.has(name);
}

export function sortFileTreeNodes(nodes: FileTreeNode[]): FileTreeNode[] {
  return [...nodes].sort((left, right) => {
    if (left.kind !== right.kind) {
      return left.kind === 'directory' ? -1 : 1;
    }
    return left.name.localeCompare(right.name, undefined, { sensitivity: 'base' });
  });
}

export async function readFileTree(rootPath = process.cwd()): Promise<FileTreeResult> {
  const resolvedRoot = resolve(rootPath);
  let nodeCount = 0;

  try {
    const nodes = await readDirectory(resolvedRoot, resolvedRoot, 0, () => nodeCount, (value) => {
      nodeCount = value;
    });

    return {
      ok: true,
      rootPath: resolvedRoot,
      nodes
    };
  } catch (error) {
    console.error('Failed to read file tree', error);
    return {
      ok: false,
      rootPath: resolvedRoot,
      error: error instanceof Error ? error.message : 'ファイル一覧の取得に失敗しました。'
    };
  }
}

async function readDirectory(
  rootPath: string,
  directoryPath: string,
  depth: number,
  getNodeCount: () => number,
  setNodeCount: (value: number) => void
): Promise<FileTreeNode[]> {
  if (depth > MAX_DEPTH || getNodeCount() >= MAX_NODES) {
    return [];
  }

  const entries = await readdir(directoryPath, { withFileTypes: true });
  const nodes: FileTreeNode[] = [];

  for (const entry of entries) {
    if (getNodeCount() >= MAX_NODES || !shouldIncludeFileTreeEntry(entry.name)) {
      continue;
    }

    const node = await toFileTreeNode(rootPath, directoryPath, entry, depth, getNodeCount, setNodeCount);
    if (node) {
      setNodeCount(getNodeCount() + 1);
      nodes.push(node);
    }
  }

  return sortFileTreeNodes(nodes);
}

async function toFileTreeNode(
  rootPath: string,
  directoryPath: string,
  entry: Dirent,
  depth: number,
  getNodeCount: () => number,
  setNodeCount: (value: number) => void
): Promise<FileTreeNode | null> {
  const absolutePath = join(directoryPath, entry.name);
  const relativePath = relative(rootPath, absolutePath) || entry.name;

  if (entry.isDirectory()) {
    return {
      name: entry.name,
      relativePath,
      kind: 'directory',
      children: await readDirectory(rootPath, absolutePath, depth + 1, getNodeCount, setNodeCount)
    };
  }

  if (entry.isFile()) {
    return {
      name: entry.name,
      relativePath,
      kind: 'file'
    };
  }

  return null;
}
