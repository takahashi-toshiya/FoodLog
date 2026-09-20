export type DailyCalorieRecord = {
  date: string;
  calories: number;
};

export type DailyWeightRecord = {
  date: string;
  weightKg: number;
};

export type AnalysisSourceData = {
  dailyCalories: DailyCalorieRecord[];
  dailyWeights: DailyWeightRecord[];
};

export type AnalysisChartPoint = {
  key: string;
  label: string;
  startDate: string;
  endDate: string;
  calories: number | null;
  weightKg: number | null;
};

export type EstimatedExpenditureStatus =
  "available" | "notApplicable" | "insufficientData";

export type AnalysisSummary = {
  averageCalories: number | null;
  weightChangeKg: number | null;
  estimatedExpenditure: number | null;
  estimatedExpenditureStatus: EstimatedExpenditureStatus;
  mealRecordedDays: number;
  weightRecordedDays: number;
  totalDays: number;
};

export type AnalysisReport = {
  startDate: string;
  endDate: string;
  granularity: "day" | "week" | "month";
  points: AnalysisChartPoint[];
  summary: AnalysisSummary;
};
