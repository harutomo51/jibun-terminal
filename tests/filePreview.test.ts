import { describe, expect, it } from 'vitest';
import { createPreviewDataUrl, detectPreviewKind, resolvePreviewPath } from '../electron/filePreview/filePreview';

describe('detectPreviewKind', () => {
  it('detects markdown files', () => {
    expect(detectPreviewKind('README.md')).toBe('markdown');
    expect(detectPreviewKind('notes.markdown')).toBe('markdown');
  });

  it('detects html files', () => {
    expect(detectPreviewKind('index.html')).toBe('html');
    expect(detectPreviewKind('page.htm')).toBe('html');
  });

  it('treats source files as code', () => {
    expect(detectPreviewKind('src/App.tsx')).toBe('code');
    expect(detectPreviewKind('script.ps1')).toBe('code');
  });
});

describe('resolvePreviewPath', () => {
  it('resolves a relative path inside the root directory', () => {
    expect(resolvePreviewPath('C:\\repo', 'src\\App.tsx')).toBe('C:\\repo\\src\\App.tsx');
  });

  it('rejects traversal outside the root directory', () => {
    expect(() => resolvePreviewPath('C:\\repo', '..\\secret.txt')).toThrow('outside');
  });

  it('rejects absolute paths from the renderer', () => {
    expect(() => resolvePreviewPath('C:\\repo', 'C:\\Windows\\win.ini')).toThrow('relative');
  });
});

describe('createPreviewDataUrl', () => {
  it('allows scripts in sandboxed html previews so chart libraries can render', () => {
    const dataUrl = createPreviewDataUrl('report.html', '<script>window.rendered = true</script>', 'html');
    const html = decodeURIComponent(dataUrl.replace('data:text/html;charset=utf-8,', ''));

    expect(html).toContain('<iframe sandbox="allow-scripts"');
    expect(html).not.toContain('allow-same-origin');
  });

  it('uses the warm editorial preview design tokens from DESIGN.md', () => {
    const dataUrl = createPreviewDataUrl('README.md', '# Hello', 'markdown');
    const html = decodeURIComponent(dataUrl.replace('data:text/html;charset=utf-8,', ''));

    expect(html).toContain('--preview-canvas: #faf9f5;');
    expect(html).toContain('--preview-primary: #cc785c;');
    expect(html).toContain('--preview-dark: #181715;');
    expect(html).toContain('--font-standard: "Noto Sans JP", "Note Sans JP", system-ui, sans-serif;');
    expect(html).toContain('--font-serif: "Noto Sans JP", "Note Sans JP", serif;');
    expect(html).toContain('--font-mono: "BIZ UDGothic", "Cascadia Mono", Consolas, monospace;');
    expect(html).toContain('--font-number: "Cambria Math", "Noto Sans JP", serif;');
    expect(html).toContain('<article class="markdown preview-card">');
  });

  it('keeps html previews unframed so the document owns its own layout', () => {
    const dataUrl = createPreviewDataUrl('report.html', '<h1>Report</h1>', 'html');
    const html = decodeURIComponent(dataUrl.replace('data:text/html;charset=utf-8,', ''));

    expect(html).toContain('<main class="html-main">');
    expect(html).toContain('<iframe sandbox="allow-scripts"');
    expect(html).not.toContain('<section class="html-preview">');
  });
});
