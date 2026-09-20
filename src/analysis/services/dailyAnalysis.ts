import type {
  AnalysisChartPoint,
  AnalysisReport,
  AnalysisSourceData,
  AnalysisSummary,
} from "@/analysis/types/analysis";
import { addDays, toDateKey } from "@/shared/utils/date";

const DEFAULT_RANGE_DAYS = 30;
const DAILY_GRANULARITY_MAX_DAYS = 31;
const WEEKLY_GRANULARITY_MAX_DAYS = 180;
const DAYS_PER_WEEK = 7;
const MINIMUM_ESTIMATE_RANGE_DAYS = 28;
const MINIMUM_ESTIMATE_DAYS = 14;
const MINIMUM_MEAL_COVERAGE = 0.8;
const KCAL_PER_KG = 7_700;

type DailyPoint = {
  date: string;
  calories: number | null;
  weightKg: number | null;
};

export function getDefaultAnalysisDateRange(endDate: string): {
  startDate: string;
  endDate: string;
} {
  return {
    startDate: toDateKey(
      addDays(parseDateKey(endDate), -(DEFAULT_RANGE_DAYS - 1)),
    ),
    endDate,
  };
}

export function buildAnalysisReport(
  source: AnalysisSourceData,
  startDate: string,
  endDate: string,
): AnalysisReport {
  const dailyPoints = createDailyPoints(source, startDate, endDate);
  const granularity = getGranularity(dailyPoints.length);

  return {
    startDate,
    endDate,
    granularity,
    points:
      granularity === "day"
        ? dailyPoints.map(toDailyChartPoint)
        : granularity === "week"
          ? createWeeklyPoints(dailyPoints)
          : createMonthlyPoints(dailyPoints),
    summary: createSummary(dailyPoints),
  };
}

function getGranularity(totalDays: number): AnalysisReport["granularity"] {
  if (totalDays <= DAILY_GRANULARITY_MAX_DAYS) {
    return "day";
  }

  if (totalDays <= WEEKLY_GRANULARITY_MAX_DAYS) {
    return "week";
  }

  return "month";
}

function createDailyPoints(
  source: AnalysisSourceData,
  startDate: string,
  endDate: string,
): DailyPoint[] {
  if (startDate > endDate) {
    throw new Error("分析期間の開始日は終了日以前である必要があります");
  }

  const caloriesByDate = new Map(
    source.dailyCalories.map((record) => [record.date, record.calories]),
  );
  const weightsByDate = new Map(
    source.dailyWeights.map((record) => [record.date, record.weightKg]),
  );
  const points: DailyPoint[] = [];
  const end = parseDateKey(endDate);

  for (
    let date = parseDateKey(startDate);
    date.getTime() <= end.getTime();
    date = addDays(date, 1)
  ) {
    const dateKey = toDateKey(date);
    points.push({
      date: dateKey,
      calories: caloriesByDate.get(dateKey) ?? null,
      weightKg: weightsByDate.get(dateKey) ?? null,
    });
  }

  return points;
}

function toDailyChartPoint(point: DailyPoint): AnalysisChartPoint {
  return {
    key: point.date,
    label: formatMonthDay(point.date),
    startDate: point.date,
    endDate: point.date,
    calories: point.calories,
    weightKg: point.weightKg,
  };
}

function createWeeklyPoints(points: DailyPoint[]): AnalysisChartPoint[] {
  const weeks: AnalysisChartPoint[] = [];

  for (let index = 0; index < points.length; index += DAYS_PER_WEEK) {
    weeks.push(
      createAggregatePoint(points.slice(index, index + DAYS_PER_WEEK)),
    );
  }

  return weeks;
}

function createMonthlyPoints(points: DailyPoint[]): AnalysisChartPoint[] {
  const months = new Map<string, DailyPoint[]>();

  for (const point of points) {
    const monthKey = point.date.slice(0, 7);
    const month = months.get(monthKey) ?? [];
    month.push(point);
    months.set(monthKey, month);
  }

  return [...months.values()].map((month) =>
    createAggregatePoint(month, formatYearMonth(month[0].date)),
  );
}

