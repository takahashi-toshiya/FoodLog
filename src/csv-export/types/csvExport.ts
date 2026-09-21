export type DailyNutritionTotal = {
  date: string;
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
};

export type DailyWeightValue = {
  date: string;
  weightKg: number;
};

export type CsvExportSourceData = {
  dailyNutrition: DailyNutritionTotal[];
  dailyWeights: DailyWeightValue[];
};

export type CsvExportRow = {
  date: string;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  calories: number | null;
  weightKg: number | null;
};

export type CsvExportDateRange = {
  startDate: string;
  endDate: string;
};
