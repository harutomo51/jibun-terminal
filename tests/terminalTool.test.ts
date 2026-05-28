import { describe, expect, it } from 'vitest';
import { detectTerminalTool, detectTerminalToolFromOutput, terminalOutputHasPromptMarker } from '../src/lib/terminalTool';

describe('detectTerminalTool', () => {
  it('detects Claude Code commands', () => {
    expect(detectTerminalTool('claude')).toBe('claude');
    expect(detectTerminalTool('claude-code .')).toBe('claude');
  });

  it('detects Codex commands', () => {
    expect(detectTerminalTool('codex')).toBe('codex');
    expect(detectTerminalTool('codex --help')).toBe('codex');
  });

  it('detects GitHub Copilot commands', () => {
    expect(detectTerminalTool('gh copilot suggest')).toBe('copilot');
    expect(detectTerminalTool('copilot')).toBe('copilot');
  });

  it('detects Gemini CLI commands', () => {
    expect(detectTerminalTool('gemini')).toBe('gemini');
    expect(detectTerminalTool('gemini-cli')).toBe('gemini');
  });

  it('detects Antigrabity CLI commands', () => {
    expect(detectTerminalTool('agy')).toBe('agy');
    expect(detectTerminalTool('antigrabity-cli')).toBe('agy');
    expect(detectTerminalTool('antigravity-cli')).toBe('agy');
  });

  it('ignores unrelated commands', () => {
    expect(detectTerminalTool('npm test')).toBe('none');
  });
});

describe('terminalOutputHasPromptMarker', () => {
  it('detects the OSC 7 marker emitted by the PowerShell prompt', () => {
    expect(terminalOutputHasPromptMarker('\u001B]7;file:///C:/repo\u0007')).toBe(true);
  });
});

describe('detectTerminalToolFromOutput', () => {
  it('detects Claude Code output', () => {
    expect(detectTerminalToolFromOutput('\u001B[31mClaude Code\u001B[0m v2.1.153')).toBe('claude');
  });

  it('detects Codex output', () => {
    expect(detectTerminalToolFromOutput('OpenAI Codex (v0.134.0)')).toBe('codex');
  });

  it('detects Copilot output', () => {
    expect(detectTerminalToolFromOutput('Copilot v1.0.54 uses AI.')).toBe('copilot');
  });

  it('detects Gemini output', () => {
    expect(detectTerminalToolFromOutput('Gemini CLI ready')).toBe('gemini');
    expect(detectTerminalToolFromOutput('Google Gemini')).toBe('gemini');
  });

  it('detects Antigrabity output', () => {
    expect(detectTerminalToolFromOutput('Antigrabity CLI')).toBe('agy');
    expect(detectTerminalToolFromOutput('Antigravity')).toBe('agy');
  });
});
