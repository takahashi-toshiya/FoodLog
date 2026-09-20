import {
  buildAnalysisReport,
  getAnalysisDateRange,
} from "@/analysis/services/dailyAnalysis";
import type { AnalysisSourceData } from "@/analysis/types/analysis";
import { addDays, toDateKey } from "@/shared/utils/date";

describe("日次分析", () => {
  it("期間の開始日と終了日を両方含める", () => {
    expect(getAnalysisDateRange("2026-09-28", 1)).toEqual({
      startDate: "2026-09-22",
      endDate: "2026-09-28",
    });
    expect(getAnalysisDateRange("2026-09-28", 4)).toEqual({
      startDate: "2026-09-01",
      endDate: "2026-09-28",
    });
  });

  it("未記録日を0にせず日別データを生成する", () => {
    const report = buildAnalysisReport(
      {
        dailyCalories: [{ date: "2026-09-26", calories: 2_000 }],
        dailyWeights: [{ date: "2026-09-27", weightKg: 70.5 }],
      },
      1,
      "2026-09-28",
    );

    expect(report.points).toHaveLength(7);
    expect(report.points.find((point) => point.key === "2026-09-26")).toEqual(
      expect.objectContaining({ calories: 2_000, weightKg: null }),
    );
    expect(report.points.find((point) => point.key === "2026-09-27")).toEqual(
      expect.objectContaining({ calories: null, weightKg: 70.5 }),
    );
  });

  it("8週間は週ごとの記録日の平均へ集計する", () => {
    const report = buildAnalysisReport(
      {
        dailyCalories: [
          { date: "2026-08-04", calories: 2_000 },
          { date: "2026-08-05", calories: 2_200 },
        ],
        dailyWeights: [
          { date: "2026-08-04", weightKg: 70 },
          { date: "2026-08-05", weightKg: 71 },
        ],
      },
      8,
      "2026-09-28",
    );

    expect(report.granularity).toBe("week");
    expect(report.points).toHaveLength(8);
    expect(report.points[0]).toEqual(
      expect.objectContaining({ calories: 2_100, weightKg: 70.5 }),
    );
  });

  it("記録日の平均カロリーと最初から最後までの体重変化を計算する", () => {
    const report = buildAnalysisReport(
      {
        dailyCalories: [
          { date: "2026-09-22", calories: 2_000 },
          { date: "2026-09-24", calories: 2_400 },
        ],
        dailyWeights: [
          { date: "2026-09-22", weightKg: 71.2 },
          { date: "2026-09-28", weightKg: 70.7 },
        ],
      },
      1,
      "2026-09-28",
    );

    expect(report.summary).toEqual(
      expect.objectContaining({
        averageCalories: 2_200,
        weightChangeKg: -0.5,
        mealRecordedDays: 2,
        weightRecordedDays: 2,
        totalDays: 7,
        estimatedExpenditure: null,
        estimatedExpenditureStatus: "notApplicable",
      }),
    );
  });

  it("4週間以上の十分な記録から消費カロリーを推定する", () => {
    const source = createCompleteSource("2026-09-01", 28, 2_000);
    source.dailyWeights = [
      { date: "2026-09-01", weightKg: 70 },
      { date: "2026-09-28", weightKg: 69 },
    ];

    const report = buildAnalysisReport(source, 4, "2026-09-28");

    expect(report.summary.estimatedExpenditureStatus).toBe("available");
    expect(report.summary.estimatedExpenditure).toBeCloseTo(2_000 + 7_700 / 27);
  });

  it("食事記録率が80%未満の場合は消費カロリーを推定しない", () => {
    const source = createCompleteSource("2026-09-01", 22, 2_000);
    source.dailyWeights = [
      { date: "2026-09-01", weightKg: 70 },
      { date: "2026-09-28", weightKg: 69 },
    ];

    const report = buildAnalysisReport(source, 4, "2026-09-28");

    expect(report.summary.estimatedExpenditure).toBeNull();
    expect(report.summary.estimatedExpenditureStatus).toBe("insufficientData");
  });

  it("体重記録の間隔が14日未満の場合は消費カロリーを推定しない", () => {
    const source = createCompleteSource("2026-09-01", 28, 2_000);
    source.dailyWeights = [
      { date: "2026-09-15", weightKg: 70 },
      { date: "2026-09-28", weightKg: 69 },
    ];

    const report = buildAnalysisReport(source, 4, "2026-09-28");

    expect(report.summary.estimatedExpenditure).toBeNull();
    expect(report.summary.estimatedExpenditureStatus).toBe("insufficientData");
  });

  it("記録がない場合は集計値を算出しない", () => {
    const report = buildAnalysisReport(
      { dailyCalories: [], dailyWeights: [] },
      4,
      "2026-09-28",
    );

    expect(report.summary).toEqual(
      expect.objectContaining({
        averageCalories: null,
        weightChangeKg: null,
        estimatedExpenditure: null,
        mealRecordedDays: 0,
        weightRecordedDays: 0,
      }),
    );
  });
});

function createCompleteSource(
  startDate: string,
  days: number,
  calories: number,
): AnalysisSourceData {
  const start = new Date(`${startDate}T00:00:00`);
  return {
    dailyCalories: Array.from({ length: days }, (_, index) => ({
      date: toDateKey(addDays(start, index)),
      calories,
    })),
    dailyWeights: [],
  };
}
