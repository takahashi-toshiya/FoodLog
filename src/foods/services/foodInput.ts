import type { CreateFoodInput } from "@/foods/storage/FoodRepository";
import {
  FOOD_MEMO_MAX_LENGTH,
  FOOD_NAME_MAX_LENGTH,
  SERVING_UNIT_MAX_LENGTH,
} from "@/foods/constants/food-input";
import type { FoodInputErrors, FoodInputValues } from "@/foods/types/foodInput";
import { calculateCalories } from "@/shared/services/nutrition";

type FoodInputResult =
  | { isValid: true; value: CreateFoodInput }
  | { isValid: false; errors: FoodInputErrors };

function parseNonNegativeNumber(
  value: string,
  field: keyof FoodInputValues,
  errors: FoodInputErrors,
): number {
  if (value.trim() === "") {
    return 0;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    errors[field] = "0以上の数値を入力してください";
    return 0;
  }

  return parsed;
}

export function validateFoodInput(values: FoodInputValues): FoodInputResult {
  const errors: FoodInputErrors = {};
  const name = values.name.trim();
  const servingUnit = values.servingUnit.trim();
  const memo = values.memo.trim();
  const servingAmount = Number(values.servingAmount);

  if (name.length === 0) {
    errors.name = "食品名を入力してください";
  } else if (name.length > FOOD_NAME_MAX_LENGTH) {
    errors.name = `${FOOD_NAME_MAX_LENGTH}文字以内で入力してください`;
  }

  if (
    values.servingAmount.trim() === "" ||
    !Number.isFinite(servingAmount) ||
    servingAmount <= 0
  ) {
    errors.servingAmount = "0より大きい数値を入力してください";
  }

  if (servingUnit.length === 0) {
    errors.servingUnit = "単位を入力してください";
  } else if (servingUnit.length > SERVING_UNIT_MAX_LENGTH) {
    errors.servingUnit = `${SERVING_UNIT_MAX_LENGTH}文字以内で入力してください`;
  }

  if (memo.length > FOOD_MEMO_MAX_LENGTH) {
    errors.memo = `${FOOD_MEMO_MAX_LENGTH}文字以内で入力してください`;
  }

  const protein = parseNonNegativeNumber(values.protein, "protein", errors);
  const fat = parseNonNegativeNumber(values.fat, "fat", errors);
  const carbs = parseNonNegativeNumber(values.carbs, "carbs", errors);
  let calories = calculateCalories(protein, fat, carbs);

  if (values.calorieMode === "manual") {
    const manualCalories = Number(values.manualCalories);
    if (
      values.manualCalories.trim() === "" ||
      !Number.isInteger(manualCalories) ||
      manualCalories < 0
    ) {
      errors.manualCalories = "0以上の整数を入力してください";
    } else {
      calories = manualCalories;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    value: {
      name,
      servingAmount,
      servingUnit,
      calories,
      protein,
      fat,
      carbs,
      memo: memo.length > 0 ? memo : null,
    },
  };
}
