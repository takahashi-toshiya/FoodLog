import { validateNutritionGoalInput } from "@/settings/services/nutritionGoalInput";

describe("栄養目標入力", () => {
  const validValues = {
    protein: "120.5",
    fat: "55",
    carbs: "250",
  };

  it("正常な入力を保存値へ変換する", () => {
    expect(validateNutritionGoalInput(validValues, "2026-09-05")).toEqual({
      isValid: true,
      value: {
        effectiveFrom: "2026-09-05",
        calories: 1977,
        protein: 120.5,
        fat: 55,
        carbs: 250,
      },
    });
  });

  it("未入力と数値以外を拒否する", () => {
    const result = validateNutritionGoalInput(
      { ...validValues, protein: "protein", carbs: "" },
      "2026-09-05",
    );

    expect(result).toEqual({
      isValid: false,
      errors: {
        protein: "数値を入力してください",
        carbs: "炭水化物を入力してください",
      },
    });
  });

  it("負数のPFCを拒否する", () => {
    const result = validateNutritionGoalInput(
      { ...validValues, fat: "-1" },
      "2026-09-05",
    );

    expect(result).toEqual({
      isValid: false,
      errors: {
        fat: "0以上の数値を入力してください",
      },
    });
  });

  it("すべてのPFCが0の場合は拒否する", () => {
    const result = validateNutritionGoalInput(
      { protein: "0", fat: "0", carbs: "0" },
      "2026-09-05",
    );

    expect(result).toEqual({
      isValid: false,
      errors: { form: "PFCのいずれかに0より大きい値を入力してください" },
    });
  });
});
