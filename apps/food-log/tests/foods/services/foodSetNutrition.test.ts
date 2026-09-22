import { calculateFoodSetNutrition } from "@/foods/services/foodSetNutrition";
import type { FoodSet } from "@/foods/types/foodSet";

describe("食品セットの栄養集計", () => {
  it("各食品の摂取倍率を反映してカロリーとPFCを集計する", () => {
    const foodSet = {
      items: [
        {
          food: { protein: 20, fat: 2, carbs: 4 },
          servingMultiplier: 1,
        },
        {
          food: { protein: 10, fat: 0, carbs: 12 },
          servingMultiplier: 0.5,
        },
      ],
    } as FoodSet;

    expect(calculateFoodSetNutrition(foodSet)).toEqual({
      calories: 158,
      protein: 25,
      fat: 2,
      carbs: 10,
    });
  });
});
