# ローカルバックエンド環境構築計画

## 目的

Docker上でNestJS APIとPostgreSQLを起動し、Prismaを経由して接続できるバックエンド開発環境を用意する。

## 対象範囲

- `backend/`にNestJS・TypeScriptプロジェクトを作成する
- Prismaを導入し、PostgreSQLへの接続設定を行う
- NestJSとPostgreSQLをDocker Composeで起動する
- ソース変更をNestJSコンテナへ反映できる開発用構成にする
- APIとDBの起動状態を確認する`GET /health`を用意する
- リポジトリ直下から起動・停止・検証できるコマンドを追加する
- 秘密情報をコミットせず、必要な環境変数だけをサンプルとして残す

## 実装方針

- NestJSとPostgreSQLは別コンテナにする
- PostgreSQLのデータはDocker Volumeへ保存する
- APIはPostgreSQLのヘルスチェック完了後に起動する
- Prisma Schemaは接続設定だけを用意し、業務テーブルは次のDB設計で追加する
- `GET /health`ではPrismaからDBへ問い合わせ、APIとDBの両方が利用可能なことを確認する
- DockerfileとDocker Composeを含むローカル開発環境は`backend/`へまとめる

## 実装順序

1. NestJSプロジェクトと品質確認コマンドを作成する
2. PrismaとPostgreSQLの接続設定を追加する
3. DockerfileとDocker Composeを追加する
4. `GET /health`と対応するテストを追加する
5. ルートのnpm・Makeコマンドとドキュメントを更新する
6. コンテナの新規起動から接続確認までを実行する

## 確認ポイント

作業は次の3段階に分け、各段階の差分・設計意図・確認結果を報告する。利用者から明示的な確認を得るまで次の段階へ進まない。

1. NestJSプロジェクトと品質確認コマンドの作成
2. Prisma・PostgreSQL・Docker開発環境の作成
3. `GET /health`、ルートコマンド、ドキュメントの追加と最終検証

## 完了条件

- `docker compose`を利用するルートコマンドでAPIとPostgreSQLを起動・停止できる
- `GET /health`がHTTP 200を返し、PostgreSQLへ接続できていることを確認できる
- PostgreSQLコンテナを再作成しても、Volumeを削除しない限りデータが保持される
- バックエンドのLint、型チェック、テスト、ビルドが成功する
- 既存のFoodLogアプリのLint、型チェック、テスト、ビルドが引き続き成功する
- 実際の認証情報や秘密情報がGit管理へ含まれていない

## 対象外

- FoodLogの業務テーブルとCRUD API
- SQLiteデータの移行
- 認証・認可
- 食品検索とバッチ処理
- AWS構成とデプロイ
