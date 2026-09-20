import type {
  AnalysisChartPoint,
  AnalysisPeriodWeeks,
  AnalysisReport,
  AnalysisSourceData,
  AnalysisSummary,
} from "@/analysis/types/analysis";
import { addDays, toDateKey } from "@/shared/utils/date";

const DAYS_PER_WEEK = 7;
const MINIMUM_ESTIMATE_WEEKS = 4;
const MINIMUM_ESTIMATE_DAYS = 14;
const MINIMUM_MEAL_COVERAGE = 0.8;
const KCAL_PER_KG = 7_700;

type DailyPoint = {
  date: string;
  calories: number | null;
  weightKg: number | null;
};

export function getAnalysisDateRange(
  endDate: string,
  periodWeeks: AnalysisPeriodWeeks,
): { startDate: string; endDate: string } {
  const totalDays = periodWeeks * DAYS_PER_WEEK;
  const end = parseDateKey(endDate);

  return {
    startDate: toDateKey(addDays(end, -(totalDays - 1))),
    endDate,
  };
}

export function buildAnalysisReport(
  source: AnalysisSourceData,
  periodWeeks: AnalysisPeriodWeeks,
  endDate: string,
): AnalysisReport {
  const range = getAnalysisDateRange(endDate, periodWeeks);
  const dailyPoints = createDailyPoints(source, range.startDate, range.endDate);
  const granularity = periodWeeks >= 8 ? "week" : "day";

  return {
    ...range,
    granularity,
    points:
      granularity === "week"
        ? createWeeklyPoints(dailyPoints)
        : dailyPoints.map(toDailyChartPoint),
    summary: createSummary(dailyPoints, periodWeeks),
  };
}

function createDailyPoints(
  source: AnalysisSourceData,
  startDate: string,
  endDate: string,
): DailyPoint[] {
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
    const week = points.slice(index, index + DAYS_PER_WEEK);
    const startDate = week[0].date;
    const endDate = week[week.length - 1].date;

    weeks.push({
      key: startDate,
      label: `${formatMonthDay(startDate)}〜${formatMonthDay(endDate)}`,
      startDate,
      endDate,
      calories: averageRecorded(week.map((point) => point.calories)),
      weightKg: averageRecorded(week.map((point) => point.weightKg)),
    });
  }

  return weeks;
}

function createSummary(
  points: DailyPoint[],
  periodWeeks: AnalysisPeriodWeeks,
): AnalysisSummary {
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
  const estimate = estimateExpenditure(points, weightPoints, periodWeeks);

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
  periodWeeks: AnalysisPeriodWeeks,
): {
  value: number | null;
  status: AnalysisSummary["estimatedExpenditureStatus"];
} {
  if (periodWeeks < MINIMUM_ESTIMATE_WEEKS) {
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
