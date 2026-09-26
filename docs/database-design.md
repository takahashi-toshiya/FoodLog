# データベース設計

## `users`

アプリを利用するユーザーとAppleログインの識別情報を保存する。

| カラム | 制約 |
| --- | --- |
| `id` | PRIMARY KEY |
| `apple_user_id` | NOT NULL、UNIQUE |
| `created_at` | NOT NULL |
| `updated_at` | NOT NULL |

## `foods`

ユーザーが自分の食品ライブラリーへ登録した食品と、1回分の栄養情報を保存する。

| カラム | 制約 |
| --- | --- |
| `id` | PRIMARY KEY |
| `user_id` | NOT NULL、FOREIGN KEY → `users.id` |
| `name` | NOT NULL |
| `serving_amount` | NOT NULL、0より大きい |
| `serving_unit` | NOT NULL |
| `calories` | NOT NULL、0以上 |
| `protein` | NOT NULL、0以上 |
| `fat` | NOT NULL、0以上 |
| `carbs` | NOT NULL、0以上 |
| `memo` | NULL可 |
| `created_at` | NOT NULL |
| `updated_at` | NOT NULL |

## `meal_entries`

ユーザーが実際に食べた履歴と、記録時点の栄養情報を保存する。

| カラム | 制約 |
| --- | --- |
| `id` | PRIMARY KEY |
| `user_id` | NOT NULL、FOREIGN KEY → `users.id` |
| `source_food_id` | NULL可、FOREIGN KEY → `foods.id` |
| `recorded_date` | NOT NULL |
| `meal_type` | NOT NULL、`breakfast` / `lunch` / `dinner` / `snack` |
| `name` | NOT NULL |
| `serving_multiplier` | NOT NULL、0より大きい |
| `calories` | NOT NULL、0以上 |
| `calorie_source` | NOT NULL、`calculated` / `manual` |
| `protein` | NOT NULL、0以上 |
| `fat` | NOT NULL、0以上 |
| `carbs` | NOT NULL、0以上 |
| `memo` | NULL可 |
| `created_at` | NOT NULL |
| `updated_at` | NOT NULL |

## `nutrition_goals`

ユーザーのカロリーとPFCの目標値を、適用開始日ごとの履歴として保存する。

| カラム | 制約 |
| --- | --- |
| `id` | PRIMARY KEY |
| `user_id` | NOT NULL、FOREIGN KEY → `users.id` |
| `effective_from` | NOT NULL |
| `calories` | NOT NULL、0より大きい |
| `protein` | NOT NULL、0以上 |
| `fat` | NOT NULL、0以上 |
| `carbs` | NOT NULL、0以上 |
| `created_at` | NOT NULL |
| `updated_at` | NOT NULL |

`user_id`と`effective_from`の組み合わせを一意にする。

## `food_sets`

ユーザーが複数の食品をまとめて記録するために作成したセットを保存する。

| カラム | 制約 |
| --- | --- |
| `id` | PRIMARY KEY |
| `user_id` | NOT NULL、FOREIGN KEY → `users.id` |
| `name` | NOT NULL |
| `created_at` | NOT NULL |
| `updated_at` | NOT NULL |

## `food_set_items`

食品セットに含まれる食品、摂取倍率、表示順を保存する。

| カラム | 制約 |
| --- | --- |
| `id` | PRIMARY KEY |
| `food_set_id` | NOT NULL、FOREIGN KEY → `food_sets.id` |
| `food_id` | NOT NULL、FOREIGN KEY → `foods.id` |
| `serving_multiplier` | NOT NULL、0より大きい |
| `sort_order` | NOT NULL、0以上 |
| `created_at` | NOT NULL |
| `updated_at` | NOT NULL |

`food_set_id`と`food_id`の組み合わせを一意にする。

## `weight_records`

ユーザーの日付ごとの体重をkg単位で保存する。

| カラム | 制約 |
| --- | --- |
| `id` | PRIMARY KEY |
| `user_id` | NOT NULL、FOREIGN KEY → `users.id` |
| `recorded_date` | NOT NULL |
| `weight_kg` | NOT NULL、0より大きい |
| `created_at` | NOT NULL |
| `updated_at` | NOT NULL |

`user_id`と`recorded_date`の組み合わせを一意にする。

## `food_catalog_items`

すべてのユーザーが検索できる共通の食品と、1回分の栄養情報を保存する。

| カラム | 制約 |
| --- | --- |
| `id` | PRIMARY KEY |
| `name` | NOT NULL |
| `serving_amount` | NOT NULL、0より大きい |
| `serving_unit` | NOT NULL |
| `calories` | NOT NULL、0以上 |
| `protein` | NOT NULL、0以上 |
| `fat` | NOT NULL、0以上 |
| `carbs` | NOT NULL、0以上 |
| `created_at` | NOT NULL |
| `updated_at` | NOT NULL |
