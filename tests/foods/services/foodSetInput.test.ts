import { validateFoodSetInput } from "@/foods/services/foodSetInput";
import type { FoodItem } from "@/foods/types/food";

const FOOD: FoodItem = {
  id: "food-1",
  name: "ゆで卵",
  servingAmount: 1,
  servingUnit: "個",
  calories: 76,
  protein: 6.2,
  fat: 5.2,
  carbs: 0.2,
  memo: null,
  createdAt: "2026-09-01T00:00:00.000Z",
  updatedAt: "2026-09-01T00:00:00.000Z",
};

describe("食品セット入力", () => {
  it("セット名を整形し、食品IDと倍率を保存形式へ変換する", () => {
    expect(
      validateFoodSetInput({
        name: "  いつもの朝食  ",
        items: [{ food: FOOD, servingMultiplier: "0.5" }],
      }),
    ).toEqual({
      isValid: true,
      value: {
        name: "いつもの朝食",
        items: [{ foodId: "food-1", servingMultiplier: 0.5 }],
      },
    });
  });

  it("セット名が空の場合は拒否する", () => {
    const result = validateFoodSetInput({
      name: "  ",
      items: [{ food: FOOD, servingMultiplier: "1" }],
    });

    expect(result).toEqual({
      isValid: false,
      errors: { name: "セット名を入力してください" },
    });
  });

  it("食品が0件の場合は拒否する", () => {
    const result = validateFoodSetInput({ name: "朝食", items: [] });

    expect(result).toEqual({
      isValid: false,
      errors: { items: "食品を1件以上追加してください" },
    });
  });

  it.each(["", "0", "-1", "文字"])(
    "倍率が不正な場合は拒否する: %s",
    (servingMultiplier) => {
      const result = validateFoodSetInput({
        name: "朝食",
        items: [{ food: FOOD, servingMultiplier }],
      });

      expect(result).toEqual({
        isValid: false,
        errors: {
          servingMultipliers: {
            "food-1": "0より大きい数値を入力してください",
          },
        },
      });
    },
  );

  it("同じ食品が重複している場合は拒否する", () => {
    const result = validateFoodSetInput({
      name: "朝食",
      items: [
        { food: FOOD, servingMultiplier: "1" },
        { food: FOOD, servingMultiplier: "2" },
      ],
    });

    expect(result).toEqual({
      isValid: false,
      errors: { items: "同じ食品を重複して追加できません" },
    });
  });
});
