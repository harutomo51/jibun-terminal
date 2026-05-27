# Verification Checklist

Windows 11上で `npm run dev` を実行し、アプリ内のPowerShellプロンプトで確認します。

- [x] `dir` が動く
- [x] `Get-ChildItem` が動く
- [x] `cd` が動く
- [x] `git --version` が動く
- [x] `npm --version` が動く
- [x] 日本語入力ができる
- [x] コピー・貼り付けができる
- [x] ウィンドウリサイズで表示が崩れない
- [x] 背景切替ができる
- [x] 透明度切替ができる
- [x] `Ctrl+C` が効く
- [x] 対話CLIが起動できる
- [x] 終了時にPTYプロセスが残らない

## Notes

- PowerShell 7がある環境では `pwsh.exe` が優先されます。
- PowerShell 7がない環境では `powershell.exe` を使います。
- どちらも見つからない場合は画面上にエラーが表示されます。
