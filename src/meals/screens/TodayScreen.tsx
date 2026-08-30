import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DailyNutritionSummary } from "@/meals/components/DailyNutritionSummary";
import { DateSelector } from "@/meals/components/DateSelector";
import { MealSection } from "@/meals/components/MealSection";
import { MEAL_TYPES } from "@/meals/constants/meal-types";
import {
  createMealEntryFixtures,
  DEFAULT_NUTRITION_GOAL,
} from "@/meals/fixtures/mealEntries";
import { calculateNutritionTotals } from "@/meals/services/nutrition";
import { colors } from "@/shared/theme/colors";
import { formatLongDate, toDateKey } from "@/shared/utils/date";

export function TodayScreen() {
  const [today] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const mealEntries = useMemo(
    () => createMealEntryFixtures(toDateKey(today)),
    [today],
  );
  const selectedDateKey = toDateKey(selectedDate);
  const selectedEntries = mealEntries.filter(
    (entry) => entry.date === selectedDateKey,
  );
  const totals = calculateNutritionTotals(selectedEntries);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>今日の記録</Text>
            <Text style={styles.title}>{formatLongDate(selectedDate)}</Text>
          </View>
          <Pressable
            accessibilityLabel="カレンダーを開く"
            style={styles.calendarButton}
          >
            <Text style={styles.calendarIcon}>▦</Text>
          </Pressable>
        </View>

        <DateSelector
          onSelectDate={setSelectedDate}
          selectedDate={selectedDate}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <DailyNutritionSummary
            goal={DEFAULT_NUTRITION_GOAL}
            totals={totals}
          />

          <View style={styles.sectionTitle}>
            <Text style={styles.sectionTitleText}>食事</Text>
            <Text style={styles.entryCount}>{selectedEntries.length}件</Text>
          </View>

          {MEAL_TYPES.map((mealType) => (
            <MealSection
              entries={selectedEntries.filter(
                (entry) => entry.mealType === mealType,
              )}
              key={mealType}
              mealType={mealType}
            />
          ))}
        </ScrollView>

        <Pressable accessibilityLabel="食事を追加" style={styles.addButton}>
          <Text style={styles.addButtonText}>＋ 食事を追加</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 76,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  title: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "800",
  },
  calendarButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  calendarIcon: {
    color: colors.text,
    fontSize: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  sectionTitle: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    marginHorizontal: 2,
    marginTop: 20,
  },
  sectionTitleText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  entryCount: {
    backgroundColor: colors.progressTrack,
    borderRadius: 8,
    color: colors.textMuted,
    fontSize: 10,
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  addButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 18,
    bottom: 16,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 18,
    position: "absolute",
    right: 18,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  addButtonText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "800",
  },
});
