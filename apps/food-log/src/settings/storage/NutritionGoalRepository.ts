import type { NutritionGoal } from "@/settings/types/nutritionGoal";

export type SaveNutritionGoalInput = {
  effectiveFrom: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

export interface NutritionGoalRepository {
  findEffectiveOn(date: string): Promise<NutritionGoal>;
  save(input: SaveNutritionGoalInput): Promise<NutritionGoal>;
}
