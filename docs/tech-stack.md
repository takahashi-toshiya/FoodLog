# 技術構成

## 開発環境

- Node.js 22.23.2
- npm

## プラットフォーム

- iOS
- Android

## アプリケーション

- React Native
- Expo
- Expo Router
- Expo SQLite
- Expo Crypto
- Expo FileSystem
- Expo Sharing
- TypeScript
- npm

## バックエンド

- NestJS
- TypeScript
- Prisma
- PostgreSQL
- Docker / Docker Compose（ローカル開発環境）
- npm

実装コードは`backend/`へ配置する。

## インフラ

構成は未決定。REST APIをローカルで実装・検証した後に決定し、AWSなどのインフラ定義は`infra/`へ配置する。

## テスト・静的解析

### アプリケーション

- Jest
- jest-expo
- React Native Testing Library
- ESLint

### バックエンド

- Vitest
- oxlint

### 共通

- Prettier
