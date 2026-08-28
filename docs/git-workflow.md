# Git運用ルール

個人開発向けに、`main` を安定した状態に保ちながら、作業内容を確認してから取り込むためのルールです。

## ブランチ

- `main` は常に起動・検証できる状態を維持する
- `main` へ直接コミット、直接pushしない
- 作業を始めるときは、最新の `main` から目的ごとのブランチを作る
- 1つのブランチには1つの目的だけを含める

ブランチ名には、作業の種類を表す接頭辞を付けます。

- `feat/meal-entry` — 機能追加
- `fix/weight-validation` — 不具合修正
- `chore/update-expo` — 設定、依存関係、開発環境の変更
- `docs/update-requirements` — ドキュメント変更

## 開発の流れ

```bash
git switch main
git pull --ff-only
git switch -c feat/example
```

実装後は、変更内容に応じた検証を行います。

```bash
make lint
make typecheck
make test
```

検証が完了したら、作業ブランチをpushしてGitHubでPull Requestを作成します。

```bash
git push -u origin feat/example
```

Pull Requestでは、次の内容を確認します。

- 変更の目的と差分が一致している
- 不要なファイルや秘密情報が含まれていない
- 必要なテストが追加され、検証が成功している
- UI変更には必要に応じてスクリーンショットがある

確認後に `main` へマージし、不要になった作業ブランチを削除します。

## コミット

コミットは後から変更理由を追える大きさに分け、短い命令形のメッセージを使用します。

```text
feat: add meal entry form
fix: reject invalid weight values
test: cover empty meal validation
docs: update Git workflow
chore: update Expo dependencies
```

## 当面使用しないもの

個人開発の現段階では、`develop` やリリース専用ブランチは作りません。並行開発やリリース管理が複雑になった時点で追加を検討します。
