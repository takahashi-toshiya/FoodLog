import type { SQLiteDatabase } from "expo-sqlite";

const MEAL_SCHEMA_VERSION = 1;
const NUTRITION_GOAL_SCHEMA_VERSION = 2;
const FOOD_SET_SCHEMA_VERSION = 3;

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync("PRAGMA foreign_keys = ON");

  const version = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );

  const currentVersion = version?.user_version ?? 0;

  if (currentVersion < MEAL_SCHEMA_VERSION) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
      CREATE TABLE foods (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        serving_amount REAL NOT NULL CHECK (serving_amount > 0),
        serving_unit TEXT NOT NULL,
        calories INTEGER NOT NULL CHECK (calories >= 0),
        protein REAL NOT NULL CHECK (protein >= 0),
        fat REAL NOT NULL CHECK (fat >= 0),
        carbs REAL NOT NULL CHECK (carbs >= 0),
        memo TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE meal_entries (
        id TEXT PRIMARY KEY NOT NULL,
        source_food_id TEXT,
        recorded_date TEXT NOT NULL,
        meal_type TEXT NOT NULL
          CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
        name TEXT NOT NULL,
        serving_multiplier REAL NOT NULL CHECK (serving_multiplier > 0),
        calories INTEGER NOT NULL CHECK (calories >= 0),
        calorie_source TEXT NOT NULL
          CHECK (calorie_source IN ('calculated', 'manual')),
        protein REAL NOT NULL CHECK (protein >= 0),
        fat REAL NOT NULL CHECK (fat >= 0),
        carbs REAL NOT NULL CHECK (carbs >= 0),
        memo TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (source_food_id)
          REFERENCES foods(id)
          ON DELETE SET NULL
      );

      CREATE INDEX meal_entries_recorded_date_index
        ON meal_entries (recorded_date);

      CREATE INDEX meal_entries_source_food_id_index
        ON meal_entries (source_food_id);

        PRAGMA user_version = ${MEAL_SCHEMA_VERSION};
      `);
    });
  }

  if (currentVersion < NUTRITION_GOAL_SCHEMA_VERSION) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        CREATE TABLE nutrition_goals (
          id TEXT PRIMARY KEY NOT NULL,
          effective_from TEXT NOT NULL UNIQUE,
          calories INTEGER NOT NULL CHECK (calories > 0),
          protein REAL NOT NULL CHECK (protein >= 0),
          fat REAL NOT NULL CHECK (fat >= 0),
          carbs REAL NOT NULL CHECK (carbs >= 0),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        INSERT INTO nutrition_goals (
          id, effective_from, calories, protein, fat, carbs,
          created_at, updated_at
        ) VALUES (
          'default-nutrition-goal', '1970-01-01', 1975, 120, 55, 250,
          '1970-01-01T00:00:00.000Z', '1970-01-01T00:00:00.000Z'
        );

        PRAGMA user_version = ${NUTRITION_GOAL_SCHEMA_VERSION};
      `);
    });
  }

  if (currentVersion < FOOD_SET_SCHEMA_VERSION) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        CREATE TABLE food_sets (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE food_set_items (
          id TEXT PRIMARY KEY NOT NULL,
          food_set_id TEXT NOT NULL,
          food_id TEXT NOT NULL,
          serving_multiplier REAL NOT NULL CHECK (serving_multiplier > 0),
          sort_order INTEGER NOT NULL CHECK (sort_order >= 0),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (food_set_id)
            REFERENCES food_sets(id)
            ON DELETE CASCADE,
          FOREIGN KEY (food_id)
            REFERENCES foods(id)
            ON DELETE RESTRICT,
          UNIQUE (food_set_id, food_id)
        );

        CREATE INDEX food_set_items_food_id_index
          ON food_set_items (food_id);

        PRAGMA user_version = ${FOOD_SET_SCHEMA_VERSION};
      `);
    });
  }
}
