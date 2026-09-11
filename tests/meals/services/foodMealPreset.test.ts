import { FOOD_ITEM_FIXTURES } from "@/foods/fixtures/foodItems";
import { createMealInputPresetFromFood } from "@/meals/services/foodMealPreset";

describe("ライブラリ食品の食事入力への変換", () => {
  it("食品のPFCと食品IDを引き継ぎ、カロリーは自動計算にする", () => {
    const food = {
      ...FOOD_ITEM_FIXTURES[0],
      calories: 150,
      memo: "チョコ味",
    };

    expect(createMealInputPresetFromFood(food)).toEqual({
      sourceFoodId: "protein",
      name: "プロテイン",
      protein: "22",
      fat: "2",
      carbs: "4",
      calorieSource: "calculated",
      manualCalories: "",
      memo: "チョコ味",
    });
  });
});
