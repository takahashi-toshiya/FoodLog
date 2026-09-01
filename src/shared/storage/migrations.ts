import type { SQLiteDatabase } from "expo-sqlite";

const INITIAL_SCHEMA_VERSION = 1;

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync("PRAGMA foreign_keys = ON");

  const version = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );

  if ((version?.user_version ?? 0) >= INITIAL_SCHEMA_VERSION) {
    return;
  }

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

      PRAGMA user_version = ${INITIAL_SCHEMA_VERSION};
    `);
  });
}
