import {
  buildAnalysisReport,
  getDefaultAnalysisDateRange,
} from "@/analysis/services/dailyAnalysis";
import type { AnalysisSourceData } from "@/analysis/types/analysis";
import { addDays, toDateKey } from "@/shared/utils/date";

describe("日次分析", () => {
  it("初期期間として終了日を含む直近30日を返す", () => {
    expect(getDefaultAnalysisDateRange("2026-09-20")).toEqual({
      startDate: "2026-08-22",
      endDate: "2026-09-20",
    });
  });

  it("未記録日を0にせず日別データを生成する", () => {
    const report = buildAnalysisReport(
      {
        dailyCalories: [{ date: "2026-09-19", calories: 2_000 }],
        dailyWeights: [{ date: "2026-09-20", weightKg: 70.5 }],
      },
      "2026-09-14",
      "2026-09-20",
    );

    expect(report.granularity).toBe("day");
    expect(report.points).toHaveLength(7);
    expect(report.points.find((point) => point.key === "2026-09-19")).toEqual(
      expect.objectContaining({ calories: 2_000, weightKg: null }),
    );
    expect(report.points.find((point) => point.key === "2026-09-20")).toEqual(
      expect.objectContaining({ calories: null, weightKg: 70.5 }),
    );
  });

  it("32日から180日までは週ごとの記録日の平均へ集計する", () => {
    const report = buildAnalysisReport(
      {
        dailyCalories: [
          { date: "2026-08-20", calories: 2_000 },
          { date: "2026-08-21", calories: 2_200 },
        ],
        dailyWeights: [
          { date: "2026-08-20", weightKg: 70 },
          { date: "2026-08-21", weightKg: 71 },
        ],
      },
      "2026-08-20",
      "2026-09-20",
    );

    expect(report.granularity).toBe("week");
    expect(report.points).toHaveLength(5);
    expect(report.points[0]).toEqual(
      expect.objectContaining({ calories: 2_100, weightKg: 70.5 }),
    );
  });

  it("181日以上は月ごとの記録日の平均へ集計する", () => {
    const report = buildAnalysisReport(
      {
        dailyCalories: [
          { date: "2025-09-20", calories: 2_000 },
          { date: "2025-09-21", calories: 2_200 },
        ],
        dailyWeights: [
          { date: "2025-09-20", weightKg: 70 },
          { date: "2025-09-21", weightKg: 71 },
        ],
      },
      "2025-09-20",
      "2026-09-20",
    );

    expect(report.granularity).toBe("month");
    expect(report.points).toHaveLength(13);
    expect(report.points[0]).toEqual(
      expect.objectContaining({
        label: "2025/9",
        calories: 2_100,
        weightKg: 70.5,
      }),
    );
  });

  it("31日・180日・181日の境界で集計単位を切り替える", () => {
    const source = { dailyCalories: [], dailyWeights: [] };

    expect(
      buildAnalysisReport(source, "2026-01-01", "2026-01-31").granularity,
    ).toBe("day");
    expect(
      buildAnalysisReport(source, "2026-01-01", "2026-06-29").granularity,
    ).toBe("week");
    expect(
      buildAnalysisReport(source, "2026-01-01", "2026-06-30").granularity,
    ).toBe("month");
  });

  it("2年間を月別データとして生成する", () => {
    const report = buildAnalysisReport(
      { dailyCalories: [], dailyWeights: [] },
      "2024-09-20",
      "2026-09-20",
    );

    expect(report.granularity).toBe("month");
    expect(report.points).toHaveLength(25);
    expect(report.points[0].label).toBe("2024/9");
    expect(report.points[24].label).toBe("2026/9");
  });

  it("記録日の平均カロリーと最初から最後までの体重変化を計算する", () => {
    const report = buildAnalysisReport(
      {
        dailyCalories: [
          { date: "2026-09-14", calories: 2_000 },
          { date: "2026-09-16", calories: 2_400 },
        ],
        dailyWeights: [
          { date: "2026-09-14", weightKg: 71.2 },
          { date: "2026-09-20", weightKg: 70.7 },
        ],
      },
      "2026-09-14",
      "2026-09-20",
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

  it("28日以上の十分な記録から消費カロリーを推定する", () => {
    const source = createCalorieSource("2026-08-22", 30, 2_000);
    source.dailyWeights = [
      { date: "2026-08-22", weightKg: 70 },
      { date: "2026-09-20", weightKg: 69 },
    ];

    const report = buildAnalysisReport(source, "2026-08-22", "2026-09-20");

    expect(report.summary.estimatedExpenditureStatus).toBe("available");
    expect(report.summary.estimatedExpenditure).toBeCloseTo(2_000 + 7_700 / 29);
  });

  it("食事記録率が80%未満の場合は消費カロリーを推定しない", () => {
    const source = createCalorieSource("2026-08-22", 23, 2_000);
    source.dailyWeights = [
      { date: "2026-08-22", weightKg: 70 },
      { date: "2026-09-20", weightKg: 69 },
    ];

    const report = buildAnalysisReport(source, "2026-08-22", "2026-09-20");

    expect(report.summary.estimatedExpenditure).toBeNull();
    expect(report.summary.estimatedExpenditureStatus).toBe("insufficientData");
  });

  it("体重記録の間隔が14日未満の場合は消費カロリーを推定しない", () => {
    const source = createCalorieSource("2026-08-22", 30, 2_000);
    source.dailyWeights = [
      { date: "2026-09-07", weightKg: 70 },
      { date: "2026-09-20", weightKg: 69 },
    ];

    const report = buildAnalysisReport(source, "2026-08-22", "2026-09-20");

    expect(report.summary.estimatedExpenditure).toBeNull();
    expect(report.summary.estimatedExpenditureStatus).toBe("insufficientData");
  });

  it("開始日が終了日より後の場合は拒否する", () => {
    expect(() =>
      buildAnalysisReport(
        { dailyCalories: [], dailyWeights: [] },
        "2026-09-21",
        "2026-09-20",
      ),
    ).toThrow("開始日は終了日以前");
  });
});

function createCalorieSource(
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
