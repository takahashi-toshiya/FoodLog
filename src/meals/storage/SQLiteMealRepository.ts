import * as Crypto from "expo-crypto";
import type { SQLiteDatabase } from "expo-sqlite";

import type {
  CreateMealEntryInput,
  MealRepository,
} from "@/meals/storage/MealRepository";
import type { CalorieSource, MealEntry, MealType } from "@/meals/types/meal";

type MealEntryRow = {
  id: string;
  source_food_id: string | null;
  recorded_date: string;
  meal_type: string;
  name: string;
  serving_multiplier: number;
  calories: number;
  calorie_source: string;
  protein: number;
  fat: number;
  carbs: number;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

function mapMealEntryRow(row: MealEntryRow): MealEntry {
  return {
    id: row.id,
    sourceFoodId: row.source_food_id,
    date: row.recorded_date,
    mealType: row.meal_type as MealType,
    name: row.name,
    servingMultiplier: row.serving_multiplier,
    calories: row.calories,
    calorieSource: row.calorie_source as CalorieSource,
    protein: row.protein,
    fat: row.fat,
    carbs: row.carbs,
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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
