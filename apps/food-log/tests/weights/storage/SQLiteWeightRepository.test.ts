import type { SQLiteDatabase } from "expo-sqlite";

import { SQLiteWeightRepository } from "@/weights/storage/SQLiteWeightRepository";

jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(() => "new-weight-id"),
}));

const row = {
  id: "weight-id",
  recorded_date: "2026-09-19",
  weight_kg: 72.45,
  created_at: "2026-09-19T00:00:00.000Z",
  updated_at: "2026-09-19T00:00:00.000Z",
};

describe("SQLite体重Repository", () => {
  it("指定日の体重を取得する", async () => {
    const getFirstAsync = jest.fn(async () => row);
    const repository = new SQLiteWeightRepository({
      getFirstAsync,
    } as unknown as SQLiteDatabase);

    await expect(repository.findByDate("2026-09-19")).resolves.toEqual({
      id: "weight-id",
      recordedDate: "2026-09-19",
      weightKg: 72.45,
      createdAt: "2026-09-19T00:00:00.000Z",
      updatedAt: "2026-09-19T00:00:00.000Z",
    });
    expect(getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining("WHERE recorded_date = ?"),
      "2026-09-19",
    );
  });

  it("未記録の日付ではnullを返す", async () => {
    const repository = new SQLiteWeightRepository({
      getFirstAsync: jest.fn(async () => null),
    } as unknown as SQLiteDatabase);

    await expect(repository.findByDate("2026-09-18")).resolves.toBeNull();
  });

  it("同じ日付はUPSERTで保存する", async () => {
    const runAsync = jest.fn(async () => ({ changes: 1 }));
    const repository = new SQLiteWeightRepository({
      runAsync,
      getFirstAsync: jest.fn(async () => row),
    } as unknown as SQLiteDatabase);

    await repository.save({ recordedDate: "2026-09-19", weightKg: 72.45 });

    expect(runAsync).toHaveBeenCalledWith(
      expect.stringContaining("ON CONFLICT(recorded_date) DO UPDATE"),
      "new-weight-id",
      "2026-09-19",
      72.45,
      expect.any(String),
      expect.any(String),
    );
    expect(runAsync).toHaveBeenCalledWith(
      expect.not.stringContaining("id = excluded.id"),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
  });
});
