import * as Crypto from "expo-crypto";
import type { SQLiteDatabase } from "expo-sqlite";

import type {
  CreateMealEntryInput,
  MealRepository,
} from "@/meals/storage/MealRepository";
import {
  mapMealEntryRow,
  type MealEntryRow,
} from "@/meals/storage/mealEntryMapper";
import type { MealEntry } from "@/meals/types/meal";

export class SQLiteMealRepository implements MealRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async findByDate(date: string): Promise<MealEntry[]> {
    const rows = await this.db.getAllAsync<MealEntryRow>(
      `SELECT * FROM meal_entries
       WHERE recorded_date = ?
       ORDER BY created_at ASC`,
      date,
    );

    return rows.map(mapMealEntryRow);
  }

  async create(input: CreateMealEntryInput): Promise<MealEntry> {
    const id = Crypto.randomUUID();
    const timestamp = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO meal_entries (
        id, source_food_id, recorded_date, meal_type, name,
        serving_multiplier, calories, calorie_source,
        protein, fat, carbs, memo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      input.sourceFoodId,
      input.date,
      input.mealType,
      input.name,
      input.servingMultiplier,
      input.calories,
      input.calorieSource,
      input.protein,
      input.fat,
      input.carbs,
      input.memo,
      timestamp,
      timestamp,
    );

    return {
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...input,
    };
  }
}
