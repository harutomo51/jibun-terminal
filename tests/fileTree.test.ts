import { describe, expect, it } from 'vitest';
import { shouldIncludeFileTreeEntry, sortFileTreeNodes } from '../electron/fileTree/fileTree';
import type { FileTreeNode } from '../electron/fileTree/types';

describe('shouldIncludeFileTreeEntry', () => {
  it('excludes heavy generated directories', () => {
    expect(shouldIncludeFileTreeEntry('node_modules')).toBe(false);
    expect(shouldIncludeFileTreeEntry('.git')).toBe(false);
    expect(shouldIncludeFileTreeEntry('out')).toBe(false);
  });

  it('includes normal files and folders', () => {
    expect(shouldIncludeFileTreeEntry('src')).toBe(true);
    expect(shouldIncludeFileTreeEntry('README.md')).toBe(true);
  });
});

describe('sortFileTreeNodes', () => {
  it('sorts directories before files and then by name', () => {
    const nodes: FileTreeNode[] = [
      { name: 'README.md', relativePath: 'README.md', kind: 'file' },
      { name: 'src', relativePath: 'src', kind: 'directory', children: [] },
      { name: 'docs', relativePath: 'docs', kind: 'directory', children: [] },
      { name: 'package.json', relativePath: 'package.json', kind: 'file' }
    ];

    expect(sortFileTreeNodes(nodes).map((node) => node.name)).toEqual([
      'docs',
      'src',
      'package.json',
      'README.md'
    ]);
  });
});
