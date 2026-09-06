import * as Crypto from "expo-crypto";
import type { SQLiteDatabase } from "expo-sqlite";

import type {
  NutritionGoalRepository,
  SaveNutritionGoalInput,
} from "@/settings/storage/NutritionGoalRepository";
import type { NutritionGoal } from "@/settings/types/nutritionGoal";

type NutritionGoalRow = {
  id: string;
  effective_from: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  created_at: string;
  updated_at: string;
};

function mapNutritionGoalRow(row: NutritionGoalRow): NutritionGoal {
  return {
    id: row.id,
    effectiveFrom: row.effective_from,
    calories: row.calories,
    protein: row.protein,
    fat: row.fat,
    carbs: row.carbs,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SQLiteNutritionGoalRepository implements NutritionGoalRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async findEffectiveOn(date: string): Promise<NutritionGoal> {
    const row = await this.db.getFirstAsync<NutritionGoalRow>(
      `SELECT * FROM nutrition_goals
       WHERE effective_from <= ?
       ORDER BY effective_from DESC
       LIMIT 1`,
      date,
    );

    if (!row) {
      throw new Error(`栄養目標が見つかりません: ${date}`);
    }

    return mapNutritionGoalRow(row);
  }

  async save(input: SaveNutritionGoalInput): Promise<NutritionGoal> {
    const id = Crypto.randomUUID();
    const timestamp = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO nutrition_goals (
        id, effective_from, calories, protein, fat, carbs,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(effective_from) DO UPDATE SET
        calories = excluded.calories,
        protein = excluded.protein,
        fat = excluded.fat,
        carbs = excluded.carbs,
        updated_at = excluded.updated_at`,
      id,
      input.effectiveFrom,
      input.calories,
      input.protein,
      input.fat,
      input.carbs,
      timestamp,
      timestamp,
    );

    return this.findEffectiveOn(input.effectiveFrom);
  }
}
