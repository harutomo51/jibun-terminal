# fun-terminal-win11

Windows 11で「PowerShell互換の自作ターミナル」が作れるかを確認するための技術検証MVPです。PowerShellコマンドは再実装せず、Electronメインプロセスから `node-pty` 経由で既存の `pwsh.exe` または `powershell.exe` を起動します。

## 技術スタック

- Electron
- TypeScript
- React
- Vite / electron-vite
- xterm.js
- node-pty
- Windows 11

## 前提

- Windows 11での動作確認を前提にしています。
- PowerShell 7が見つかれば `pwsh.exe` を使います。
- 見つからない場合は `powershell.exe` にフォールバックします。

## セットアップ

```powershell
npm install
```

## 起動

```powershell
npm run dev
```

## 検証方法

アプリ起動後、PowerShellプロンプトが表示されたら `docs/verification-checklist.md` の項目を順に確認してください。特に `dir`、`Get-ChildItem`、`git --version`、`npm --version`、日本語入力、コピー/貼り付け、`Ctrl+C`、ウィンドウリサイズ、アプリ終了後のプロセス残存を重点的に見ます。

## 既知の制限

- タブ機能はありません。
- SSH接続管理機能はありません。
- AI連携、履歴DB保存、自動アップデート、インストーラー作成は対象外です。
- Windows Terminal相当の完全互換は目指していません。
- 背景画像は配置先だけ用意しており、実画像は同梱していません。
- `npm audit` で依存関係由来の警告が出る場合があります。

## 今後の拡張案

- タブごとのPTY管理
- プロファイル設定
- テーマプリセット
- 起動ディレクトリ選択
- ショートカット設定
- PTY終了検知と再接続UIの改善

## 開発コマンド

```powershell
npm run typecheck
npm run build
npm test
```
