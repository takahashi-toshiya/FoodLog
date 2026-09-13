import * as Crypto from "expo-crypto";
import type { SQLiteDatabase } from "expo-sqlite";

import type { FoodSetRepository } from "@/foods/storage/FoodSetRepository";
import type { FoodItem } from "@/foods/types/food";
import type {
  CreateFoodSetInput,
  FoodSet,
  FoodSetItemInput,
} from "@/foods/types/foodSet";

type FoodSetRow = {
  set_id: string;
  set_name: string;
  set_created_at: string;
  set_updated_at: string;
  item_id: string;
  serving_multiplier: number;
  sort_order: number;
  item_created_at: string;
  item_updated_at: string;
  food_id: string;
  food_name: string;
  serving_amount: number;
  serving_unit: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  memo: string | null;
  food_created_at: string;
  food_updated_at: string;
};

const FOOD_SET_SELECT = `
  SELECT
    food_sets.id AS set_id,
    food_sets.name AS set_name,
    food_sets.created_at AS set_created_at,
    food_sets.updated_at AS set_updated_at,
    food_set_items.id AS item_id,
    food_set_items.serving_multiplier,
    food_set_items.sort_order,
    food_set_items.created_at AS item_created_at,
    food_set_items.updated_at AS item_updated_at,
    foods.id AS food_id,
    foods.name AS food_name,
    foods.serving_amount,
    foods.serving_unit,
    foods.calories,
    foods.protein,
    foods.fat,
    foods.carbs,
    foods.memo,
    foods.created_at AS food_created_at,
    foods.updated_at AS food_updated_at
  FROM food_sets
  INNER JOIN food_set_items
    ON food_set_items.food_set_id = food_sets.id
  INNER JOIN foods
    ON foods.id = food_set_items.food_id
`;

function mapFood(row: FoodSetRow): FoodItem {
  return {
    id: row.food_id,
    name: row.food_name,
    servingAmount: row.serving_amount,
    servingUnit: row.serving_unit,
    calories: row.calories,
    protein: row.protein,
    fat: row.fat,
    carbs: row.carbs,
    memo: row.memo,
    createdAt: row.food_created_at,
    updatedAt: row.food_updated_at,
  };
}

function mapFoodSetRows(rows: FoodSetRow[]): FoodSet[] {
  const sets = new Map<string, FoodSet>();

  for (const row of rows) {
    let foodSet = sets.get(row.set_id);

    if (!foodSet) {
      foodSet = {
        id: row.set_id,
        name: row.set_name,
        items: [],
        createdAt: row.set_created_at,
        updatedAt: row.set_updated_at,
      };
      sets.set(row.set_id, foodSet);
    }

    foodSet.items.push({
      id: row.item_id,
      food: mapFood(row),
      servingMultiplier: row.serving_multiplier,
      sortOrder: row.sort_order,
      createdAt: row.item_created_at,
      updatedAt: row.item_updated_at,
    });
  }

  return [...sets.values()];
}

function assertItemsExist(items: FoodSetItemInput[]): void {
  if (items.length === 0) {
    throw new Error("Food set requires at least one item");
  }
}

export class SQLiteFoodSetRepository implements FoodSetRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async findAll(): Promise<FoodSet[]> {
    const rows = await this.db.getAllAsync<FoodSetRow>(
      `${FOOD_SET_SELECT}
       ORDER BY food_sets.created_at DESC, food_set_items.sort_order ASC`,
    );

    return mapFoodSetRows(rows);
  }

  async findById(id: string): Promise<FoodSet | null> {
    const rows = await this.db.getAllAsync<FoodSetRow>(
      `${FOOD_SET_SELECT}
       WHERE food_sets.id = ?
       ORDER BY food_set_items.sort_order ASC`,
      id,
    );

    return mapFoodSetRows(rows)[0] ?? null;
  }

  async create(input: CreateFoodSetInput): Promise<FoodSet> {
    assertItemsExist(input.items);

    const id = Crypto.randomUUID();
    const timestamp = new Date().toISOString();

    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync(
        `INSERT INTO food_sets (id, name, created_at, updated_at)
         VALUES (?, ?, ?, ?)`,
        id,
        input.name,
        timestamp,
        timestamp,
      );
      await this.insertItems(id, input.items, timestamp);
    });

    return this.findRequired(id);
  }

  async update(id: string, input: CreateFoodSetInput): Promise<FoodSet> {
    assertItemsExist(input.items);

    const timestamp = new Date().toISOString();

    await this.db.withTransactionAsync(async () => {
      const result = await this.db.runAsync(
        `UPDATE food_sets
         SET name = ?, updated_at = ?
         WHERE id = ?`,
        input.name,
        timestamp,
        id,
      );

      if (result.changes === 0) {
        throw new Error(`Food set not found: ${id}`);
      }

      await this.db.runAsync(
        "DELETE FROM food_set_items WHERE food_set_id = ?",
        id,
      );
      await this.insertItems(id, input.items, timestamp);
    });

    return this.findRequired(id);
  }

  async delete(id: string): Promise<void> {
    const result = await this.db.runAsync(
      "DELETE FROM food_sets WHERE id = ?",
      id,
    );

    if (result.changes === 0) {
      throw new Error(`Food set not found: ${id}`);
    }
  }

  private async insertItems(
    foodSetId: string,
    items: FoodSetItemInput[],
    timestamp: string,
  ): Promise<void> {
    for (const [sortOrder, item] of items.entries()) {
      await this.db.runAsync(
        `INSERT INTO food_set_items (
          id, food_set_id, food_id, serving_multiplier, sort_order,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        Crypto.randomUUID(),
        foodSetId,
        item.foodId,
        item.servingMultiplier,
        sortOrder,
        timestamp,
        timestamp,
      );
    }
  }

  private async findRequired(id: string): Promise<FoodSet> {
    const foodSet = await this.findById(id);

    if (!foodSet) {
      throw new Error(`Food set not found after save: ${id}`);
    }

    return foodSet;
  }
}
