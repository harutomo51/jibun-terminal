# Architecture

## Overview

`Quarterdeck` is split into three layers:

- Electron main process: owns the PTY process and IPC handlers.
- Preload script: exposes minimal `window.terminalApi`, `window.fileTreeApi`, and `window.filePreviewApi` bridges.
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
9. Renderer calls `filePreview:open` for a selected relative file path.
10. Main validates the path under the current cwd and opens a sandboxed preview window.
11. Window close and app quit call `PtyManager.dispose()`.

## IPC Contract

- `terminal:start`
- `terminal:input`
- `terminal:resize`
- `terminal:restart`
- `terminal:onData`
- `terminal:onExit`
- `fileTree:list`
- `filePreview:open`

The renderer never receives a generic command execution API or arbitrary filesystem API.

## Security Notes

- `contextIsolation` is enabled.
- `nodeIntegration` is disabled.
- `sandbox` is enabled.
- The preload bridge exposes only terminal lifecycle/input/resize methods, a read-only file tree listing method, and a constrained file preview method.
- Shell resolution is limited to `pwsh.exe` and `powershell.exe`.
- File tree listing excludes heavy generated directories such as `.git`, `node_modules`, and `out`.
- File preview rejects absolute paths and traversal outside the current shell directory.
- HTML preview iframes allow scripts for chart rendering but do not grant `allow-same-origin`.
- Markdown and code preview chrome follows the warm editorial design guidance in `docs/DESIGN.md`.
