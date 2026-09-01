import type { CalorieSource, MealType } from "@/meals/types/meal";

export type MealInputValues = {
  date: string;
  mealType: MealType;
  name: string;
  servingMultiplier: string;
  protein: string;
  fat: string;
  carbs: string;
  calorieSource: CalorieSource;
  manualCalories: string;
  memo: string;
};

export type MealInputErrors = Partial<Record<keyof MealInputValues, string>>;
