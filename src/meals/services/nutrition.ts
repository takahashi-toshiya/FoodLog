import type { MealEntry } from "@/meals/types/meal";
import type { NutritionValues } from "@/meals/types/nutrition";

export const EMPTY_NUTRITION: NutritionValues = {
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
};

export function calculateNutritionTotals(
  entries: MealEntry[],
): NutritionValues {
  return entries.reduce<NutritionValues>(
    (totals, entry) => ({
      calories: totals.calories + entry.calories,
      protein: totals.protein + entry.protein,
      fat: totals.fat + entry.fat,
      carbs: totals.carbs + entry.carbs,
    }),
    { ...EMPTY_NUTRITION },
  );
}

export function calculateRemaining(current: number, goal: number): number {
  return Math.max(goal - current, 0);
}

export function calculateProgress(current: number, goal: number): number {
  if (goal <= 0) {
    return 0;
  }

  return Math.min(Math.max(current / goal, 0), 1);
}
