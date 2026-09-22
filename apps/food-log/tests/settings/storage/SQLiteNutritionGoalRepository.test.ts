import type { SQLiteDatabase } from "expo-sqlite";

import { SQLiteNutritionGoalRepository } from "@/settings/storage/SQLiteNutritionGoalRepository";

jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(() => "new-goal-id"),
}));

const row = {
  id: "goal-id",
  effective_from: "2026-09-05",
  calories: 2200,
  protein: 140,
  fat: 60,
  carbs: 270,
  created_at: "2026-09-05T00:00:00.000Z",
  updated_at: "2026-09-05T00:00:00.000Z",
};

describe("SQLite栄養目標Repository", () => {
  it("指定日以前で最新の目標値を取得する", async () => {
    const getFirstAsync = jest.fn(async () => row);
    const repository = new SQLiteNutritionGoalRepository({
      getFirstAsync,
    } as unknown as SQLiteDatabase);

    await expect(repository.findEffectiveOn("2026-09-10")).resolves.toEqual({
      id: "goal-id",
      effectiveFrom: "2026-09-05",
      calories: 2200,
      protein: 140,
      fat: 60,
      carbs: 270,
      createdAt: "2026-09-05T00:00:00.000Z",
      updatedAt: "2026-09-05T00:00:00.000Z",
    });
    expect(getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining("WHERE effective_from <= ?"),
      "2026-09-10",
    );
  });

  it("同じ適用開始日はUPSERTで保存する", async () => {
    const runAsync = jest.fn(async () => ({ changes: 1 }));
    const repository = new SQLiteNutritionGoalRepository({
      runAsync,
      getFirstAsync: jest.fn(async () => row),
    } as unknown as SQLiteDatabase);

    await repository.save({
      effectiveFrom: "2026-09-05",
      calories: 2200,
      protein: 140,
      fat: 60,
      carbs: 270,
    });

    expect(runAsync).toHaveBeenCalledWith(
      expect.stringContaining("ON CONFLICT(effective_from) DO UPDATE"),
      "new-goal-id",
      "2026-09-05",
      2200,
      140,
      60,
      270,
      expect.any(String),
      expect.any(String),
    );
  });
});
