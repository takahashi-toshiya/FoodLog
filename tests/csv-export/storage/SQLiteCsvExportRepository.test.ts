import type { SQLiteDatabase } from "expo-sqlite";

import { SQLiteCsvExportRepository } from "@/csv-export/storage/SQLiteCsvExportRepository";

describe("SQLite CSVエクスポートRepository", () => {
  it("指定期間の日別PFC・カロリーと体重を取得する", async () => {
    const getAllAsync = jest.fn(async (query: string) => {
      if (query.includes("SUM(protein)")) {
        return [
          {
            recorded_date: "2026-09-19",
            protein: 115,
            fat: 50,
            carbs: 220,
            calories: 1_790,
          },
          {
            recorded_date: "2026-09-20",
            protein: 120,
            fat: 55,
            carbs: 240,
            calories: 1_935,
          },
        ];
      }

      return [{ recorded_date: "2026-09-20", weight_kg: 68.1 }];
    });
    const repository = new SQLiteCsvExportRepository({
      getAllAsync,
    } as unknown as SQLiteDatabase);

    await expect(
      repository.findByDateRange("2026-09-01", "2026-09-20"),
    ).resolves.toEqual({
      dailyNutrition: [
        {
          date: "2026-09-19",
          protein: 115,
          fat: 50,
          carbs: 220,
          calories: 1_790,
        },
        {
          date: "2026-09-20",
          protein: 120,
          fat: 55,
          carbs: 240,
          calories: 1_935,
        },
      ],
      dailyWeights: [{ date: "2026-09-20", weightKg: 68.1 }],
    });
    expect(getAllAsync).toHaveBeenCalledTimes(2);
    expect(getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining("SUM(protein)"),
      "2026-09-01",
      "2026-09-20",
    );
    expect(getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining("FROM weight_records"),
      "2026-09-01",
      "2026-09-20",
    );
  });

  it("記録がない期間では空配列を返す", async () => {
    const repository = new SQLiteCsvExportRepository({
      getAllAsync: jest.fn(async () => []),
    } as unknown as SQLiteDatabase);

    await expect(
      repository.findByDateRange("2026-09-01", "2026-09-20"),
    ).resolves.toEqual({ dailyNutrition: [], dailyWeights: [] });
  });
});
