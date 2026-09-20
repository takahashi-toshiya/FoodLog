import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/shared/theme/colors";

type AnalysisDateRangeSelectorProps = {
  startDate: string;
  endDate: string;
  onSelectStartDate: () => void;
  onSelectEndDate: () => void;
};

export function AnalysisDateRangeSelector({
  startDate,
  endDate,
  onSelectStartDate,
  onSelectEndDate,
}: AnalysisDateRangeSelectorProps) {
  return (
    <View style={styles.container}>
      <DateButton
        accessibilityLabel="分析期間の開始日を選択"
        date={startDate}
        label="開始日"
        onPress={onSelectStartDate}
      />
      <Text style={styles.separator}>〜</Text>
      <DateButton
        accessibilityLabel="分析期間の終了日を選択"
        date={endDate}
        label="終了日"
        onPress={onSelectEndDate}
      />
    </View>
  );
}

type DateButtonProps = {
  accessibilityLabel: string;
  date: string;
  label: string;
  onPress: () => void;
};

function DateButton({
  accessibilityLabel,
  date,
  label,
  onPress,
}: DateButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={styles.dateButton}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.date}>{formatDate(date)}</Text>
    </Pressable>
  );
}

function formatDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return `${year}/${month}/${day}`;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  dateButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  label: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 3,
  },
  date: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  separator: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
});
