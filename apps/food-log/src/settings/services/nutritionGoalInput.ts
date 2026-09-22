import type { SaveNutritionGoalInput } from "@/settings/storage/NutritionGoalRepository";
import type {
  NutritionGoalInputErrors,
  NutritionGoalInputValues,
} from "@/settings/types/nutritionGoalInput";
import { calculateCalories } from "@/shared/services/nutrition";

type NutritionGoalInputResult =
  | { isValid: true; value: SaveNutritionGoalInput }
  | { isValid: false; errors: NutritionGoalInputErrors };

export function validateNutritionGoalInput(
  values: NutritionGoalInputValues,
  effectiveFrom: string,
): NutritionGoalInputResult {
  const errors: NutritionGoalInputErrors = {};
  const protein = parseRequiredNumber(
    "protein",
    values.protein,
    "たんぱく質",
    errors,
  );
  const fat = parseRequiredNumber("fat", values.fat, "脂質", errors);
  const carbs = parseRequiredNumber("carbs", values.carbs, "炭水化物", errors);

  for (const [key, value] of [
    ["protein", protein],
    ["fat", fat],
    ["carbs", carbs],
  ] as const) {
    if (value !== null && value < 0) {
      errors[key] = "0以上の数値を入力してください";
    }
  }

  if (
    Object.keys(errors).length > 0 ||
    protein === null ||
    fat === null ||
    carbs === null
  ) {
    return { isValid: false, errors };
  }

  const calories = calculateCalories(protein, fat, carbs);
  if (calories <= 0) {
    return {
      isValid: false,
      errors: { form: "PFCのいずれかに0より大きい値を入力してください" },
    };
  }

  return {
    isValid: true,
    value: { effectiveFrom, calories, protein, fat, carbs },
  };
}

function parseRequiredNumber(
  key: keyof NutritionGoalInputValues,
  value: string,
  label: string,
  errors: NutritionGoalInputErrors,
): number | null {
  if (value.trim() === "") {
    errors[key] = `${label}を入力してください`;
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    errors[key] = "数値を入力してください";
    return null;
  }

  return parsed;
}
