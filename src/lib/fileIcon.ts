import type { FileTreeNodeKind } from '../../electron/fileTree/types';

export type FileIconKind =
  | 'folder'
  | 'typescript'
  | 'javascript'
  | 'json'
  | 'markdown'
  | 'html'
  | 'css'
  | 'powershell'
  | 'config'
  | 'image'
  | 'text'
  | 'code'
  | 'file';

export function getFileIconKind(name: string, kind: FileTreeNodeKind): FileIconKind {
  if (kind === 'directory') {
    return 'folder';
  }

  const lowerName = name.toLowerCase();
  const extension = lowerName.includes('.') ? lowerName.slice(lowerName.lastIndexOf('.')) : '';

  if (lowerName === '.gitignore' || lowerName.endsWith('.config.js') || lowerName.endsWith('.config.ts')) {
    return 'config';
  }

  if (extension === '.ts' || extension === '.tsx' || extension === '.d.ts') {
    return 'typescript';
  }

  if (extension === '.js' || extension === '.jsx' || extension === '.mjs' || extension === '.cjs') {
    return 'javascript';
  }

  if (extension === '.json') {
    return 'json';
  }

  if (extension === '.md' || extension === '.markdown' || extension === '.mdx') {
    return 'markdown';
  }

  if (extension === '.html' || extension === '.htm') {
    return 'html';
  }

  if (extension === '.css' || extension === '.scss' || extension === '.sass') {
    return 'css';
  }

  if (extension === '.ps1' || extension === '.psm1' || extension === '.psd1') {
    return 'powershell';
  }

  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'].includes(extension)) {
    return 'image';
  }

  if (['.txt', '.log', '.env'].includes(extension)) {
    return 'text';
  }

  if (['.c', '.cpp', '.cs', '.go', '.java', '.py', '.rs', '.sh', '.xml', '.yaml', '.yml'].includes(extension)) {
    return 'code';
  }

  return 'file';
}
