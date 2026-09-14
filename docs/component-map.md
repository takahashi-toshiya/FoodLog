# コンポーネントマップ

FoodLogの各画面が、どの自作コンポーネントで構成されているかを確認するための地図。
コードレビュー時に画面の全体像を把握する用途で使用する。

## 記載ルール

- React Native標準の`View`、`Text`、`Pressable`などは省略する
- Repository、Service、型、データフローは記載しない
- 点線は、条件に応じて表示されるコンポーネントを表す
- `（内部）`は、同じファイル内で定義された非公開コンポーネントを表す
- UIのコンポーネント構成を変更したときは、該当する図も更新する

## アプリ全体

```mermaid
flowchart TD
  RootLayout["RootLayout<br/>アプリ全体のレイアウト"] --> TabLayout["TabLayout<br/>タブ画面のレイアウト"]
  TabLayout --> TodayRoute["TodayRoute"]
  TabLayout --> LibraryRoute["LibraryRoute"]
  TabLayout --> SettingsRoute["SettingsRoute"]
  TabLayout --> AppTabBar["AppTabBar<br/>画面下部のタブバー"]

  RootLayout --> AddMealRoute["AddMealRoute"]
  RootLayout --> EditMealRoute["EditMealRoute"]
  RootLayout --> AddFoodRoute["AddFoodRoute"]
  RootLayout --> EditFoodRoute["EditFoodRoute"]
  RootLayout --> AddFoodSetRoute["AddFoodSetRoute"]
  RootLayout --> EditFoodSetRoute["EditFoodSetRoute"]
  RootLayout --> EditNutritionGoalRoute["EditNutritionGoalRoute"]
```

## 今日画面

```mermaid
flowchart TD
  TodayRoute["TodayRoute"] --> TodayScreen["TodayScreen<br/>選択日の食事記録を表示"]
  TodayScreen --> DateSelector["DateSelector<br/>前後の日付を選択"]
  TodayScreen --> DailyNutritionSummary["DailyNutritionSummary<br/>カロリー・PFCの進捗を表示"]
  DailyNutritionSummary --> MacroProgressRow["MacroProgressRow × 3（内部）<br/>P・F・Cの進捗行"]
  TodayScreen --> MealSection["MealSection × 4<br/>朝食・昼食・夕食・間食を表示"]
  MealSection --> MealEntryRow["MealEntryRow（内部）<br/>食事記録の1行"]
  TodayScreen -. カレンダーを開いたとき .-> DatePickerModal["DatePickerModal<br/>任意の日付を選択"]
```

## ライブラリ画面

```mermaid
flowchart TD
  LibraryRoute["LibraryRoute"] --> FoodLibraryScreen["FoodLibraryScreen<br/>食品・セットの一覧を表示"]
  FoodLibraryScreen --> LibraryCategoryTabs["LibraryCategoryTabs<br/>食品とセットを切り替え"]
  FoodLibraryScreen -. 食品タブ .-> FoodSearchInput["FoodSearchInput<br/>食品を検索"]
  FoodLibraryScreen -. 食品タブ .-> FoodCard["FoodCard × 件数<br/>食品の概要と操作メニュー"]
  FoodLibraryScreen -. セットタブ .-> FoodSetCard["FoodSetCard × 件数<br/>セットの概要と操作メニュー"]
```

## 食事追加・編集画面

```mermaid
flowchart TD
  AddMealRoute["AddMealRoute"] -->|通常の追加| AddMealScreen["AddMealScreen<br/>新しい食事を追加"]
  AddMealRoute -->|ライブラリの食品を指定| AddLibraryFoodToMealScreen["AddLibraryFoodToMealScreen<br/>食品を読み込み食事へ追加"]
  AddLibraryFoodToMealScreen --> AddMealScreen
  AddMealScreen --> MealEntryForm["MealEntryForm<br/>食事記録の共通フォーム"]

  EditMealRoute["EditMealRoute"] --> EditMealScreen["EditMealScreen<br/>食事記録を読み込み編集・削除"]
  EditMealScreen -. 読み込み完了 .-> MealEntryForm
  EditMealScreen -. 読み込み中・失敗 .-> MealStatusScreen["StatusScreen（内部）<br/>状態と再試行・閉じる操作"]

  MealEntryForm --> MealTextField["TextField × 項目数（内部）<br/>ラベル・入力欄・エラー表示"]
  MealEntryForm -. ライブラリを開いたとき .-> FoodSelectionModal["FoodSelectionModal<br/>登録済み食品を選択"]
  FoodSelectionModal --> FoodSearchInput["FoodSearchInput<br/>食品を検索"]
  FoodSelectionModal --> FoodCard["FoodCard × 件数<br/>選択可能な食品"]
  FoodSelectionModal -. 読み込み中・空・失敗 .-> SelectionStatus["StatusMessage（内部）<br/>一覧の状態を表示"]
```

## 食品追加・編集画面

```mermaid
flowchart TD
  AddFoodRoute["AddFoodRoute"] --> AddFoodScreen["AddFoodScreen<br/>食品を新規登録"]
  AddFoodScreen --> FoodForm["FoodForm<br/>食品の共通フォーム"]

  EditFoodRoute["EditFoodRoute"] --> EditFoodScreen["EditFoodScreen<br/>食品を読み込み編集・削除"]
  EditFoodScreen -. 読み込み完了 .-> FoodForm
  EditFoodScreen -. 読み込み中・失敗 .-> FoodStatusScreen["StatusScreen（内部）<br/>状態と再試行・閉じる操作"]

  FoodForm --> FoodTextField["TextField × 項目数（内部）<br/>ラベル・入力欄・エラー表示"]
```

## 食品セット追加・編集画面

```mermaid
flowchart TD
  AddFoodSetRoute["AddFoodSetRoute"] --> AddFoodSetScreen["AddFoodSetScreen<br/>食品セットを新規登録"]
  AddFoodSetScreen --> FoodSetForm["FoodSetForm<br/>セット名・食品・倍率を入力"]

  EditFoodSetRoute["EditFoodSetRoute"] --> EditFoodSetScreen["EditFoodSetScreen<br/>セットを読み込み編集・削除"]
  EditFoodSetScreen -. 読み込み完了 .-> FoodSetForm
  EditFoodSetScreen -. 読み込み中・失敗 .-> FoodSetStatusScreen["StatusScreen（内部）<br/>状態と再試行・閉じる操作"]

  FoodSetForm -. 食品を追加するとき .-> FoodSelectionModal["FoodSelectionModal<br/>セットへ入れる食品を選択"]
  FoodSelectionModal --> FoodSearchInput["FoodSearchInput<br/>食品を検索"]
  FoodSelectionModal --> FoodCard["FoodCard × 件数<br/>選択可能な食品"]
  FoodSelectionModal -. 読み込み中・空・失敗 .-> SelectionStatus["StatusMessage（内部）<br/>一覧の状態を表示"]
```

## 設定画面

```mermaid
flowchart TD
  SettingsRoute["SettingsRoute"] --> SettingsScreen["SettingsScreen<br/>現在の目標値とデータ項目を表示"]

  EditNutritionGoalRoute["EditNutritionGoalRoute"] --> EditNutritionGoalScreen["EditNutritionGoalScreen<br/>1日のPFC目標を編集"]
  EditNutritionGoalScreen --> GoalInput["GoalInput × 3（内部）<br/>P・F・Cの入力欄とエラー表示"]
```
