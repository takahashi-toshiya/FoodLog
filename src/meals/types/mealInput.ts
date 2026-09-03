import type { CalorieSource, MealType } from "@/meals/types/meal";

export type MealInputValues = {
  sourceFoodId: string | null;
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

export type MealInputPreset = Pick<
  MealInputValues,
  | "sourceFoodId"
  | "name"
  | "protein"
  | "fat"
  | "carbs"
  | "calorieSource"
  | "manualCalories"
  | "memo"
>;
