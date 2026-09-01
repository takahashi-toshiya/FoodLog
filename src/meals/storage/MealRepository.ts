import type { CalorieSource, MealEntry, MealType } from "@/meals/types/meal";

export type CreateMealEntryInput = {
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
};

export interface MealRepository {
  findByDate(date: string): Promise<MealEntry[]>;
  create(input: CreateMealEntryInput): Promise<MealEntry>;
}
