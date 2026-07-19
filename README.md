# Quick Refine

[![CI](https://github.com/shohei36/quick-refine/actions/workflows/ci.yml/badge.svg)](https://github.com/shohei36/quick-refine/actions/workflows/ci.yml)

生成AI(Claude / OpenAI / Gemini)を使って、Slackメッセージやビジネスメールなどの文章をすばやく下書き・推敲できる Windows 向けデスクトップアプリです。トレイに常駐し、グローバルショートカット一発でポップアップを呼び出し、入力→生成→対話形式での修正→コピーまでを最短距離で行えます。

> **Status:** 個人開発中のプロジェクトです。OSS として公開していますが、テストカバレッジや機能はまだ限定的です。詳細は [TODO.md](TODO.md) を参照してください。

## 特徴

- **グローバルショートカットで即起動**: 既定は `Ctrl+Alt+Space`(設定画面から変更可能)。同じキーで表示/非表示を切り替えます。
- **複数の生成AIプロバイダーに対応**: Anthropic Claude / OpenAI / Google Gemini から選択でき、プロバイダーごとにモデルとAPIキーを管理できます。
- **スキル(プロンプトテンプレート)機能**: 「Slackメッセージ」「丁寧なメール」「簡潔な要約」などのプリセットに加え、独自のスキルを作成・編集できます。
- **対話形式での推敲**: 一度生成した文章に対して、チャット形式で追加の修正指示を出せます。
- **APIキーの安全な保管**: Electron の `safeStorage` を使ってOSの資格情報ストアで暗号化して保存し、平文でディスクに保存しません。
- **タスクトレイ常駐**: 通常のウィンドウ操作の邪魔をせず、バックグラウンドで待機します。

## 動作環境

- Windows 10 / 11 (主な検証環境)。macOS 向けのビルドも CI で行っていますが、動作検証は未完了です(未署名のため Gatekeeper 警告が出ます)
- Node.js 20 以上を推奨
- 利用したい生成AIプロバイダーの API キー(Anthropic / OpenAI / Google Gemini のいずれか1つ以上)
  - [Anthropic Console](https://console.anthropic.com/)
  - [OpenAI Platform](https://platform.openai.com/)
  - [Google AI Studio](https://aistudio.google.com/) (Gemini には無料枠があります)

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## セットアップ

### インストール

```bash
$ npm install
```

### 開発モードで起動

```bash
$ npm run dev
```

起動後、初回はアプリ内の設定画面から利用したいプロバイダーのAPIキーを登録してください(APIキーは暗号化されローカルに保存されます。外部に送信されるのは、選択した生成AIプロバイダーのAPIエンドポイントに対してのみです)。

### 型チェック / Lint / フォーマット

```bash
$ npm run typecheck
$ npm run lint
$ npm run format
```

### ユニットテスト

```bash
$ npm run test
```

### CI

`main` ブランチへのマージをトリガーに、GitHub Actions([.github/workflows/ci.yml](.github/workflows/ci.yml))で以下を自動実行します。

- フォーマット/Lint/型チェック(構文チェック)
- ユニットテスト(Vitest)
- `npm audit` によるセキュリティチェック
- Windows / macOS インストーラーのビルドと成果物のアップロード(Actions の Artifacts からダウンロード可能。macOS は未署名のため Gatekeeper の警告が出ます)

### ビルド(配布用パッケージの作成)

```bash
# Windows 向け
$ npm run build:win

# macOS 向け
$ npm run build:mac

# Linux 向け(未検証)
$ npm run build:linux
```

## 技術スタック

- [Electron](https://www.electronjs.org/) + [electron-vite](https://electron-vite.org/)
- [React](https://react.dev/) 19 + TypeScript (strict mode)
- 各種生成AI SDK: `@anthropic-ai/sdk` / `openai` / `@google/genai`

## セキュリティに関する注意

- APIキーは Electron の `safeStorage`(OSの資格情報管理機構)を利用して暗号化した状態でローカルに保存されます。
- 入力した文章および対話内容は、選択した生成AIプロバイダーのAPIに送信されます。各プロバイダーのプライバシーポリシー・利用規約を確認の上でご利用ください。
- APIの利用には各プロバイダー側の従量課金が発生する場合があります。利用状況は各プロバイダーのダッシュボードで確認してください。

## Contributing

Issue や Pull Request を歓迎します。大きな変更を加える場合は、事前に Issue で方向性を相談していただけるとスムーズです。コミット前に `npm run typecheck` と `npm run lint` が通ることを確認してください。

## TODO / 開発ロードマップ

現状の未対応事項は [TODO.md](TODO.md) にまとめています。

## License

[MIT](LICENSE)
