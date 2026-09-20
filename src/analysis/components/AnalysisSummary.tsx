import { StyleSheet, Text, View } from "react-native";

import type { AnalysisSummary as AnalysisSummaryValue } from "@/analysis/types/analysis";
import { colors } from "@/shared/theme/colors";

type AnalysisSummaryProps = {
  summary: AnalysisSummaryValue;
};

export function AnalysisSummary({ summary }: AnalysisSummaryProps) {
  return (
    <View style={styles.container}>
      <SummaryRow
        label="平均摂取カロリー"
        value={
          summary.averageCalories === null
            ? "算出不可"
            : `${Math.round(summary.averageCalories).toLocaleString()} kcal/日`
        }
      />
      <SummaryRow
        label="体重変化"
        value={formatWeightChange(summary.weightChangeKg)}
      />
      <SummaryRow
        isEstimate
        label="推定消費カロリー"
        value={formatEstimatedExpenditure(summary)}
      />

      <View style={styles.coverage}>
        <Text style={styles.coverageText}>
          食事記録 {summary.mealRecordedDays}/{summary.totalDays}日
        </Text>
        <Text style={styles.coverageText}>
          体重記録 {summary.weightRecordedDays}/{summary.totalDays}日
        </Text>
      </View>
    </View>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
  isEstimate?: boolean;
};

function SummaryRow({ label, value, isEstimate = false }: SummaryRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, isEstimate && styles.estimateValue]}>
        {value}
      </Text>
    </View>
  );
}

function formatWeightChange(value: number | null): string {
  if (value === null) {
    return "算出不可";
  }

  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded.toFixed(1)} kg`;
}

function formatEstimatedExpenditure(summary: AnalysisSummaryValue): string {
  if (
    summary.estimatedExpenditureStatus === "available" &&
    summary.estimatedExpenditure !== null
  ) {
    return `約${Math.round(summary.estimatedExpenditure).toLocaleString()} kcal/日`;
  }

  if (summary.estimatedExpenditureStatus === "notApplicable") {
    return "4週間以上で表示";
  }

  return "データ不足";
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 54,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  value: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  estimateValue: {
    color: colors.primary,
  },
  coverage: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 12,
  },
  coverageText: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
