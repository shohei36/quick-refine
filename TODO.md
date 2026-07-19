# TODO

開発中のプロダクトとして、今後対応したい項目を整理しています。優先度や粒度は目安です。

## テスト

- [x] Vitest の導入(unit test 実行環境のセットアップ)
- [x] `jsonStore.ts` の読み書き・デフォルト値フォールバックのテスト
- [x] `shared/types.ts`(`getModelOptions` / `DEFAULT_SETTINGS`)のテスト
- [ ] `AIProvider` 実装(anthropicProvider / openaiProvider / geminiProvider)のモックテスト
- [ ] `secureKeys.ts` の暗号化・復号ラウンドトリップテスト
- [ ] `skillsStore.ts` / `settingsStore.ts` の CRUD・永続化テスト(ネストしたオブジェクトのマージ挙動を含む)
- [ ] React コンポーネントの最低限のレンダリングテスト(Vitest + Testing Library)
- [ ] Electron main process / IPC ハンドラーの結合テスト

## CI / 品質ゲート

- [x] GitHub Actions での CI 導入([.github/workflows/ci.yml](.github/workflows/ci.yml)。`main` へのマージ時に フォーマット/Lint/型チェック・ユニットテスト・`npm audit`・Windows インストーラーのビルドを自動実行)
- [ ] CI 上での `npm audit` は現状 high 以上で失敗させているのみ。脆弱性が出た際の対応フロー(無視リスト運用や自動PR等)を整備する
- [ ] Dependabot などによる依存パッケージの自動更新チェック
- [ ] リリース時に生成した Windows インストーラーを GitHub Releases に自動アップロードする(現状は Actions のアーティファクトとして保持するのみ)
- [ ] macOS / Linux ビルドの CI 化(現状 Windows ビルドのみ CI 対象)

## 既知の技術的負債

- [ ] `src/main/store/jsonStore.ts` の `readJsonObject` がシャローマージのため、ネストしたオブジェクトを持つ設定項目を追加する際に同種のバグ(値の欠落)が再発しうる。汎用的なディープマージへの修正を検討する
- [ ] `main.css` 内の `.provider-select` / `.radio-label` が未使用クラスとして残っている(設定画面のプロバイダー選択UI削除に伴うデッドコード)。整理する

## 機能・UX

- [ ] 生成結果やチャット履歴の永続化(現状はアプリ再起動で消える)
- [ ] エラーメッセージの分類・ユーザー向け文言の改善(APIキー未設定・レート制限・ネットワークエラーなどを区別)
- [ ] アプリの自動アップデート対応(`electron-updater` 等)
- [ ] Windows インストーラーのコード署名
- [ ] macOS / Linux 向けの動作検証(現状 Windows のみ検証済み)
- [ ] アクセシビリティ観点の見直し(キーボード操作、スクリーンリーダー対応)

## ドキュメント

- [ ] スキルのカスタマイズ方法(システムプロンプトテンプレートの書き方)についてのドキュメント整備
- [ ] トラブルシューティング(APIキーが通らない、ショートカットが競合する等)のFAQ整備
