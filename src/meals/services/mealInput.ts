import type { CreateMealEntryInput } from "@/meals/storage/MealRepository";
import type { CalorieSource, MealType } from "@/meals/types/meal";

export const FOOD_NAME_MAX_LENGTH = 100;
export const MEMO_MAX_LENGTH = 500;

export type MealInputValues = {
  date: string;
  mealType: MealType;
  name: string;
  servingMultiplier: string;
  protein: string;
  fat: string;
  carbs: string;
  calorieSource: CalorieSource;
  manualCalories: string;
  memo: string;
};

export type MealInputErrors = Partial<Record<keyof MealInputValues, string>>;

type MealInputResult =
  | { isValid: true; value: CreateMealEntryInput }
  | { isValid: false; errors: MealInputErrors };

export function calculateCalories(
  protein: number,
  fat: number,
  carbs: number,
): number {
  return Math.round(protein * 4 + fat * 9 + carbs * 4);
}

function parseNonNegativeNumber(
  value: string,
  field: keyof MealInputValues,
  errors: MealInputErrors,
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

function isValidDateKey(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function validateMealInput(values: MealInputValues): MealInputResult {
  const errors: MealInputErrors = {};
  const name = values.name.trim();
  const memo = values.memo.trim();

  if (!isValidDateKey(values.date)) {
    errors.date = "YYYY-MM-DD形式の正しい日付を入力してください";
  }

  if (name.length === 0) {
    errors.name = "食品・料理名を入力してください";
  } else if (name.length > FOOD_NAME_MAX_LENGTH) {
    errors.name = `${FOOD_NAME_MAX_LENGTH}文字以内で入力してください`;
  }

  if (memo.length > MEMO_MAX_LENGTH) {
    errors.memo = `${MEMO_MAX_LENGTH}文字以内で入力してください`;
  }

  const protein = parseNonNegativeNumber(values.protein, "protein", errors);
  const fat = parseNonNegativeNumber(values.fat, "fat", errors);
  const carbs = parseNonNegativeNumber(values.carbs, "carbs", errors);
  const servingMultiplier = Number(values.servingMultiplier);

  if (!Number.isFinite(servingMultiplier) || servingMultiplier <= 0) {
    errors.servingMultiplier = "0より大きい数値を入力してください";
  }

  let baseCalories = calculateCalories(protein, fat, carbs);
  if (values.calorieSource === "manual") {
    const manualCalories = Number(values.manualCalories);
    if (
      values.manualCalories.trim() === "" ||
      !Number.isInteger(manualCalories) ||
      manualCalories < 0
    ) {
      errors.manualCalories = "0以上の整数を入力してください";
    } else {
      baseCalories = manualCalories;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    value: {
      date: values.date,
      mealType: values.mealType,
      sourceFoodId: null,
      name,
      servingMultiplier,
      calories: Math.round(baseCalories * servingMultiplier),
      calorieSource: values.calorieSource,
      protein: protein * servingMultiplier,
      fat: fat * servingMultiplier,
      carbs: carbs * servingMultiplier,
      memo: memo.length > 0 ? memo : null,
    },
  };
}
