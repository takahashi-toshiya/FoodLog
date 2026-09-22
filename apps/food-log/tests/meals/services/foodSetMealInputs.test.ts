import { FOOD_ITEM_FIXTURES } from "@/foods/fixtures/foodItems";
import type { FoodSet } from "@/foods/types/foodSet";
import { createMealInputsFromFoodSet } from "@/meals/services/foodSetMealInputs";

const FOOD_SET: FoodSet = {
  id: "set-id",
  name: "いつもの朝食",
  items: [
    {
      id: "item-1",
      food: { ...FOOD_ITEM_FIXTURES[0], memo: "水で飲む" },
      servingMultiplier: 0.5,
      sortOrder: 0,
      createdAt: "2026-09-16T00:00:00.000Z",
      updatedAt: "2026-09-16T00:00:00.000Z",
    },
    {
      id: "item-2",
      food: FOOD_ITEM_FIXTURES[1],
      servingMultiplier: 2,
      sortOrder: 1,
      createdAt: "2026-09-16T00:00:00.000Z",
      updatedAt: "2026-09-16T00:00:00.000Z",
    },
  ],
  createdAt: "2026-09-16T00:00:00.000Z",
  updatedAt: "2026-09-16T00:00:00.000Z",
};

describe("食品セットの食事入力生成", () => {
  it("各食品の倍率を1回だけ反映し、同じ日付と食事区分の入力を生成する", () => {
    expect(
      createMealInputsFromFoodSet(FOOD_SET, "2026-09-16", "breakfast"),
    ).toEqual([
      {
        sourceFoodId: "protein",
        date: "2026-09-16",
        mealType: "breakfast",
        name: "プロテイン",
        servingMultiplier: 0.5,
        calories: 61,
        calorieSource: "calculated",
        protein: 11,
        fat: 1,
        carbs: 2,
        memo: "水で飲む",
      },
      {
        sourceFoodId: "greek-yogurt",
        date: "2026-09-16",
        mealType: "breakfast",
        name: "ギリシャヨーグルト",
        servingMultiplier: 2,
        calories: 176,
        calorieSource: "calculated",
        protein: 20,
        fat: 0,
        carbs: 24,
        memo: null,
      },
    ]);
  });

  it("食品がないセットでは空の入力を返す", () => {
    expect(
      createMealInputsFromFoodSet(
        { ...FOOD_SET, items: [] },
        "2026-09-16",
        "lunch",
      ),
    ).toEqual([]);
  });
});
