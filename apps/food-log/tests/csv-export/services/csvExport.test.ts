import {
  buildCsvExportRows,
  createCsvContent,
  createCsvFileName,
  getDefaultCsvExportDateRange,
} from "@/csv-export/services/csvExport";

describe("CSV生成", () => {
  it("食事と体重を日付ごとに統合して昇順に並べる", () => {
    const rows = buildCsvExportRows({
      dailyNutrition: [
        {
          date: "2026-09-20",
          protein: 120,
          fat: 55,
          carbs: 240,
          calories: 1_935,
        },
        {
          date: "2026-09-19",
          protein: 115,
          fat: 50,
          carbs: 220,
          calories: 1_790,
        },
      ],
      dailyWeights: [
        { date: "2026-09-18", weightKg: 68.4 },
        { date: "2026-09-20", weightKg: 68.1 },
      ],
    });

    expect(rows).toEqual([
      {
        date: "2026-09-18",
        protein: null,
        fat: null,
        carbs: null,
        calories: null,
        weightKg: 68.4,
      },
      {
        date: "2026-09-19",
        protein: 115,
        fat: 50,
        carbs: 220,
        calories: 1_790,
        weightKg: null,
      },
      {
        date: "2026-09-20",
        protein: 120,
        fat: 55,
        carbs: 240,
        calories: 1_935,
        weightKg: 68.1,
      },
    ]);
  });

  it("日本語ヘッダー、BOM、CRLFと未記録の空欄を含むCSVを生成する", () => {
    const content = createCsvContent([
      {
        date: "2026-09-19",
        protein: 115,
        fat: 50,
        carbs: 220,
        calories: 1_790,
        weightKg: null,
      },
      {
        date: "2026-09-20",
        protein: null,
        fat: null,
        carbs: null,
        calories: null,
        weightKg: 68.1,
      },
    ]);

    expect(content).toBe(
      "\uFEFF日付,たんぱく質(g),脂質(g),炭水化物(g),総カロリー(kcal),体重(kg)\r\n" +
        "2026-09-19,115,50,220,1790,\r\n" +
        "2026-09-20,,,,,68.1\r\n",
    );
    expect(content).not.toContain("\n2026-09-19,115,50,220,1,790");
  });

  it("空データではヘッダーだけを生成する", () => {
    expect(createCsvContent([])).toBe(
      "\uFEFF日付,たんぱく質(g),脂質(g),炭水化物(g),総カロリー(kcal),体重(kg)\r\n",
    );
  });

  it("当日を含む直近30日を初期期間にする", () => {
    expect(getDefaultCsvExportDateRange("2026-09-20")).toEqual({
      startDate: "2026-08-22",
      endDate: "2026-09-20",
    });
  });

  it("選択期間を含むファイル名を生成する", () => {
    expect(createCsvFileName("2026-08-22", "2026-09-20")).toBe(
      "foodlog_2026-08-22_2026-09-20.csv",
    );
  });
});
