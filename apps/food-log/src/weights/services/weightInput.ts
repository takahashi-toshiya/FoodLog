import type { SaveWeightInput } from "@/weights/storage/WeightRepository";
import type {
  WeightInputErrors,
  WeightInputValues,
} from "@/weights/types/weightInput";

type WeightInputResult =
  | { isValid: true; value: SaveWeightInput }
  | { isValid: false; errors: WeightInputErrors };

export function validateWeightInput(
  values: WeightInputValues,
  recordedDate: string,
): WeightInputResult {
  const input = values.weightKg.trim();

  if (input === "") {
    return {
      isValid: false,
      errors: { weightKg: "体重を入力してください" },
    };
  }

  const weightKg = Number(input);
  if (!Number.isFinite(weightKg)) {
    return {
      isValid: false,
      errors: { weightKg: "数値を入力してください" },
    };
  }

  if (weightKg <= 0) {
    return {
      isValid: false,
      errors: { weightKg: "0より大きい数値を入力してください" },
    };
  }

  return {
    isValid: true,
    value: { recordedDate, weightKg },
  };
}
