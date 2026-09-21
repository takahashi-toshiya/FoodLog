import type {
  CsvExportDateRange,
  CsvExportRow,
  CsvExportSourceData,
} from "@/csv-export/types/csvExport";
import { addDays, toDateKey } from "@/shared/utils/date";

const UTF8_BOM = "\uFEFF";
const CSV_HEADER = [
  "日付",
  "たんぱく質(g)",
  "脂質(g)",
  "炭水化物(g)",
  "総カロリー(kcal)",
  "体重(kg)",
];

export function getDefaultCsvExportDateRange(
  todayDateKey: string,
): CsvExportDateRange {
  const today = new Date(`${todayDateKey}T00:00:00`);
  return {
    startDate: toDateKey(addDays(today, -29)),
    endDate: todayDateKey,
  };
}

export function buildCsvExportRows(
  source: CsvExportSourceData,
): CsvExportRow[] {
  const rowsByDate = new Map<string, CsvExportRow>();

  source.dailyNutrition.forEach((nutrition) => {
    rowsByDate.set(nutrition.date, {
      date: nutrition.date,
      protein: nutrition.protein,
      fat: nutrition.fat,
      carbs: nutrition.carbs,
      calories: nutrition.calories,
      weightKg: null,
    });
  });

  source.dailyWeights.forEach((weight) => {
    const existing = rowsByDate.get(weight.date);
    rowsByDate.set(weight.date, {
      date: weight.date,
      protein: existing?.protein ?? null,
      fat: existing?.fat ?? null,
      carbs: existing?.carbs ?? null,
      calories: existing?.calories ?? null,
      weightKg: weight.weightKg,
    });
  });

  return [...rowsByDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function createCsvContent(rows: CsvExportRow[]): string {
  const lines = [
    CSV_HEADER,
    ...rows.map((row) => [
      row.date,
      formatNumber(row.protein),
      formatNumber(row.fat),
      formatNumber(row.carbs),
      formatNumber(row.calories),
      formatNumber(row.weightKg),
    ]),
  ];

  return `${UTF8_BOM}${lines.map(toCsvLine).join("\r\n")}\r\n`;
}

export function createCsvFileName(startDate: string, endDate: string): string {
  return `foodlog_${startDate}_${endDate}.csv`;
}

function formatNumber(value: number | null): string {
  if (value === null) return "";
  return String(Number(value.toFixed(6)));
}

function toCsvLine(values: (string | number)[]): string {
  return values.map((value) => escapeCsvValue(String(value))).join(",");
}

function escapeCsvValue(value: string): string {
  if (!/[",\r\n]/.test(value)) return value;
  return `"${value.replaceAll('"', '""')}"`;
}
