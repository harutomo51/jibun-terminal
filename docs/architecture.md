# Architecture

## Overview

`fun-terminal-win11` is split into three layers:

- Electron main process: owns the PTY process and IPC handlers.
- Preload script: exposes a minimal `window.terminalApi` bridge.
- React renderer: renders xterm.js, forwards user input, and displays status/errors.
- App and terminal background customization stay in renderer state and CSS custom properties.

## Process Flow

1. Renderer calls `terminal:start`.
2. Main process resolves `pwsh.exe`, then `powershell.exe`.
3. Main process starts the shell through `node-pty`.
4. PTY output is emitted through `terminal:onData`.
5. xterm.js writes user input to `terminal:input`.
6. FitAddon resize events call `terminal:resize`.
7. Window close and app quit call `PtyManager.dispose()`.

## IPC Contract

- `terminal:start`
- `terminal:input`
- `terminal:resize`
- `terminal:restart`
- `terminal:onData`
- `terminal:onExit`

The renderer never receives a generic command execution API.

## Security Notes

- `contextIsolation` is enabled.
- `nodeIntegration` is disabled.
- `sandbox` is enabled.
- The preload bridge exposes only terminal lifecycle/input/resize methods.
- Shell resolution is limited to `pwsh.exe` and `powershell.exe`.
