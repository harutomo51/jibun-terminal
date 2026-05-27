import { File, Folder, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { FileTreeNode } from '../../electron/fileTree/types';
import { getFilePreviewBridge } from '../lib/filePreviewBridge';
import { getFileTreeBridge } from '../lib/fileTreeBridge';
import { getTerminalBridge } from '../lib/terminalBridge';

interface FilePanelState {
  rootPath: string;
  nodes: FileTreeNode[];
  error: string | null;
  loading: boolean;
}

export function FilePanel(): JSX.Element {
  const [state, setState] = useState<FilePanelState>({
    rootPath: '',
    nodes: [],
    error: null,
    loading: true
  });

  const loadFileTree = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const result = await getFileTreeBridge().list();
      if (!result.ok) {
        setState({
          rootPath: result.rootPath ?? '',
          nodes: [],
          error: result.error ?? 'ファイル一覧を取得できませんでした。',
          loading: false
        });
        return;
      }

      setState({
        rootPath: result.rootPath ?? '',
        nodes: result.nodes ?? [],
        error: null,
        loading: false
      });
    } catch (error) {
      console.error('Renderer file tree loading failed', error);
      setState({
        rootPath: '',
        nodes: [],
        error: error instanceof Error ? error.message : 'ファイル一覧を取得できませんでした。',
        loading: false
      });
    }
  }, []);

  const openPreview = async (node: FileTreeNode) => {
    if (node.kind !== 'file') {
      return;
    }

    try {
      const result = await getFilePreviewBridge().open(node.relativePath);
      if (!result.ok) {
        setState((current) => ({
          ...current,
          error: result.error ?? 'ファイルプレビューを開けませんでした。'
        }));
      }
    } catch (error) {
      console.error('Renderer file preview failed', error);
      setState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : 'ファイルプレビューを開けませんでした。'
      }));
    }
  };

  useEffect(() => {
    void loadFileTree();
  }, [loadFileTree]);

  useEffect(() => {
    const removeCwdListener = getTerminalBridge().onCwdChange(() => {
      void loadFileTree();
    });

    return removeCwdListener;
  }, [loadFileTree]);

  return (
    <section className="file-panel" aria-label="current directory files">
      <div className="panel-header">
        <div>
          <h2>Files</h2>
          <p title={state.rootPath}>{state.rootPath || '現在のディレクトリ'}</p>
        </div>
        <button type="button" title="ファイル一覧を更新" onClick={() => void loadFileTree()}>
          <RefreshCw size={16} />
        </button>
      </div>
      <div className="file-panel__body">
        {state.loading ? <p className="panel-empty">読み込み中...</p> : null}
        {state.error ? <p className="panel-error">{state.error}</p> : null}
        {!state.loading && !state.error && state.nodes.length === 0 ? (
          <p className="panel-empty">表示できるファイルがありません。</p>
        ) : null}
        {!state.loading && !state.error ? <FileTree nodes={state.nodes} onPreview={openPreview} /> : null}
      </div>
    </section>
  );
}

function FileTree({
  nodes,
  depth = 0,
  onPreview
}: {
  nodes: FileTreeNode[];
  depth?: number;
  onPreview: (node: FileTreeNode) => void;
}): JSX.Element {
  return (
    <ul className="file-tree">
      {nodes.map((node) => (
        <li className="file-tree__item" key={node.relativePath}>
          <button
            className={`file-tree__row file-tree__row--${node.kind}`}
            title={node.kind === 'file' ? `${node.relativePath} をプレビュー` : node.relativePath}
            type="button"
            style={{ paddingLeft: `${depth * 12}px` }}
            onClick={() => onPreview(node)}
          >
            {node.kind === 'directory' ? <Folder size={15} /> : <File size={15} />}
            <span>{node.name}</span>
          </button>
          {node.children && node.children.length > 0 ? (
            <FileTree nodes={node.children} depth={depth + 1} onPreview={onPreview} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}
