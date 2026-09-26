# FoodLog 開発ガイド

このファイルは、AIがFoodLogで作業するときの案内板です。詳細なルールや仕様を重複して記載せず、作業内容に応じた参照先を示します。

## プロジェクト構成

- `apps/food-log/`：Expo・React Nativeアプリ
  - `src/`：アプリの実装
  - `tests/`：アプリコードに対応する自動テスト
  - `assets/`：画像、アイコン、フォントなどの静的ファイル
- `backend/`：REST API。技術選定後に実装する
- `infra/`：AWSなどのインフラ定義。インフラ構成決定後に実装する
- `docs/`：要件、技術方針、開発ルール
- `docs/component-map.md`：画面ごとのUIコンポーネント構成
- `docs/plans/apps/food-log/`：FoodLogアプリの実装計画
- `docs/plans/backend/`：バックエンドとローカルDocker環境の実装計画
- `docs/plans/infra/`：AWSなどの本番インフラ実装計画
- `prototype/`：ブラウザ版UIプロトタイプ。製品コードからは使用しない
- `.codex/`：CodexのHookなど、AI開発環境の設定
- `.github/`：Pull RequestテンプレートやGitHub ActionsなどのGitHub設定

## 必須参照資料

作業を始める前に、依頼内容に対応する資料を読むこと。

- 要件やMVP範囲を確認・変更する：`docs/requirements.md`
- 技術選定、ライブラリ追加、開発環境を変更する：`docs/tech-stack.md`
- データベースのスキーマや保存方針を確認・変更する：`docs/database-design.md`
- AWS構成を確認・変更する：`docs/aws-architecture.md`
- アプリコードを実装・変更する：`docs/coding-guidelines.md`
- ディレクトリやファイルの配置を決める：`docs/project-structure.md`
- テストを追加・変更する：`docs/testing-guidelines.md`
- ブランチ、コミット、Pull Requestを操作する：`docs/git-workflow.md`
- FoodLogの機能を実装する：`docs/requirements.md`と、対応する`docs/plans/apps/food-log/`内の実装計画
- バックエンドやローカルDocker環境を実装する：`docs/tech-stack.md`と、対応する`docs/plans/backend/`内の実装計画
- AWSなどの本番インフラを変更する：`docs/tech-stack.md`と、対応する`docs/plans/infra/`内の実装計画
- UIを実装・変更する：対応する実装計画と`prototype/`の該当画面
- UIの構成を確認・変更する：`docs/component-map.md`

複数の項目に該当する場合は、必要な資料を組み合わせて読む。対応する実装計画が存在しない場合は、実装前に作成が必要か判断する。
