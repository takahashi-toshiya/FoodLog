import { Pressable, StyleSheet, Text, View } from "react-native";

import type { AnalysisPeriodWeeks } from "@/analysis/types/analysis";
import { colors } from "@/shared/theme/colors";

const PERIODS: { label: string; value: AnalysisPeriodWeeks }[] = [
  { label: "1週間", value: 1 },
  { label: "4週間", value: 4 },
  { label: "8週間", value: 8 },
  { label: "16週間", value: 16 },
];

type AnalysisPeriodSelectorProps = {
  selectedPeriod: AnalysisPeriodWeeks;
  onSelectPeriod: (period: AnalysisPeriodWeeks) => void;
};

export function AnalysisPeriodSelector({
  selectedPeriod,
  onSelectPeriod,
}: AnalysisPeriodSelectorProps) {
  return (
    <View accessibilityRole="tablist" style={styles.container}>
      {PERIODS.map((period) => {
        const isSelected = period.value === selectedPeriod;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            key={period.value}
            onPress={() => onSelectPeriod(period.value)}
            style={[styles.option, isSelected && styles.selectedOption]}
          >
            <Text style={[styles.label, isSelected && styles.selectedLabel]}>
              {period.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    flexDirection: "row",
    padding: 4,
  },
  option: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 4,
  },
  selectedOption: {
    backgroundColor: colors.surface,
    elevation: 1,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  selectedLabel: {
    color: colors.primary,
  },
});
