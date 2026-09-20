import type { SQLiteDatabase } from "expo-sqlite";

import { SQLiteAnalysisRepository } from "@/analysis/storage/SQLiteAnalysisRepository";

describe("SQLite分析Repository", () => {
  it("指定期間の日別カロリーと体重を取得する", async () => {
    const getAllAsync = jest.fn(async (query: string) => {
      if (query.includes("SUM(calories)")) {
        return [
          { recorded_date: "2026-09-01", calories: 2_100 },
          { recorded_date: "2026-09-02", calories: 2_300 },
        ];
      }

      return [{ recorded_date: "2026-09-02", weight_kg: 70.4 }];
    });
    const repository = new SQLiteAnalysisRepository({
      getAllAsync,
    } as unknown as SQLiteDatabase);

    await expect(
      repository.findByDateRange("2026-09-01", "2026-09-28"),
    ).resolves.toEqual({
      dailyCalories: [
        { date: "2026-09-01", calories: 2_100 },
        { date: "2026-09-02", calories: 2_300 },
      ],
      dailyWeights: [{ date: "2026-09-02", weightKg: 70.4 }],
    });
    expect(getAllAsync).toHaveBeenCalledTimes(2);
    expect(getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining("GROUP BY recorded_date"),
      "2026-09-01",
      "2026-09-28",
    );
    expect(getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining("FROM weight_records"),
      "2026-09-01",
      "2026-09-28",
    );
  });

  it("記録がない期間では空配列を返す", async () => {
    const repository = new SQLiteAnalysisRepository({
      getAllAsync: jest.fn(async () => []),
    } as unknown as SQLiteDatabase);

    await expect(
      repository.findByDateRange("2026-09-01", "2026-09-28"),
    ).resolves.toEqual({ dailyCalories: [], dailyWeights: [] });
  });
});
