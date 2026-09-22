import type { SQLiteDatabase } from "expo-sqlite";

import type { AnalysisRepository } from "@/analysis/storage/AnalysisRepository";
import type { AnalysisSourceData } from "@/analysis/types/analysis";

type DailyCalorieRow = {
  recorded_date: string;
  calories: number;
};

type DailyWeightRow = {
  recorded_date: string;
  weight_kg: number;
};

export class SQLiteAnalysisRepository implements AnalysisRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<AnalysisSourceData> {
    const [calorieRows, weightRows] = await Promise.all([
      this.db.getAllAsync<DailyCalorieRow>(
        `SELECT recorded_date, SUM(calories) AS calories
         FROM meal_entries
         WHERE recorded_date BETWEEN ? AND ?
         GROUP BY recorded_date
         ORDER BY recorded_date ASC`,
        startDate,
        endDate,
      ),
      this.db.getAllAsync<DailyWeightRow>(
        `SELECT recorded_date, weight_kg
         FROM weight_records
         WHERE recorded_date BETWEEN ? AND ?
         ORDER BY recorded_date ASC`,
        startDate,
        endDate,
      ),
    ]);

    return {
      dailyCalories: calorieRows.map((row) => ({
        date: row.recorded_date,
        calories: row.calories,
      })),
      dailyWeights: weightRows.map((row) => ({
        date: row.recorded_date,
        weightKg: row.weight_kg,
      })),
    };
  }
}
