import type { CreateFoodSetInput } from "@/foods/types/foodSet";
import type {
  FoodSetInputErrors,
  FoodSetInputValues,
} from "@/foods/types/foodSetInput";

type FoodSetInputResult =
  | { isValid: true; value: CreateFoodSetInput }
  | { isValid: false; errors: FoodSetInputErrors };

export function validateFoodSetInput(
  values: FoodSetInputValues,
): FoodSetInputResult {
  const errors: FoodSetInputErrors = {};
  const name = values.name.trim();

  if (name.length === 0) {
    errors.name = "セット名を入力してください";
  }

  if (values.items.length === 0) {
    errors.items = "食品を1件以上追加してください";
  }

  const foodIds = new Set<string>();
  const servingMultipliers: Record<string, string> = {};
  const items = values.items.map((item) => {
    const multiplier = Number(item.servingMultiplier);

    if (foodIds.has(item.food.id)) {
      errors.items = "同じ食品を重複して追加できません";
    }
    foodIds.add(item.food.id);

    if (
      item.servingMultiplier.trim() === "" ||
      !Number.isFinite(multiplier) ||
      multiplier <= 0
    ) {
      servingMultipliers[item.food.id] = "0より大きい数値を入力してください";
    }

    return { foodId: item.food.id, servingMultiplier: multiplier };
  });

  if (Object.keys(servingMultipliers).length > 0) {
    errors.servingMultipliers = servingMultipliers;
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, value: { name, items } };
}
