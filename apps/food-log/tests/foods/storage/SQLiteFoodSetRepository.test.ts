import type { SQLiteDatabase } from "expo-sqlite";

import { SQLiteFoodSetRepository } from "@/foods/storage/SQLiteFoodSetRepository";

let mockIdSequence = 0;

jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(() => `generated-id-${mockIdSequence++}`),
}));

const FIRST_ROW = {
  set_id: "set-id",
  set_name: "いつもの朝食",
  set_created_at: "2026-09-12T00:00:00.000Z",
  set_updated_at: "2026-09-12T00:00:00.000Z",
  item_id: "item-1",
  serving_multiplier: 2,
  sort_order: 0,
  item_created_at: "2026-09-12T00:00:00.000Z",
  item_updated_at: "2026-09-12T00:00:00.000Z",
  food_id: "food-1",
  food_name: "ゆで卵",
  serving_amount: 1,
  serving_unit: "個",
  calories: 76,
  protein: 6.2,
  fat: 5.2,
  carbs: 0.2,
  memo: null,
  food_created_at: "2026-09-01T00:00:00.000Z",
  food_updated_at: "2026-09-01T00:00:00.000Z",
};

const SECOND_ROW = {
  ...FIRST_ROW,
  item_id: "item-2",
  serving_multiplier: 1,
  sort_order: 1,
  food_id: "food-2",
  food_name: "玄米",
  serving_amount: 150,
  serving_unit: "g",
  calories: 248,
  protein: 4,
  fat: 2,
  carbs: 53,
};

const INPUT = {
  name: "いつもの朝食",
  items: [
    { foodId: "food-1", servingMultiplier: 2 },
    { foodId: "food-2", servingMultiplier: 1 },
  ],
};

