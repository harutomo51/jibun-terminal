interface TerminalKeyLike {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
}

export function shouldForwardTabToPty(event: TerminalKeyLike): boolean {
  return event.key === 'Tab' && !event.altKey && !event.ctrlKey && !event.metaKey;
}
