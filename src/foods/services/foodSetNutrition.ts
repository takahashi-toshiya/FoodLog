import type { FoodSet } from "@/foods/types/foodSet";
import { calculateCalories } from "@/shared/services/nutrition";

export function calculateFoodSetNutrition(foodSet: FoodSet) {
  return foodSet.items.reduce(
    (totals, item) => {
      const protein = item.food.protein * item.servingMultiplier;
      const fat = item.food.fat * item.servingMultiplier;
      const carbs = item.food.carbs * item.servingMultiplier;

      return {
        calories: totals.calories + calculateCalories(protein, fat, carbs),
        protein: totals.protein + protein,
        fat: totals.fat + fat,
        carbs: totals.carbs + carbs,
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );
}
