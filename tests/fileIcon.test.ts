import { describe, expect, it } from 'vitest';
import { getFileIconKind } from '../src/lib/fileIcon';

describe('getFileIconKind', () => {
  it('detects folders', () => {
    expect(getFileIconKind('src', 'directory')).toBe('folder');
  });

  it('detects common source file types', () => {
    expect(getFileIconKind('App.tsx', 'file')).toBe('typescript');
    expect(getFileIconKind('main.js', 'file')).toBe('javascript');
    expect(getFileIconKind('script.ps1', 'file')).toBe('powershell');
  });

  it('detects document and config file types', () => {
    expect(getFileIconKind('README.md', 'file')).toBe('markdown');
    expect(getFileIconKind('package.json', 'file')).toBe('json');
    expect(getFileIconKind('vite.config.ts', 'file')).toBe('config');
    expect(getFileIconKind('.gitignore', 'file')).toBe('config');
  });
});
