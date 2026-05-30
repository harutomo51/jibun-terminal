import { BrowserWindow } from 'electron';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { closeWindowOnEscape } from '../window/closeOnEscape';
import type { GitCommitDetail, GitCommitDetailResult, GitCommitFileChange } from './types';

const execFileAsync = promisify(execFile);

const FIELD_SEP = '\x1f';

const META_FORMAT = ['%H', '%h', '%an', '%ae', '%ad', '%cn', '%ce', '%cd', '%P', '%D', '%s', '%b'].join(
  FIELD_SEP
);

export function isValidCommitHash(hash: string): boolean {
  return /^[0-9a-fA-F]{4,40}$/.test(hash.trim());
}

export function parseCommitFiles(output: string): GitCommitFileChange[] {
  return output
    .split('\n')
    .map((line) => line.replace(/\r$/, ''))
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const parts = line.split('\t');
      const status = (parts[0] ?? '').trim();
      if ((status.startsWith('R') || status.startsWith('C')) && parts.length >= 3) {
        return { status, oldPath: parts[1], path: parts[2] } satisfies GitCommitFileChange;
      }
      return { status, path: parts[parts.length - 1] ?? '' } satisfies GitCommitFileChange;
    })
    .filter((change) => change.path.length > 0);
}

export function parseCommitDetail(metaOutput: string, filesOutput: string): GitCommitDetail {
  const fields = metaOutput.split(FIELD_SEP);

  return {
    hash: (fields[0] ?? '').trim(),
    abbrevHash: (fields[1] ?? '').trim(),
    authorName: (fields[2] ?? '').trim(),
    authorEmail: (fields[3] ?? '').trim(),
    authorDate: (fields[4] ?? '').trim(),
    committerName: (fields[5] ?? '').trim(),
    committerEmail: (fields[6] ?? '').trim(),
    commitDate: (fields[7] ?? '').trim(),
    parents: (fields[8] ?? '')
      .trim()
      .split(/\s+/)
      .filter((value) => value.length > 0),
    refs: (fields[9] ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
    subject: (fields[10] ?? '').trim(),
    body: (fields[11] ?? '').replace(/^\n+/, '').replace(/\s+$/, ''),
    files: parseCommitFiles(filesOutput)
  } satisfies GitCommitDetail;
}

export async function openGitCommitDetail(
  rootPath: string,
  hash: string
): Promise<GitCommitDetailResult> {
  if (!isValidCommitHash(hash)) {
    return { ok: false, error: 'Invalid commit hash.' };
  }

  try {
    const trimmedHash = hash.trim();

    const metaResult = await execFileAsync(
      'git',
      ['-C', rootPath, 'show', '--no-patch', '--decorate=short', `--pretty=format:${META_FORMAT}`, trimmedHash],
      { maxBuffer: 1024 * 1024 * 8, windowsHide: true }
    );

    const filesResult = await execFileAsync(
      'git',
      ['-C', rootPath, 'show', '--name-status', '--pretty=format:', '--no-color', trimmedHash],
      { maxBuffer: 1024 * 1024 * 8, windowsHide: true }
    );

    const detail = parseCommitDetail(metaResult.stdout, filesResult.stdout);

    const detailWindow = new BrowserWindow({
      width: 860,
      height: 760,
      minWidth: 520,
      minHeight: 420,
      title: `Commit ${detail.abbrevHash || trimmedHash}`,
      backgroundColor: '#10131a',
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true
      }
    });

    closeWindowOnEscape(detailWindow);

    await detailWindow.loadURL(createDetailDataUrl(detail));
    return { ok: true };
  } catch (error) {
    console.error('Failed to open Git commit detail', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Commit detail could not be loaded.'
    };
  }
}

export function createDetailDataUrl(detail: GitCommitDetail): string {
  return `data:text/html;charset=utf-8,${encodeURIComponent(createDetailHtml(detail))}`;
}

const FILE_STATUS_LABEL: Record<string, string> = {
  A: 'added',
  M: 'modified',
  D: 'deleted',
  R: 'renamed',
  C: 'copied',
  T: 'type changed',
  U: 'unmerged'
};