describe("SQLite食品セットRepository", () => {
  beforeEach(() => {
    mockIdSequence = 0;
  });

  it("セットと食品を結合し、項目の順序を維持して取得する", async () => {
    const getAllAsync = jest.fn(async () => [FIRST_ROW, SECOND_ROW]);
    const repository = new SQLiteFoodSetRepository({
      getAllAsync,
    } as unknown as SQLiteDatabase);

    const result = await repository.findAll();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "set-id",
      name: "いつもの朝食",
      createdAt: "2026-09-12T00:00:00.000Z",
      updatedAt: "2026-09-12T00:00:00.000Z",
      items: [
        expect.objectContaining({
          id: "item-1",
          servingMultiplier: 2,
          sortOrder: 0,
          food: expect.objectContaining({ id: "food-1", name: "ゆで卵" }),
        }),
        expect.objectContaining({
          id: "item-2",
          servingMultiplier: 1,
          sortOrder: 1,
          food: expect.objectContaining({ id: "food-2", name: "玄米" }),
        }),
      ],
    });
    expect(getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining("ORDER BY food_sets.created_at DESC"),
    );
  });

  it("IDを指定してセットを取得する", async () => {
    const getAllAsync = jest.fn(async () => [FIRST_ROW, SECOND_ROW]);
    const repository = new SQLiteFoodSetRepository({
      getAllAsync,
    } as unknown as SQLiteDatabase);

    await expect(repository.findById("set-id")).resolves.toEqual(
      expect.objectContaining({ id: "set-id", name: "いつもの朝食" }),
    );
    expect(getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining("WHERE food_sets.id = ?"),
      "set-id",
    );
  });

  it("存在しないIDではnullを返す", async () => {
    const repository = new SQLiteFoodSetRepository({
      getAllAsync: jest.fn(async () => []),
    } as unknown as SQLiteDatabase);

    await expect(repository.findById("missing")).resolves.toBeNull();
  });

  it("食品がセットで使用中か確認する", async () => {
    const getFirstAsync = jest.fn(async () => ({ item_count: 1 }));
    const repository = new SQLiteFoodSetRepository({
      getFirstAsync,
    } as unknown as SQLiteDatabase);

    await expect(repository.isFoodUsed("food-1")).resolves.toBe(true);
    expect(getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining("FROM food_set_items"),
      "food-1",
    );
  });

  it("セットと複数項目を1つのトランザクションで登録する", async () => {
    const runAsync = jest.fn(async () => ({ changes: 1 }));
    const withTransactionAsync = jest.fn(
      async (callback: () => Promise<void>) => callback(),
    );
    const repository = new SQLiteFoodSetRepository({
      getAllAsync: jest.fn(async () => [
        { ...FIRST_ROW, set_id: "generated-id-0", item_id: "generated-id-1" },
        {
          ...SECOND_ROW,
          set_id: "generated-id-0",
          item_id: "generated-id-2",
        },
      ]),
      runAsync,
      withTransactionAsync,
    } as unknown as SQLiteDatabase);

    await expect(repository.create(INPUT)).resolves.toEqual(
      expect.objectContaining({ id: "generated-id-0" }),
    );

    expect(withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(runAsync).toHaveBeenCalledTimes(3);
    expect(runAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("INSERT INTO food_sets"),
      "generated-id-0",
      "いつもの朝食",
      expect.any(String),
      expect.any(String),
    );
    expect(runAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("INSERT INTO food_set_items"),
      "generated-id-1",
      "generated-id-0",
      "food-1",
      2,
      0,
      expect.any(String),
      expect.any(String),
    );
    expect(runAsync).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("INSERT INTO food_set_items"),
      "generated-id-2",
      "generated-id-0",
      "food-2",
      1,
      1,
      expect.any(String),
      expect.any(String),
    );
  });

  it("更新時に既存項目を置き換える", async () => {
    const runAsync = jest.fn(async () => ({ changes: 1 }));
    const withTransactionAsync = jest.fn(
      async (callback: () => Promise<void>) => callback(),
    );
    const repository = new SQLiteFoodSetRepository({
      getAllAsync: jest.fn(async () => [
        { ...FIRST_ROW, set_name: "更新後", serving_multiplier: 0.5 },
      ]),
      runAsync,
      withTransactionAsync,
    } as unknown as SQLiteDatabase);

    await repository.update("set-id", {
      name: "更新後",
      items: [{ foodId: "food-1", servingMultiplier: 0.5 }],
    });

    expect(withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(runAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("UPDATE food_sets"),
      "更新後",
      expect.any(String),
      "set-id",
    );
    expect(runAsync).toHaveBeenNthCalledWith(
      2,
      "DELETE FROM food_set_items WHERE food_set_id = ?",
      "set-id",
    );
    expect(runAsync).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("INSERT INTO food_set_items"),
      expect.any(String),
      "set-id",
      "food-1",
      0.5,
      0,
      expect.any(String),
      expect.any(String),
    );
  });

  it("食品が0件のセットは登録・更新しない", async () => {
    const withTransactionAsync = jest.fn();
    const repository = new SQLiteFoodSetRepository({
      withTransactionAsync,
    } as unknown as SQLiteDatabase);

    await expect(
      repository.create({ name: "空のセット", items: [] }),
    ).rejects.toThrow("at least one item");
    await expect(
      repository.update("set-id", { name: "空のセット", items: [] }),
    ).rejects.toThrow("at least one item");
    expect(withTransactionAsync).not.toHaveBeenCalled();
  });

  it("存在しないセットの更新と削除は失敗する", async () => {
    const withTransactionAsync = jest.fn(
      async (callback: () => Promise<void>) => callback(),
    );
    const updateRepository = new SQLiteFoodSetRepository({
      runAsync: jest.fn(async () => ({ changes: 0 })),
      withTransactionAsync,
    } as unknown as SQLiteDatabase);
    const deleteRepository = new SQLiteFoodSetRepository({
      runAsync: jest.fn(async () => ({ changes: 0 })),
    } as unknown as SQLiteDatabase);

    await expect(updateRepository.update("missing", INPUT)).rejects.toThrow(
      "Food set not found",
    );
    await expect(deleteRepository.delete("missing")).rejects.toThrow(
      "Food set not found",
    );
  });

  it("セットを削除する", async () => {
    const runAsync = jest.fn(async () => ({ changes: 1 }));
    const repository = new SQLiteFoodSetRepository({
      runAsync,
    } as unknown as SQLiteDatabase);

    await expect(repository.delete("set-id")).resolves.toBeUndefined();
    expect(runAsync).toHaveBeenCalledWith(
      "DELETE FROM food_sets WHERE id = ?",
      "set-id",
    );
  });
});
