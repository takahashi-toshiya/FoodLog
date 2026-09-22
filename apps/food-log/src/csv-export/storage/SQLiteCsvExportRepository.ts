import type { SQLiteDatabase } from "expo-sqlite";

import type { CsvExportRepository } from "@/csv-export/storage/CsvExportRepository";
import type { CsvExportSourceData } from "@/csv-export/types/csvExport";

type DailyNutritionRow = {
  recorded_date: string;
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
};

type DailyWeightRow = {
  recorded_date: string;
  weight_kg: number;
};

export class SQLiteCsvExportRepository implements CsvExportRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<CsvExportSourceData> {
    const [nutritionRows, weightRows] = await Promise.all([
      this.db.getAllAsync<DailyNutritionRow>(
        `SELECT
           recorded_date,
           SUM(protein) AS protein,
           SUM(fat) AS fat,
           SUM(carbs) AS carbs,
           SUM(calories) AS calories
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
      dailyNutrition: nutritionRows.map((row) => ({
        date: row.recorded_date,
        protein: row.protein,
        fat: row.fat,
        carbs: row.carbs,
        calories: row.calories,
      })),
      dailyWeights: weightRows.map((row) => ({
        date: row.recorded_date,
        weightKg: row.weight_kg,
      })),
    };
  }
}
