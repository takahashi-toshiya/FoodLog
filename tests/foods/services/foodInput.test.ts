import { validateFoodInput } from "@/foods/services/foodInput";
import type { FoodInputValues } from "@/foods/types/foodInput";

const validInput: FoodInputValues = {
  name: " プロテイン ",
  servingAmount: "1.5",
  servingUnit: " 杯 ",
  protein: "20",
  fat: "2",
  carbs: "5",
  calorieMode: "calculated",
  manualCalories: "",
  memo: " 朝用 ",
};

describe("食品入力", () => {
  it("入力値を整形し、PFCからカロリーを計算する", () => {
    expect(validateFoodInput(validInput)).toEqual({
      isValid: true,
      value: {
        name: "プロテイン",
        servingAmount: 1.5,
        servingUnit: "杯",
        calories: 118,
        protein: 20,
        fat: 2,
        carbs: 5,
        memo: "朝用",
      },
    });
  });

  it("手動カロリーをPFCとは独立して保存する", () => {
    const result = validateFoodInput({
      ...validInput,
      calorieMode: "manual",
      manualCalories: "150",
      protein: "100",
    });

    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.value.calories).toBe(150);
    }
  });

  it("食品名、基準量、単位、栄養値の不正入力を拒否する", () => {
    const result = validateFoodInput({
      ...validInput,
      name: "   ",
      servingAmount: "0",
      servingUnit: " ",
      protein: "-1",
    });

    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.errors.name).toBeTruthy();
      expect(result.errors.servingAmount).toBeTruthy();
      expect(result.errors.servingUnit).toBeTruthy();
      expect(result.errors.protein).toBeTruthy();
    }
  });

  it("空のメモをnullとして扱う", () => {
    const result = validateFoodInput({ ...validInput, memo: "   " });

    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.value.memo).toBeNull();
    }
  });
});
