# TODO

開発中のプロダクトとして、今後対応したい項目を整理しています。優先度や粒度は目安です。

## テスト

- [ ] Vitest の導入(unit test 実行環境のセットアップ)
- [ ] `AIProvider` 実装(anthropicProvider / openaiProvider / geminiProvider)のモックテスト
- [ ] `secureKeys.ts` の暗号化・復号ラウンドトリップテスト
- [ ] `skillsStore.ts` / `settingsStore.ts` の CRUD・永続化テスト(`jsonStore.ts` のマージ挙動を含む)
- [ ] React コンポーネントの最低限のレンダリングテスト(Vitest + Testing Library)
- [ ] Electron main process / IPC ハンドラーの結合テスト

## CI / 品質ゲート

- [ ] GitHub Actions での CI 導入(`typecheck` / `lint` / `test` を PR ごとに自動実行)
- [ ] `npm run build:win` が CI 上でも通ることの確認(リリース前の健全性チェック)
- [ ] Dependabot などによる依存パッケージの自動更新チェック

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
