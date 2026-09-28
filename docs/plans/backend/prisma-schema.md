# Prismaスキーマ・初回マイグレーション実装計画

## 目的

`docs/database-design.md`の論理設計をPostgreSQL向けのPrismaスキーマへ落とし込み、ローカル環境とRDSへ同じマイグレーションを適用できる状態にする。

## 対象

- Prismaモデルとenumの定義
- Prismaスキーマの機能領域単位でのファイル分割
- リレーション、削除規則、一意制約、インデックスの定義
- Prismaで表現できないCHECK制約を含む初回マイグレーション
- ローカルPostgreSQLへの適用確認

API、認証、既存SQLiteデータの移行、RDSへの適用はこの段階では行わない。

## 物理設計

### 共通

- 主キーはPostgreSQLのUUIDを使用する
- 日付だけを表す値はPostgreSQLの`date`を使用する
- 作成・更新日時はタイムゾーン付き日時を使用する
- PFC、重量、摂取倍率は誤差を避けるため`decimal`を使用する
- カロリーと表示順は整数を使用する
- テーブル名とカラム名はsnake_caseへマッピングする

### enum

- `MealType`：`breakfast`、`lunch`、`dinner`、`snack`
- `CalorieSource`：`calculated`、`manual`

### 削除規則

- ユーザーの退会処理では、食品セットを先に削除してからユーザーを削除する
- ユーザーを削除した場合、そのユーザーが所有する食品、食事記録、目標値、体重を削除する
- 食品を削除しても過去の食事記録は残し、`food_id`だけをNULLにする
- 食品セットを削除した場合、対応するセット項目を削除する
- セットで使用中の食品は削除できないようにする

### 一意制約

- `users.apple_user_id`
- `nutrition_goals(user_id, effective_from)`
- `weight_records(user_id, recorded_date)`
- `food_set_items(food_set_id, food_id)`

### インデックス

- `foods.user_id`
- `meal_entries(user_id, recorded_date)`
- `meal_entries.food_id`
- `food_sets.user_id`
- `food_set_items.food_id`

食品カタログの検索用インデックスは、前方一致・部分一致・全文検索の方式を決める段階で追加する。

### CHECK制約

Prismaスキーマだけでは表現できないため、生成したマイグレーションSQLへ追加する。

- 分量、摂取倍率、目標カロリー、体重は0より大きい
- 食品・食事記録・食品カタログのカロリーとPFCは0以上
- 目標PFCは0以上
- 表示順は0以上

## 実装手順

1. `backend/prisma/schema.prisma`へgeneratorとdatasourceを定義する
2. `backend/prisma/models/`へ機能領域単位でモデル、enum、制約、インデックスを定義する
3. `prisma format`、`prisma validate`、`prisma generate`を実行する
4. 初回マイグレーションを`--create-only`で生成する
5. 生成SQLへCHECK制約を追加する
6. 空のローカルPostgreSQLへマイグレーションを適用する
7. テーブル、外部キー、一意制約、削除規則、CHECK制約を確認する
8. Lint、型チェック、テスト、ビルドを実行する

## 起こり得る失敗

- 日付が日時として保存され、タイムゾーンによって日付がずれる
- 浮動小数点型によってPFCや体重に丸め誤差が生じる
- ユーザーIDを含まない検索により、別ユーザーのデータが混ざる
- 食品削除時に過去の食事記録まで削除される
- Prismaで表現できないCHECK制約がDBへ反映されない
- 空でないDBを前提にしたマイグレーションになり、クリーン環境へ適用できない

## 検証

- 空のPostgreSQLへ初回からマイグレーションを適用できる
- Prisma Clientを生成できる
- 同一ユーザー・同一日付の体重を重複登録できない
- 同一ユーザー・同一適用日の目標値を重複登録できない
- 存在しないユーザーIDを持つデータを登録できない
- 不正な負数や0をCHECK制約が拒否する
- 食品削除時に食事記録が残り、参照元食品だけがNULLになる
- セットで使用中の食品を削除できない
- 食品セット削除時にセット項目も削除される
- 退会処理では食品セット削除後にユーザーと残りの所有データを削除できる

## 完了条件

- `schema.prisma`とマイグレーションSQLが`docs/database-design.md`と一致している
- ローカルPostgreSQLへクリーン適用できる
- Prismaの検証・生成とバックエンドの品質チェックがすべて成功する
- RDSへ適用する同一のマイグレーションがGit管理されている
