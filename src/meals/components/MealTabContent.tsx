import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { DailyNutritionSummary } from "@/meals/components/DailyNutritionSummary";
import { MealSection } from "@/meals/components/MealSection";
import { MEAL_TYPES } from "@/meals/constants/meal-types";
import { calculateNutritionTotals } from "@/meals/services/nutrition";
import type { MealRepository } from "@/meals/storage/MealRepository";
import type { MealEntry, MealType } from "@/meals/types/meal";
import type { NutritionGoalRepository } from "@/settings/storage/NutritionGoalRepository";
import type { NutritionGoal } from "@/settings/types/nutritionGoal";
import { colors } from "@/shared/theme/colors";

type MealTabContentProps = {
  isFocused: boolean;
  nutritionGoalRepository: NutritionGoalRepository;
  repository: MealRepository;
  selectedDateKey: string;
  onAddMeal?: (date: string, mealType?: MealType) => void;
  onEditMeal?: (entryId: string) => void;
};

export function MealTabContent({
  isFocused,
  nutritionGoalRepository,
  repository,
  selectedDateKey,
  onAddMeal,
  onEditMeal,
}: MealTabContentProps) {
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [nutritionGoal, setNutritionGoal] = useState<NutritionGoal | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [entries, goal] = await Promise.all([
        repository.findByDate(selectedDateKey),
        nutritionGoalRepository.findEffectiveOn(selectedDateKey),
      ]);
      setMealEntries(entries);
      setNutritionGoal(goal);
    } catch (error) {
      console.error("選択日のデータ取得に失敗しました", error);
      setLoadError("選択日のデータを読み込めませんでした");
    } finally {
      setIsLoading(false);
    }
  }, [nutritionGoalRepository, repository, selectedDateKey]);

  useEffect(() => {
    if (isFocused) {
      void loadEntries();
    }
  }, [isFocused, loadEntries]);

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <MealContent
          entries={mealEntries}
          error={loadError}
          isLoading={isLoading}
          nutritionGoal={nutritionGoal}
          onAddMeal={onAddMeal}
          onEditMeal={onEditMeal}
          onRetry={loadEntries}
          selectedDateKey={selectedDateKey}
        />
      </ScrollView>

      <Pressable
        accessibilityLabel="食事を追加"
        onPress={() => onAddMeal?.(selectedDateKey)}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>＋ 食事を追加</Text>
      </Pressable>
    </>
  );
}

type MealContentProps = {
  entries: MealEntry[];
  error: string | null;
  isLoading: boolean;
  nutritionGoal: NutritionGoal | null;
  onRetry: () => void;
  selectedDateKey: string;
  onAddMeal?: (date: string, mealType?: MealType) => void;
  onEditMeal?: (entryId: string) => void;
};

function MealContent({
  entries,
  error,
  isLoading,
  nutritionGoal,
  onRetry,
  selectedDateKey,
  onAddMeal,
  onEditMeal,
}: MealContentProps) {
  if (isLoading) {
    return <Text style={styles.statusText}>食事記録を読み込んでいます</Text>;
  }

  if (error) {
    return (
      <View style={styles.errorState}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable accessibilityLabel="食事記録を再読み込み" onPress={onRetry}>
          <Text style={styles.retryText}>再試行</Text>
        </Pressable>
      </View>
    );
  }

  const totals = calculateNutritionTotals(entries);

  return (
    <>
      {nutritionGoal && (
        <DailyNutritionSummary goal={nutritionGoal} totals={totals} />
      )}

      <View style={styles.sectionTitle}>
        <Text style={styles.sectionTitleText}>食事</Text>
        <Text style={styles.entryCount}>{entries.length}件</Text>
      </View>

      {MEAL_TYPES.map((mealType) => (
        <MealSection
          entries={entries.filter((entry) => entry.mealType === mealType)}
          key={mealType}
          mealType={mealType}
          onAddMeal={() => onAddMeal?.(selectedDateKey, mealType)}
          onSelectMeal={(entry) => onEditMeal?.(entry.id)}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 16,
    paddingTop: 14,
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
  errorText: { color: colors.textMuted },
  retryText: { color: colors.primary, fontWeight: "700" },
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
    elevation: 6,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 18,
    position: "absolute",
    right: 18,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  addButtonText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "800",
  },
});
