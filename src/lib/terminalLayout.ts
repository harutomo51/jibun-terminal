export type TerminalSplitDirection = 'vertical' | 'horizontal';

export type TerminalLayoutNode = TerminalPaneNode | TerminalSplitNode;

export interface TerminalPaneNode {
  type: 'pane';
  paneId: string;
}

export interface TerminalSplitNode {
  type: 'split';
  direction: TerminalSplitDirection;
  children: [TerminalLayoutNode, TerminalLayoutNode];
}

export function createInitialTerminalLayout(paneId: string): TerminalLayoutNode {
  return { type: 'pane', paneId };
}

export function splitTerminalPane(
  node: TerminalLayoutNode,
  targetPaneId: string,
  newPaneId: string,
  direction: TerminalSplitDirection
): TerminalLayoutNode {
  if (node.type === 'pane') {
    if (node.paneId !== targetPaneId) {
      return node;
    }

    return {
      type: 'split',
      direction,
      children: [
        node,
        { type: 'pane', paneId: newPaneId }
      ]
    };
  }

  return {
    ...node,
    children: [
      splitTerminalPane(node.children[0], targetPaneId, newPaneId, direction),
      splitTerminalPane(node.children[1], targetPaneId, newPaneId, direction)
    ]
  };
}

export function removeTerminalPane(node: TerminalLayoutNode, targetPaneId: string): TerminalLayoutNode | null {
  if (node.type === 'pane') {
    return node.paneId === targetPaneId ? null : node;
  }

  const first = removeTerminalPane(node.children[0], targetPaneId);
  const second = removeTerminalPane(node.children[1], targetPaneId);

  if (!first && !second) {
    return null;
  }

  if (!first) {
    return second;
  }

  if (!second) {
    return first;
  }

  return {
    ...node,
    children: [first, second]
  };
}

export function collectTerminalPaneIds(node: TerminalLayoutNode): string[] {
  if (node.type === 'pane') {
    return [node.paneId];
  }

  return [
    ...collectTerminalPaneIds(node.children[0]),
    ...collectTerminalPaneIds(node.children[1])
  ];
}
