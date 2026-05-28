# Quarterdeck Agent Guide

## Project Purpose

This repository is a feasibility-study MVP for a Windows 11 desktop terminal UI that runs the existing PowerShell runtime inside a custom Electron interface. The priority is to verify PTY integration, PowerShell compatibility, IME behavior, resize handling, copy/paste, visual customization, and child-process cleanup.

Do not reimplement PowerShell commands. The app must launch `pwsh.exe` when available and fall back to `powershell.exe` through a PTY.

## Tech Stack

- Windows 11
- Electron
- TypeScript
- React
- Vite / electron-vite
- xterm.js (`@xterm/xterm`)
- `@xterm/addon-fit`
- `@xterm/addon-web-links`
- `node-pty`

## Commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run typecheck`
- `npm test`

## Test Policy

- Keep core behavior testable outside the UI where practical.
- Prioritize tests for shell resolution, IPC contracts, and process lifecycle helpers.
- Manual verification is required for PTY behavior, Japanese IME input, copy/paste, resize, and interactive CLI behavior on Windows 11.

## Windows 11 Assumption

This project targets Windows 11 first. Platform-specific code should be isolated and named clearly. Cross-platform support is not a goal for this MVP.

## Compatibility Priority

PowerShell compatibility is the highest priority. Prefer passing bytes between xterm.js and the PTY faithfully over adding custom command behavior.

## Security Notes

- Use `contextIsolation: true`.
- Use `nodeIntegration: false`.
- Prefer `sandbox: true` when compatible with preload IPC.
- Expose only a minimal terminal API from preload.
- Do not expose arbitrary command execution to the renderer.
- Only launch `pwsh.exe` or `powershell.exe`.
- Do not log environment variables, tokens, or secrets.
- Do not add external URL opening behavior in this MVP.

## Change Rules

- Keep PTY lifecycle logic out of React components.
- Keep renderer access to Electron/Node behind preload APIs.
- Add focused tests for new pure logic.
- Keep UI changes scoped to the MVP verification goals.
- Document manual verification steps in `docs/verification-checklist.md`.
