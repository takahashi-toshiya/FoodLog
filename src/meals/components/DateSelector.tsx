import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/shared/theme/colors";
import { addDays, formatShortDate, toDateKey } from "@/shared/utils/date";

type DateSelectorProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

const DATE_OFFSETS = [-2, -1, 0, 1, 2];

export function DateSelector({ selectedDate, onSelectDate }: DateSelectorProps) {
  const selectedDateKey = toDateKey(selectedDate);

  return (
    <View accessibilityRole="tablist" style={styles.container}>
      <Pressable
        accessibilityLabel="前の日へ"
        onPress={() => onSelectDate(addDays(selectedDate, -1))}
        style={styles.arrow}
      >
        <Text style={styles.arrowText}>‹</Text>
      </Pressable>

      {DATE_OFFSETS.map((offset) => {
        const date = addDays(selectedDate, offset);
        const isSelected = toDateKey(date) === selectedDateKey;

        return (
          <Pressable
            accessibilityLabel={`${date.getMonth() + 1}月${date.getDate()}日`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            key={toDateKey(date)}
            onPress={() => onSelectDate(date)}
            style={[styles.date, isSelected && styles.selectedDate]}
          >
            <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
              {formatShortDate(date)}
            </Text>
          </Pressable>
        );
      })}

      <Pressable
        accessibilityLabel="次の日へ"
        onPress={() => onSelectDate(addDays(selectedDate, 1))}
        style={styles.arrow}
      >
        <Text style={styles.arrowText}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  arrow: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    width: 28,
  },
  arrowText: {
    color: colors.textMuted,
    fontSize: 24,
  },
  date: {
    alignItems: "center",
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    minHeight: 40,
  },
  selectedDate: {
    backgroundColor: colors.primary,
  },
  dateText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  selectedDateText: {
    color: colors.surface,
    fontWeight: "800",
  },
});
