import type { CalorieSource, MealEntry, MealType } from "@/meals/types/meal";

export type MealEntryRow = {
  id: string;
  source_food_id: string | null;
  recorded_date: string;
  meal_type: string;
  name: string;
  serving_multiplier: number;
  calories: number;
  calorie_source: string;
  protein: number;
  fat: number;
  carbs: number;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export function mapMealEntryRow(row: MealEntryRow): MealEntry {
  return {
    id: row.id,
    sourceFoodId: row.source_food_id,
    date: row.recorded_date,
    mealType: row.meal_type as MealType,
    name: row.name,
    servingMultiplier: row.serving_multiplier,
    calories: row.calories,
    calorieSource: row.calorie_source as CalorieSource,
    protein: row.protein,
    fat: row.fat,
    carbs: row.carbs,
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
