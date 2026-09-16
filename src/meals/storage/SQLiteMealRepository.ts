import * as Crypto from "expo-crypto";
import type { SQLiteDatabase } from "expo-sqlite";

import type { MealRepository } from "@/meals/storage/MealRepository";
import type {
  CalorieSource,
  CreateMealEntryInput,
  MealEntry,
  MealType,
} from "@/meals/types/meal";

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

  async findById(id: string): Promise<MealEntry | null> {
    const row = await this.db.getFirstAsync<MealEntryRow>(
      "SELECT * FROM meal_entries WHERE id = ?",
      id,
    );

    return row ? mapMealEntryRow(row) : null;
  }

  async create(input: CreateMealEntryInput): Promise<MealEntry> {
    const timestamp = new Date().toISOString();
    return this.insert(input, timestamp);
  }

  async createMany(inputs: CreateMealEntryInput[]): Promise<MealEntry[]> {
    if (inputs.length === 0) {
      return [];
    }

    const timestamp = new Date().toISOString();
    const entries: MealEntry[] = [];

    await this.db.withTransactionAsync(async () => {
      for (const input of inputs) {
        entries.push(await this.insert(input, timestamp));
      }
    });

    return entries;
  }

  private async insert(
    input: CreateMealEntryInput,
    timestamp: string,
  ): Promise<MealEntry> {
    const id = Crypto.randomUUID();

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

  async update(id: string, input: CreateMealEntryInput): Promise<MealEntry> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Meal entry not found: ${id}`);
    }

    const updatedAt = new Date().toISOString();
    const result = await this.db.runAsync(
      `UPDATE meal_entries SET
        source_food_id = ?, recorded_date = ?, meal_type = ?, name = ?,
        serving_multiplier = ?, calories = ?, calorie_source = ?,
        protein = ?, fat = ?, carbs = ?, memo = ?, updated_at = ?
       WHERE id = ?`,
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
      updatedAt,
      id,
    );

    if (result.changes === 0) {
      throw new Error(`Meal entry not found: ${id}`);
    }

    return { ...existing, ...input, updatedAt };
  }

  async delete(id: string): Promise<void> {
    const result = await this.db.runAsync(
      "DELETE FROM meal_entries WHERE id = ?",
      id,
    );

    if (result.changes === 0) {
      throw new Error(`Meal entry not found: ${id}`);
    }
  }
}
