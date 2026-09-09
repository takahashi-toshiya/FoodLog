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

  it("食品を更新する", async () => {
    const getFirstAsync = jest.fn(async () => ({
      id: "food-id",
      name: "玄米",
      serving_amount: 150,
      serving_unit: "g",
      calories: 248,
      protein: 4,
      fat: 2,
      carbs: 53,
      memo: null,
      created_at: "2026-09-03T00:00:00.000Z",
      updated_at: "2026-09-03T00:00:00.000Z",
    }));
    const runAsync = jest.fn(async () => ({ changes: 1 }));
    const repository = new SQLiteFoodRepository({
      getFirstAsync,
      runAsync,
    } as unknown as SQLiteDatabase);

    await expect(
      repository.update("food-id", {
        name: "玄米ごはん",
        servingAmount: 180,
        servingUnit: "g",
        calories: 295,
        protein: 5,
        fat: 2,
        carbs: 64,
        memo: "変更後",
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: "food-id",
        name: "玄米ごはん",
        createdAt: "2026-09-03T00:00:00.000Z",
      }),
    );
    expect(runAsync).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE foods SET"),
      "玄米ごはん",
      180,
      "g",
      295,
      5,
      2,
      64,
      "変更後",
      expect.any(String),
      "food-id",
    );
  });

  it("食品を削除する", async () => {
    const runAsync = jest.fn(async () => ({ changes: 1 }));
    const repository = new SQLiteFoodRepository({
      runAsync,
    } as unknown as SQLiteDatabase);

    await expect(repository.delete("food-id")).resolves.toBeUndefined();
    expect(runAsync).toHaveBeenCalledWith(
      "DELETE FROM foods WHERE id = ?",
      "food-id",
    );
  });

  it("存在しない食品の更新と削除は失敗する", async () => {
    const updateRepository = new SQLiteFoodRepository({
      getFirstAsync: jest.fn(async () => null),
    } as unknown as SQLiteDatabase);
    const deleteRepository = new SQLiteFoodRepository({
      runAsync: jest.fn(async () => ({ changes: 0 })),
    } as unknown as SQLiteDatabase);
    const input = {
      name: "食品",
      servingAmount: 1,
      servingUnit: "個",
      calories: 100,
      protein: 10,
      fat: 2,
      carbs: 10,
      memo: null,
    };

    await expect(updateRepository.update("missing", input)).rejects.toThrow(
      "Food not found",
    );
    await expect(deleteRepository.delete("missing")).rejects.toThrow(
      "Food not found",
    );
  });
});
