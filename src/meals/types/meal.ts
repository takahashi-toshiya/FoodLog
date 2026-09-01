export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type CalorieSource = "calculated" | "manual";

export type MealEntry = {
  id: string;
  date: string;
  mealType: MealType;
  sourceFoodId: string | null;
  name: string;
  servingMultiplier: number;
  calories: number;
  calorieSource: CalorieSource;
  protein: number;
  fat: number;
  carbs: number;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
};
