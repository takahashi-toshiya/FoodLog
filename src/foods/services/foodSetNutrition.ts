import type { FoodSet, FoodSetItem } from "@/foods/types/foodSet";
import { calculateCalories } from "@/shared/services/nutrition";

/** セット項目の摂取倍率を反映した栄養値を算出する。 */
export function calculateFoodSetItemNutrition(item: FoodSetItem) {
  const protein = item.food.protein * item.servingMultiplier;
  const fat = item.food.fat * item.servingMultiplier;
  const carbs = item.food.carbs * item.servingMultiplier;

  return {
    calories: calculateCalories(protein, fat, carbs),
    protein,
    fat,
    carbs,
  };
}

/** 食品セットに登録された倍率を反映し、現在の合計栄養値を算出する。 */
export function calculateFoodSetNutrition(foodSet: FoodSet) {
  return foodSet.items.reduce(
    (totals, item) => {
      const nutrition = calculateFoodSetItemNutrition(item);

      return {
        calories: totals.calories + nutrition.calories,
        protein: totals.protein + nutrition.protein,
        fat: totals.fat + nutrition.fat,
        carbs: totals.carbs + nutrition.carbs,
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );
}
