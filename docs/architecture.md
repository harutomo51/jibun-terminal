# Architecture

## Overview

`fun-terminal-win11` is split into three layers:

- Electron main process: owns the PTY process and IPC handlers.
- Preload script: exposes minimal `window.terminalApi` and `window.fileTreeApi` bridges.
- React renderer: renders xterm.js, forwards user input, and displays files/status/errors.
- App and terminal background customization stay in renderer state and CSS custom properties.

## Process Flow

1. Renderer calls `terminal:start`.
2. Main process resolves `pwsh.exe`, then `powershell.exe`.
3. Main process starts the shell through `node-pty`.
4. PTY output is emitted through `terminal:onData`.
5. xterm.js writes user input to `terminal:input`.
6. FitAddon resize events call `terminal:resize`.
7. PowerShell prompt emits an OSC 7 cwd marker, and the main process sends `terminal:onCwdChange`.
8. Renderer calls `fileTree:list` to read the current shell directory tree.
9. Window close and app quit call `PtyManager.dispose()`.

## IPC Contract

- `terminal:start`
- `terminal:input`
- `terminal:resize`
- `terminal:restart`
- `terminal:onData`
- `terminal:onExit`
- `fileTree:list`

The renderer never receives a generic command execution API or arbitrary filesystem API.

## Security Notes

- `contextIsolation` is enabled.
- `nodeIntegration` is disabled.
- `sandbox` is enabled.
- The preload bridge exposes only terminal lifecycle/input/resize methods and a read-only file tree listing method.
- Shell resolution is limited to `pwsh.exe` and `powershell.exe`.
- File tree listing excludes heavy generated directories such as `.git`, `node_modules`, and `out`.
