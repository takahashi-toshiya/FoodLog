# FoodLog

食事、身体、トレーニングの記録を統合し、ボディメイクを総合的に管理するアプリを目指すプロジェクトです。

現在は、Expoを使用したReact Nativeアプリ、NestJSバックエンド、ブラウザ版UIプロトタイプを管理しています。インフラは、今後実装するための配置先だけを用意しています。

## 構成

- `apps/food-log/` — Expo・React Nativeアプリ
- `backend/` — NestJS REST APIとローカルDocker環境
- `infra/` — AWSなどのインフラ定義（未実装）
- `docs/` — プロジェクト全体の資料
- `prototype/` — ブラウザ版UIプロトタイプ

## ドキュメント

- `docs/requirements.md` — 食事管理アプリの要件定義書
- `docs/tech-stack.md` — 技術構成
- `docs/coding-guidelines.md` — コーディング規約
- `docs/project-structure.md` — ディレクトリ構成と責務
- `docs/testing-guidelines.md` — テスト方針
- `docs/git-workflow.md` — Git運用ルール

## 開発環境

- Node.js 22 LTS
- npm
- iOS Simulator、Android Emulator、またはExpo対応の実機

nvmを使用する場合は、リポジトリ直下でプロジェクト指定のNode.jsへ切り替えます。

```bash
nvm use
```

macOSでHomebrewの `node@22` を使用する場合、現在のシェルで次を実行します。

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
```

### セットアップ

```bash
npm run setup
```

FoodLogアプリだけをセットアップする場合は、`npm run setup:app`を使用します。

### 起動方法

```bash
npm run dev
```

Expo起動後、`i` でiOS Simulator、`a` でAndroid Emulator、表示されたQRコードから実機を起動できます。

### 検証

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## ブラウザ版UIプロトタイプ

```bash
npm --prefix prototype ci
npm run prototype
```

プロトタイプの詳細は `prototype/README.md` を参照してください。

## バックエンド

### セットアップ

```bash
npm run setup:backend
```

### 起動・停止

```bash
npm run backend:start
npm run backend:stop
```

起動後は、APIが `http://localhost:3001`、PostgreSQLが `localhost:5432` で利用できます。`GET http://localhost:3001/health` が次のレスポンスを返せば、APIとDBの両方が正常です。

```json
{
  "status": "ok",
  "database": "ok"
}
```

APIのログを継続して確認する場合は `npm run backend:logs` を使用します。

接続情報を変更する場合は `backend/.env.example` を `backend/.env` へコピーして編集します。`backend/.env` はGit管理に含まれません。
