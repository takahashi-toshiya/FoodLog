import type { MealEntry } from "@/meals/types/meal";
import type { NutritionGoal } from "@/meals/types/nutrition";

export const DEFAULT_NUTRITION_GOAL: NutritionGoal = {
  calories: 2000,
  protein: 120,
  fat: 55,
  carbs: 250,
};

type MealEntryFixture = Omit<
  MealEntry,
  | "sourceFoodId"
  | "servingMultiplier"
  | "calorieSource"
  | "memo"
  | "createdAt"
  | "updatedAt"
>;

export function createMealEntryFixtures(today: string): MealEntry[] {
  const entries: MealEntryFixture[] = [
    {
      id: "oatmeal-banana",
      date: today,
      mealType: "breakfast",
      name: "オートミールとバナナ",
      calories: 320,
      protein: 11,
      fat: 6,
      carbs: 58,
    },
    {
      id: "greek-yogurt",
      date: today,
      mealType: "breakfast",
      name: "ギリシャヨーグルト",
      calories: 100,
      protein: 10,
      fat: 0,
      carbs: 12,
    },
    {
      id: "chicken-plate",
      date: today,
      mealType: "lunch",
      name: "鶏むね肉プレート",
      calories: 650,
      protein: 49,
      fat: 18,
      carbs: 71,
    },
    {
      id: "protein",
      date: today,
      mealType: "snack",
      name: "プロテイン",
      calories: 118,
      protein: 22,
      fat: 2,
      carbs: 4,
    },
  ];

  return entries.map((entry) => ({
    ...entry,
    sourceFoodId: null,
    servingMultiplier: 1,
    calorieSource: "calculated" as const,
    memo: null,
    createdAt: `${today}T00:00:00.000Z`,
    updatedAt: `${today}T00:00:00.000Z`,
  }));
}
