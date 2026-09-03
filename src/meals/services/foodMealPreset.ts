import type { FoodItem } from "@/foods/types/food";
import type { MealInputPreset } from "@/meals/types/mealInput";

export function createMealInputPresetFromFood(food: FoodItem): MealInputPreset {
  return {
    sourceFoodId: food.id,
    name: food.name,
    protein: String(food.protein),
    fat: String(food.fat),
    carbs: String(food.carbs),
    calorieSource: "manual",
    manualCalories: String(food.calories),
    memo: food.memo ?? "",
  };
}
