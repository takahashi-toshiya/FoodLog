import * as Crypto from "expo-crypto";
import type { SQLiteDatabase } from "expo-sqlite";

import type {
  CreateFoodInput,
  FoodRepository,
} from "@/foods/storage/FoodRepository";
import type { FoodItem } from "@/foods/types/food";

type FoodRow = {
  id: string;
  name: string;
  serving_amount: number;
  serving_unit: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

function mapFoodRow(row: FoodRow): FoodItem {
  return {
    id: row.id,
    name: row.name,
    servingAmount: row.serving_amount,
    servingUnit: row.serving_unit,
    calories: row.calories,
    protein: row.protein,
    fat: row.fat,
    carbs: row.carbs,
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SQLiteFoodRepository implements FoodRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async findAll(): Promise<FoodItem[]> {
    const rows = await this.db.getAllAsync<FoodRow>(
      `SELECT * FROM foods
       ORDER BY created_at DESC`,
    );

    return rows.map(mapFoodRow);
  }

  async findById(id: string): Promise<FoodItem | null> {
    const row = await this.db.getFirstAsync<FoodRow>(
      "SELECT * FROM foods WHERE id = ?",
      id,
    );

    return row ? mapFoodRow(row) : null;
  }

  async create(input: CreateFoodInput): Promise<FoodItem> {
    const id = Crypto.randomUUID();
    const timestamp = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO foods (
        id, name, serving_amount, serving_unit, calories,
        protein, fat, carbs, memo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      input.name,
      input.servingAmount,
      input.servingUnit,
      input.calories,
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
