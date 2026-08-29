# FoodLog

食事、身体、トレーニングの記録を統合し、ボディメイクを総合的に管理するアプリを目指すプロジェクトです。

現在は、Expoを使用したReact Nativeアプリとブラウザ版UIプロトタイプを管理しています。

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

macOSでHomebrewの `node@22` を使用する場合、現在のシェルで次を実行します。

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
```

### セットアップ

```bash
npm ci
```

### 起動方法

```bash
make dev
```

Expo起動後、`i` でiOS Simulator、`a` でAndroid Emulator、表示されたQRコードから実機を起動できます。

### 検証

```bash
make lint
make typecheck
make test
make build
```

## ブラウザ版UIプロトタイプ

```bash
npm --prefix prototype ci
npm run prototype
```

プロトタイプの詳細は `prototype/README.md` を参照してください。
