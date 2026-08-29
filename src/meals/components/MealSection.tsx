import { Pressable, StyleSheet, Text, View } from "react-native";

import { MEAL_TYPE_LABELS } from "@/meals/constants/meal-types";
import type { MealEntry, MealType } from "@/meals/types/meal";
import { colors } from "@/shared/theme/colors";

type MealEntryRowProps = {
  entry: MealEntry;
};

type MealSectionProps = {
  mealType: MealType;
  entries: MealEntry[];
  onAddMeal?: (mealType: MealType) => void;
};

const MEAL_SYMBOLS: Record<MealType, string> = {
  breakfast: "○",
  lunch: "◌",
  dinner: "◐",
  snack: "◇",
};

function MealEntryRow({ entry }: MealEntryRowProps) {
  return (
    <View style={styles.entryRow}>
      <View style={styles.entryIcon}>
        <Text style={styles.entryIconText}>{MEAL_SYMBOLS[entry.mealType]}</Text>
      </View>
      <View style={styles.entryContent}>
        <Text numberOfLines={1} style={styles.entryName}>
          {entry.name}
        </Text>
        <Text style={styles.entryMacros}>
          P {entry.protein} · F {entry.fat} · C {entry.carbs}
        </Text>
      </View>
      <Text style={styles.entryCalories}>
        {entry.calories}
        <Text style={styles.entryCaloriesUnit}> kcal</Text>
      </Text>
      <Text style={styles.chevron}>›</Text>
    </View>
  );
}

export function MealSection({
  mealType,
  entries,
  onAddMeal,
}: MealSectionProps) {
  const label = MEAL_TYPE_LABELS[mealType];
  const totalCalories = entries.reduce(
    (total, entry) => total + entry.calories,
    0,
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>{label}</Text>
        <Text style={styles.headerCalories}>
          {totalCalories.toLocaleString()} kcal
        </Text>
      </View>

      {entries.length > 0 ? (
        entries.map((entry) => <MealEntryRow entry={entry} key={entry.id} />)
      ) : (
        <Pressable
          accessibilityLabel={`${label}を追加`}
          onPress={() => onAddMeal?.(mealType)}
          style={styles.emptyButton}
        >
          <Text style={styles.emptyButtonText}>＋ {label}を追加</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  header: {
    backgroundColor: colors.surfaceMuted,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  headerLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  headerCalories: {
    color: colors.textMuted,
    fontSize: 12,
  },
  entryRow: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 8,
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  entryIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  entryIconText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  entryContent: {
    flex: 1,
  },
  entryName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  entryMacros: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 3,
  },
  entryCalories: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  entryCaloriesUnit: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "400",
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 18,
  },
  emptyButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 12,
  },
  emptyButtonText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "600",
  },
});
