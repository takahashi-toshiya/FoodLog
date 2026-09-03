import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DailyNutritionSummary } from "@/meals/components/DailyNutritionSummary";
import { DateSelector } from "@/meals/components/DateSelector";
import { MealSection } from "@/meals/components/MealSection";
import { MEAL_TYPES } from "@/meals/constants/meal-types";
import { DEFAULT_NUTRITION_GOAL } from "@/meals/fixtures/mealEntries";
import { calculateNutritionTotals } from "@/meals/services/nutrition";
import type { MealRepository } from "@/meals/storage/MealRepository";
import type { MealEntry, MealType } from "@/meals/types/meal";
import { colors } from "@/shared/theme/colors";
import { formatLongDate, toDateKey } from "@/shared/utils/date";

type TodayScreenProps = {
  repository: MealRepository;
  initialDateKey?: string;
  initialDateRequestId?: string;
  isFocused?: boolean;
  onAddMeal?: (date: string, mealType?: MealType) => void;
};

export function TodayScreen({
  repository,
  initialDateKey,
  initialDateRequestId,
  isFocused = true,
  onAddMeal,
}: TodayScreenProps) {
  const [selectedDate, setSelectedDate] = useState(() =>
    parseInitialDate(initialDateKey),
  );
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const selectedDateKey = toDateKey(selectedDate);

  useEffect(() => {
    if (initialDateKey) {
      setSelectedDate((current) =>
        toDateKey(current) === initialDateKey
          ? current
          : parseInitialDate(initialDateKey),
      );
    }
  }, [initialDateKey, initialDateRequestId]);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      setMealEntries(await repository.findByDate(selectedDateKey));
    } catch (error) {
      console.error("食事記録の取得に失敗しました", error);
      setLoadError("食事記録を読み込めませんでした");
    } finally {
      setIsLoading(false);
    }
  }, [repository, selectedDateKey]);

  useEffect(() => {
    if (isFocused) {
      void loadEntries();
    }
  }, [isFocused, loadEntries]);

  const totals = calculateNutritionTotals(mealEntries);

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
          {isLoading ? (
            <Text style={styles.statusText}>食事記録を読み込んでいます</Text>
          ) : loadError ? (
            <View style={styles.errorState}>
              <Text style={styles.errorText}>{loadError}</Text>
              <Pressable
                accessibilityLabel="食事記録を再読み込み"
                onPress={loadEntries}
              >
                <Text style={styles.retryText}>再試行</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <DailyNutritionSummary
                goal={DEFAULT_NUTRITION_GOAL}
                totals={totals}
              />

              <View style={styles.sectionTitle}>
                <Text style={styles.sectionTitleText}>食事</Text>
                <Text style={styles.entryCount}>{mealEntries.length}件</Text>
              </View>

              {MEAL_TYPES.map((mealType) => (
                <MealSection
                  entries={mealEntries.filter(
                    (entry) => entry.mealType === mealType,
                  )}
                  key={mealType}
                  mealType={mealType}
                  onAddMeal={() => onAddMeal?.(selectedDateKey, mealType)}
                />
              ))}
            </>
          )}
        </ScrollView>

        <Pressable
          accessibilityLabel="食事を追加"
          onPress={() => onAddMeal?.(selectedDateKey)}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>＋ 食事を追加</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function parseInitialDate(dateKey?: string): Date {
  if (dateKey) {
    const date = new Date(`${dateKey}T00:00:00`);
    if (!Number.isNaN(date.getTime()) && toDateKey(date) === dateKey) {
      return date;
    }
  }

  return new Date();
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
  statusText: {
    color: colors.textMuted,
    paddingVertical: 32,
    textAlign: "center",
  },
  errorState: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 32,
  },
  errorText: {
    color: colors.textMuted,
  },
  retryText: {
    color: colors.primary,
    fontWeight: "700",
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
