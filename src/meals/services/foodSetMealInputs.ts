import type { FoodSet } from "@/foods/types/foodSet";
import { calculateFoodSetItemNutrition } from "@/foods/services/foodSetNutrition";
import type { CreateMealEntryInput, MealType } from "@/meals/types/meal";

/** 食品セットの現在値から、履歴として保存する食事入力のスナップショットを生成する。 */
export function createMealInputsFromFoodSet(
  foodSet: FoodSet,
  date: string,
  mealType: MealType,
): CreateMealEntryInput[] {
  return foodSet.items.map((item) => {
    const { food, servingMultiplier } = item;
    const nutrition = calculateFoodSetItemNutrition(item);

    return {
      sourceFoodId: food.id,
      date,
      mealType,
      name: food.name,
      servingMultiplier,
      calories: nutrition.calories,
      calorieSource: "calculated",
      protein: nutrition.protein,
      fat: nutrition.fat,
      carbs: nutrition.carbs,
      memo: food.memo,
    };
  });
}