function fileStatusLabel(status: string): string {
  return FILE_STATUS_LABEL[status.charAt(0)] ?? status;
}

function fileStatusModifier(status: string): string {
  const key = status.charAt(0).toLowerCase();
  return ['a', 'm', 'd', 'r', 'c', 't', 'u'].includes(key) ? key : 'm';
}

function createDetailHtml(detail: GitCommitDetail): string {
  const title = escapeHtml(detail.subject || detail.abbrevHash || detail.hash);
  const refsRow =
    detail.refs.length > 0
      ? `<div class="meta-row"><span class="meta-key">REFS</span><span class="meta-value">${detail.refs
          .map((ref) => `<span class="ref-badge">${escapeHtml(ref)}</span>`)
          .join('')}</span></div>`
      : '';
  const parentsRow =
    detail.parents.length > 0
      ? `<div class="meta-row"><span class="meta-key">PARENTS</span><span class="meta-value">${detail.parents
          .map((parent) => `<code>${escapeHtml(parent)}</code>`)
          .join(' ')}</span></div>`
      : `<div class="meta-row"><span class="meta-key">PARENTS</span><span class="meta-value meta-muted">(root commit)</span></div>`;
  const bodyBlock = detail.body
    ? `<pre class="commit-body">${escapeHtml(detail.body)}</pre>`
    : '';
  const filesBlock =
    detail.files.length > 0
      ? `<ul class="file-list">${detail.files
          .map(
            (file) =>
              `<li class="file-list__item"><span class="file-status file-status--${fileStatusModifier(
                file.status
              )}" title="${escapeHtml(fileStatusLabel(file.status))}">${escapeHtml(
                file.status
              )}</span><span class="file-path">${
                file.oldPath ? `${escapeHtml(file.oldPath)} <span class="file-arrow">&rarr;</span> ` : ''
              }${escapeHtml(file.path)}</span></li>`
          )
          .join('')}</ul>`
      : '<p class="meta-muted">No file changes.</p>';

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(detail.abbrevHash || detail.hash)}</title>
    <style>
      :root {
        color-scheme: light;
        --canvas: #faf9f5;
        --soft: #f5f0e8;
        --card: #efe9de;
        --hairline: #e6dfd8;
        --ink: #141413;
        --body: #3d3d3a;
        --muted: #6c6a64;
        --primary: #cc785c;
        --primary-active: #a9583e;
        --dark: #181715;
        --on-dark: #faf9f5;
        --font-sans: "Noto Sans JP", system-ui, sans-serif;
        --font-serif: "Noto Sans JP", serif;
        --font-mono: "BIZ UDGothic", "Cascadia Mono", Consolas, monospace;
        font-family: var(--font-sans);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: var(--canvas);
        color: var(--body);
        font-size: 15px;
        line-height: 1.6;
      }
      header {
        position: sticky;
        top: 0;
        z-index: 2;
        padding: 20px 28px 16px;
        border-bottom: 1px solid var(--hairline);
        background: rgba(250, 249, 245, .94);
        backdrop-filter: blur(14px);
      }
      header .eyebrow {
        display: inline-block;
        margin-bottom: 8px;
        padding: 2px 10px;
        border-radius: 999px;
        color: var(--on-dark);
        background: var(--primary);
        font-family: var(--font-mono);
        font-size: 12px;
        letter-spacing: 0.04em;
      }
      h1 {
        margin: 0;
        color: var(--ink);
        font-family: var(--font-serif);
        font-size: 22px;
        font-weight: 500;
        line-height: 1.25;
        word-break: break-word;
      }
      main {
        width: min(100%, 980px);
        margin: 0 auto;
        padding: 28px 28px 64px;
      }
      section { margin-bottom: 28px; }
      h2 {
        margin: 0 0 12px;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .meta-grid {
        border: 1px solid var(--hairline);
        border-radius: 12px;
        background: var(--card);
        overflow: hidden;
      }
      .meta-row {
        display: grid;
        grid-template-columns: 110px 1fr;
        gap: 16px;
        padding: 10px 18px;
        border-bottom: 1px solid var(--hairline);
      }
      .meta-row:last-child { border-bottom: 0; }
      .meta-key {
        color: var(--muted);
        font-family: var(--font-mono);
        font-size: 11.5px;
        letter-spacing: 0.04em;
        padding-top: 2px;
      }
      .meta-value { color: var(--ink); word-break: break-word; }
      .meta-value code, .meta-value .mono { font-family: var(--font-mono); font-size: 13px; }
      .meta-muted { color: var(--muted); }
      .ref-badge {
        display: inline-block;
        margin: 0 4px 4px 0;
        padding: 1px 9px;
        border-radius: 999px;
        background: var(--soft);
        color: var(--primary-active);
        font-family: var(--font-mono);
        font-size: 12px;
      }
      .commit-body {
        margin: 0;
        padding: 18px 20px;
        border: 1px solid var(--hairline);
        border-radius: 12px;
        background: var(--soft);
        color: var(--body);
        font-family: var(--font-mono);
        font-size: 13.5px;
        line-height: 1.7;
        white-space: pre-wrap;
        word-break: break-word;
      }
      .file-list {
        margin: 0;
        padding: 0;
        list-style: none;
        border: 1px solid var(--hairline);
        border-radius: 12px;
        overflow: hidden;
      }
      .file-list__item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 16px;
        border-bottom: 1px solid var(--hairline);
        background: var(--card);
      }
      .file-list__item:last-child { border-bottom: 0; }
      .file-status {
        flex-shrink: 0;
        display: inline-grid;
        place-items: center;
        min-width: 30px;
        height: 20px;
        padding: 0 6px;
        border-radius: 6px;
        font-family: var(--font-mono);
        font-size: 11.5px;
        font-weight: 700;
        color: var(--on-dark);
        background: var(--muted);
      }
      .file-status--a { background: #157057; }
      .file-status--m { background: #b87333; }
      .file-status--d { background: #a93f3f; }
      .file-status--r { background: #4f6ea9; }
      .file-status--c { background: #6a5aa9; }
      .file-status--t { background: #7a7a52; }
      .file-path {
        font-family: var(--font-mono);
        font-size: 13px;
        color: var(--ink);
        word-break: break-all;
      }
      .file-arrow { color: var(--muted); }
      .file-count { color: var(--muted); font-weight: 400; }
    </style>
  </head>
  <body>
    <header>
      <span class="eyebrow">${escapeHtml(detail.abbrevHash || detail.hash)}</span>
      <h1>${title}</h1>
    </header>
    <main>
      <section>
        <h2>Commit</h2>
        <div class="meta-grid">
          <div class="meta-row"><span class="meta-key">SHA</span><span class="meta-value mono">${escapeHtml(
            detail.hash
          )}</span></div>
          <div class="meta-row"><span class="meta-key">AUTHOR</span><span class="meta-value">${escapeHtml(
            detail.authorName
          )} <span class="meta-muted">&lt;${escapeHtml(detail.authorEmail)}&gt;</span></span></div>
          <div class="meta-row"><span class="meta-key">AUTHOR TIME</span><span class="meta-value">${escapeHtml(
            detail.authorDate
          )}</span></div>
          <div class="meta-row"><span class="meta-key">COMMITTER</span><span class="meta-value">${escapeHtml(
            detail.committerName
          )} <span class="meta-muted">&lt;${escapeHtml(detail.committerEmail)}&gt;</span></span></div>
          <div class="meta-row"><span class="meta-key">COMMIT TIME</span><span class="meta-value">${escapeHtml(
            detail.commitDate
          )}</span></div>
          ${parentsRow}
          ${refsRow}
        </div>
      </section>
      ${bodyBlock ? `<section><h2>Message</h2>${bodyBlock}</section>` : ''}
      <section>
        <h2>Changed Files <span class="file-count">(${detail.files.length})</span></h2>
        ${filesBlock}
      </section>
    </main>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
