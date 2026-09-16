import type { SQLiteDatabase } from "expo-sqlite";

import { SQLiteMealRepository } from "@/meals/storage/SQLiteMealRepository";

let mockIdSequence = 0;

jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(() => `generated-meal-${mockIdSequence++}`),
}));

const ROW = {
  id: "meal-id",
  source_food_id: "food-id",
  recorded_date: "2026-09-07",
  meal_type: "lunch",
  name: "鶏むね肉",
  serving_multiplier: 1,
  calories: 290,
  calorie_source: "calculated",
  protein: 20,
  fat: 10,
  carbs: 30,
  memo: null,
  created_at: "2026-09-07T00:00:00.000Z",
  updated_at: "2026-09-07T00:00:00.000Z",
};

const INPUT = {
  sourceFoodId: "food-id",
  date: "2026-09-08",
  mealType: "dinner" as const,
  name: "鶏肉弁当",
  servingMultiplier: 0.5,
  calories: 145,
  calorieSource: "calculated" as const,
  protein: 10,
  fat: 5,
  carbs: 15,
  memo: "半分",
};

describe("SQLite食事Repository", () => {
  beforeEach(() => {
    mockIdSequence = 0;
  });

  it("IDを指定して食事記録を取得し、アプリの形式へ変換する", async () => {
    const getFirstAsync = jest.fn(async () => ROW);
    const repository = new SQLiteMealRepository({
      getFirstAsync,
    } as unknown as SQLiteDatabase);

    await expect(repository.findById("meal-id")).resolves.toEqual({
      id: "meal-id",
      sourceFoodId: "food-id",
      date: "2026-09-07",
      mealType: "lunch",
      name: "鶏むね肉",
      servingMultiplier: 1,
      calories: 290,
      calorieSource: "calculated",
      protein: 20,
      fat: 10,
      carbs: 30,
      memo: null,
      createdAt: "2026-09-07T00:00:00.000Z",
      updatedAt: "2026-09-07T00:00:00.000Z",
    });
  });

  it("存在しないIDではnullを返す", async () => {
    const repository = new SQLiteMealRepository({
      getFirstAsync: jest.fn(async () => null),
    } as unknown as SQLiteDatabase);

    await expect(repository.findById("missing")).resolves.toBeNull();
  });

  it("食事記録を更新する", async () => {
    const runAsync = jest.fn(async () => ({ changes: 1 }));
    const repository = new SQLiteMealRepository({
      getFirstAsync: jest.fn(async () => ROW),
      runAsync,
    } as unknown as SQLiteDatabase);

    await expect(repository.update("meal-id", INPUT)).resolves.toEqual(
      expect.objectContaining({
        ...INPUT,
        id: "meal-id",
        createdAt: "2026-09-07T00:00:00.000Z",
      }),
    );
    expect(runAsync).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE meal_entries SET"),
      "food-id",
      "2026-09-08",
      "dinner",
      "鶏肉弁当",
      0.5,
      145,
      "calculated",
      10,
      5,
      15,
      "半分",
      expect.any(String),
      "meal-id",
    );
  });

  it("食事記録を削除する", async () => {
    const runAsync = jest.fn(async () => ({ changes: 1 }));
    const repository = new SQLiteMealRepository({
      runAsync,
    } as unknown as SQLiteDatabase);

    await expect(repository.delete("meal-id")).resolves.toBeUndefined();
    expect(runAsync).toHaveBeenCalledWith(
      "DELETE FROM meal_entries WHERE id = ?",
      "meal-id",
    );
  });

  it("複数の食事記録を1つのトランザクションで保存する", async () => {
    const runAsync = jest.fn(async () => ({ changes: 1 }));
    const withTransactionAsync = jest.fn(
      async (callback: () => Promise<void>) => callback(),
    );
    const repository = new SQLiteMealRepository({
      runAsync,
      withTransactionAsync,
    } as unknown as SQLiteDatabase);

    const result = await repository.createMany([
      INPUT,
      { ...INPUT, sourceFoodId: "food-2", name: "玄米" },
    ]);

    expect(withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(runAsync).toHaveBeenCalledTimes(2);
    expect(result).toEqual([
      expect.objectContaining({ id: "generated-meal-0", name: "鶏肉弁当" }),
      expect.objectContaining({ id: "generated-meal-1", name: "玄米" }),
    ]);
  });

  it("一括保存の途中で失敗した場合は処理を失敗として返す", async () => {
    const runAsync = jest
      .fn()
      .mockResolvedValueOnce({ changes: 1 })
      .mockRejectedValueOnce(new Error("insert failed"));
    const withTransactionAsync = jest.fn(
      async (callback: () => Promise<void>) => callback(),
    );
    const repository = new SQLiteMealRepository({
      runAsync,
      withTransactionAsync,
    } as unknown as SQLiteDatabase);

    await expect(
      repository.createMany([
        INPUT,
        { ...INPUT, sourceFoodId: "food-2", name: "玄米" },
      ]),
    ).rejects.toThrow("insert failed");
    expect(withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(runAsync).toHaveBeenCalledTimes(2);
  });

  it("空の一括保存ではトランザクションを開始しない", async () => {
    const withTransactionAsync = jest.fn();
    const repository = new SQLiteMealRepository({
      withTransactionAsync,
    } as unknown as SQLiteDatabase);

    await expect(repository.createMany([])).resolves.toEqual([]);
    expect(withTransactionAsync).not.toHaveBeenCalled();
  });

  it("存在しない記録の更新と削除は失敗する", async () => {
    const updateRepository = new SQLiteMealRepository({
      getFirstAsync: jest.fn(async () => null),
    } as unknown as SQLiteDatabase);
    const deleteRepository = new SQLiteMealRepository({
      runAsync: jest.fn(async () => ({ changes: 0 })),
    } as unknown as SQLiteDatabase);

    await expect(updateRepository.update("missing", INPUT)).rejects.toThrow(
      "Meal entry not found",
    );
    await expect(deleteRepository.delete("missing")).rejects.toThrow(
      "Meal entry not found",
    );
  });
});