function createAggregatePoint(
  points: DailyPoint[],
  label?: string,
): AnalysisChartPoint {
  const startDate = points[0].date;
  const endDate = points[points.length - 1].date;

  return {
    key: startDate,
    label: label ?? `${formatMonthDay(startDate)}〜${formatMonthDay(endDate)}`,
    startDate,
    endDate,
    calories: averageRecorded(points.map((point) => point.calories)),
    weightKg: averageRecorded(points.map((point) => point.weightKg)),
  };
}

function createSummary(points: DailyPoint[]): AnalysisSummary {
  const caloriePoints = points.filter(
    (point): point is DailyPoint & { calories: number } =>
      point.calories !== null,
  );
  const weightPoints = points.filter(
    (point): point is DailyPoint & { weightKg: number } =>
      point.weightKg !== null,
  );
  const averageCalories = averageRecorded(
    caloriePoints.map((point) => point.calories),
  );
  const weightChangeKg =
    weightPoints.length >= 2
      ? weightPoints[weightPoints.length - 1].weightKg -
        weightPoints[0].weightKg
      : null;
  const estimate = estimateExpenditure(points, weightPoints);

  return {
    averageCalories,
    weightChangeKg,
    estimatedExpenditure: estimate.value,
    estimatedExpenditureStatus: estimate.status,
    mealRecordedDays: caloriePoints.length,
    weightRecordedDays: weightPoints.length,
    totalDays: points.length,
  };
}

function estimateExpenditure(
  points: DailyPoint[],
  weightPoints: (DailyPoint & { weightKg: number })[],
): {
  value: number | null;
  status: AnalysisSummary["estimatedExpenditureStatus"];
} {
  if (points.length < MINIMUM_ESTIMATE_RANGE_DAYS) {
    return { value: null, status: "notApplicable" };
  }

  if (weightPoints.length < 2) {
    return { value: null, status: "insufficientData" };
  }

  const firstWeight = weightPoints[0];
  const lastWeight = weightPoints[weightPoints.length - 1];
  const elapsedDays = differenceInDays(firstWeight.date, lastWeight.date);

  if (elapsedDays < MINIMUM_ESTIMATE_DAYS) {
    return { value: null, status: "insufficientData" };
  }

  const estimateInterval = points.filter(
    (point) => point.date >= firstWeight.date && point.date <= lastWeight.date,
  );
  const recordedCalories = estimateInterval.filter(
    (point): point is DailyPoint & { calories: number } =>
      point.calories !== null,
  );
  const coverage = recordedCalories.length / estimateInterval.length;

  if (coverage < MINIMUM_MEAL_COVERAGE) {
    return { value: null, status: "insufficientData" };
  }

  const averageCalories = averageRecorded(
    recordedCalories.map((point) => point.calories),
  );
  if (averageCalories === null) {
    return { value: null, status: "insufficientData" };
  }

  const weightChange = lastWeight.weightKg - firstWeight.weightKg;
  return {
    value: averageCalories - (weightChange * KCAL_PER_KG) / elapsedDays,
    status: "available",
  };
}

function averageRecorded(values: (number | null)[]): number | null {
  const recorded = values.filter((value): value is number => value !== null);
  if (recorded.length === 0) {
    return null;
  }

  return recorded.reduce((sum, value) => sum + value, 0) / recorded.length;
}

function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`);
}

function differenceInDays(startDate: string, endDate: string): number {
  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
  const start = Date.UTC(startYear, startMonth - 1, startDay);
  const end = Date.UTC(endYear, endMonth - 1, endDay);
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

function formatMonthDay(dateKey: string): string {
  const [, month, day] = dateKey.split("-").map(Number);
  return `${month}/${day}`;
}

function formatYearMonth(dateKey: string): string {
  const [year, month] = dateKey.split("-").map(Number);
  return `${year}/${month}`;
}
