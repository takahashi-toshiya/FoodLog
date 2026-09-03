import type { SQLiteDatabase } from "expo-sqlite";

import { SQLiteFoodRepository } from "@/foods/storage/SQLiteFoodRepository";

describe("SQLite食品Repository", () => {
  it("IDを指定して食品を取得し、アプリの形式へ変換する", async () => {
    const getFirstAsync = jest.fn(async () => ({
      id: "food-id",
      name: "玄米",
      serving_amount: 150,
      serving_unit: "g",
      calories: 248,
      protein: 4,
      fat: 2,
      carbs: 53,
      memo: "炊飯後",
      created_at: "2026-09-03T00:00:00.000Z",
      updated_at: "2026-09-03T00:00:00.000Z",
    }));
    const repository = new SQLiteFoodRepository({
      getFirstAsync,
    } as unknown as SQLiteDatabase);

    await expect(repository.findById("food-id")).resolves.toEqual({
      id: "food-id",
      name: "玄米",
      servingAmount: 150,
      servingUnit: "g",
      calories: 248,
      protein: 4,
      fat: 2,
      carbs: 53,
      memo: "炊飯後",
      createdAt: "2026-09-03T00:00:00.000Z",
      updatedAt: "2026-09-03T00:00:00.000Z",
    });
    expect(getFirstAsync).toHaveBeenCalledWith(
      "SELECT * FROM foods WHERE id = ?",
      "food-id",
    );
  });

  it("指定した食品が存在しない場合はnullを返す", async () => {
    const repository = new SQLiteFoodRepository({
      getFirstAsync: jest.fn(async () => null),
    } as unknown as SQLiteDatabase);

    await expect(repository.findById("missing")).resolves.toBeNull();
  });
});
