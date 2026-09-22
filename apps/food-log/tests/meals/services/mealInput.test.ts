import { validateMealInput } from "@/meals/services/mealInput";
import type { MealInputValues } from "@/meals/types/mealInput";
import { calculateCalories } from "@/shared/services/nutrition";

const validInput: MealInputValues = {
  sourceFoodId: null,
  date: "2026-08-30",
  mealType: "dinner",
  name: " 鶏むね肉 ",
  servingMultiplier: "0.5",
  protein: "20",
  fat: "10",
  carbs: "30",
  calorieSource: "calculated",
  manualCalories: "",
  memo: " 半分食べた ",
};

describe("食事入力", () => {
  it("PFCからカロリーを計算する", () => {
    expect(calculateCalories(20, 10, 30)).toBe(290);
  });

  it("摂取倍率を栄養値へ反映して保存データを作る", () => {
    const result = validateMealInput(validInput);

    expect(result).toEqual({
      isValid: true,
      value: {
        date: "2026-08-30",
        mealType: "dinner",
        sourceFoodId: null,
        name: "鶏むね肉",
        servingMultiplier: 0.5,
        calories: 145,
        calorieSource: "calculated",
        protein: 10,
        fat: 5,
        carbs: 15,
        memo: "半分食べた",
      },
    });
  });

  it("手動カロリーをPFC変更とは独立して扱う", () => {
    const result = validateMealInput({
      ...validInput,
      servingMultiplier: "2",
      calorieSource: "manual",
      manualCalories: "300",
      protein: "100",
    });

    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.value.calories).toBe(600);
    }
  });

  it.each([
    ["0.5", 145, 10, 5, 15],
    ["1", 290, 20, 10, 30],
    ["2", 580, 40, 20, 60],
  ])(
    "摂取倍率%sをカロリーとPFCへ反映する",
    (servingMultiplier, calories, protein, fat, carbs) => {
      const result = validateMealInput({
        ...validInput,
        sourceFoodId: "food-id",
        servingMultiplier,
      });

      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.value).toEqual(
          expect.objectContaining({
            sourceFoodId: "food-id",
            calories,
            protein,
            fat,
            carbs,
          }),
        );
      }
    },
  );

  it("食品名、日付、倍率、栄養値の不正入力を拒否する", () => {
    const result = validateMealInput({
      ...validInput,
      date: "2026-02-30",
      name: "   ",
      servingMultiplier: "0",
      protein: "-1",
    });

    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.errors.date).toBeTruthy();
      expect(result.errors.name).toBeTruthy();
      expect(result.errors.servingMultiplier).toBeTruthy();
      expect(result.errors.protein).toBeTruthy();
    }
  });
});
