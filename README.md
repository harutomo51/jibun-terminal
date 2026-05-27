# fun-terminal-win11

Windows 11で「PowerShell互換の自作ターミナル」を実現できるか確認するための技術検証MVPです。PowerShellコマンドは再実装せず、Electronメインプロセスから `node-pty` 経由で既存の `pwsh.exe` または `powershell.exe` を起動します。

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

アプリ起動後、PowerShellプロンプトが表示されたら `docs/verification-checklist.md` の項目を順に確認してください。特に `dir`、`Get-ChildItem`、`git --version`、`npm --version`、日本語入力、コピー/貼り付け、`Ctrl+C`、ウィンドウリサイズ、背景切替、ファイル一覧、アプリ終了後のプロセス残存を重点的に見ます。

## 背景カスタム

上部バーの画像アイコンで背景プリセットを切り替えられます。パレットアイコンから任意のアプリ背景色を選ぶと、カスタム背景モードに切り替わります。モニターアイコンからはターミナル面そのものの背景色を変更できます。スライダーではターミナル背景の透明度を35%から100%まで連続的に調整できます。文字の視認性を保つため、透明度は背景レイヤーだけに適用しています。

## サイドパネル

右側のサイドパネルには、現在のアプリ起動ディレクトリ配下のフォルダとファイルを表示します。`node_modules`、`.git`、`out` などの重い生成物は表示対象から除外しています。rendererは直接ファイルシステムを触らず、preload経由の限定APIで一覧を取得します。

ファイルをクリックすると別ウィンドウでプレビューします。MarkdownはHTMLへレンダリングし、HTMLはsandbox iframeで表示し、TypeScriptやPowerShellなどのソースファイルはコード表示します。HTMLプレビューではグラフなどを描画できるように `allow-scripts` を許可しますが、`allow-same-origin` は付けません。プレビューできるのは現在のPowerShell cwd配下の相対パスだけです。

Markdownとコードプレビューの外側UIは `docs/DESIGN.md` の暖色エディトリアル仕様を反映し、クリーム背景、コーラルアクセント、セリフ見出し、ダークコードカードで表示します。

## 既知の制限

- タブ機能はありません。
- SSH接続管理機能はありません。
- AI連携、履歴DB保存、自動アップデート、インストーラー作成は対象外です。
- Windows Terminal相当の完全互換は目指していません。
- 背景画像ファイル本体は同梱していません。
- ファイルツリーは閲覧とプレビュー専用です。
- 1MBを超えるファイルはプレビュー対象外です。
- `npm audit` で依存関係由来の警告が出る場合があります。

## 今後の拡張案

- タブごとのPTY管理
- プロファイル設定
- テーマプリセット保存
- 起動ディレクトリ選択
- ファイルをクリックしてパスを入力する機能
- ショートカット設定
- PTY終了検知と再接続UIの改善

## 開発コマンド

```powershell
npm run typecheck
npm run build
npm test
```
