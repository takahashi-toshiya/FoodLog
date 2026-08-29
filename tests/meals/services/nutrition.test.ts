import {
  calculateNutritionTotals,
  calculateProgress,
  calculateRemaining,
} from "@/meals/services/nutrition";
import type { MealEntry } from "@/meals/types/meal";

const entries: MealEntry[] = [
  {
    id: "1",
    date: "2026-08-28",
    mealType: "breakfast",
    name: "朝食",
    calories: 300,
    protein: 20,
    fat: 10,
    carbs: 35,
  },
  {
    id: "2",
    date: "2026-08-28",
    mealType: "lunch",
    name: "昼食",
    calories: 500,
    protein: 35,
    fat: 15,
    carbs: 55,
  },
];

describe("栄養値の計算", () => {
  it("カロリーとPFCを合計する", () => {
    expect(calculateNutritionTotals(entries)).toEqual({
      calories: 800,
      protein: 55,
      fat: 25,
      carbs: 90,
    });
  });

  it("食事記録がない場合は合計を0にする", () => {
    expect(calculateNutritionTotals([])).toEqual({
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    });
  });

  it("残量と進捗率を有効な範囲に収める", () => {
    expect(calculateRemaining(2200, 2000)).toBe(0);
    expect(calculateProgress(2200, 2000)).toBe(1);
    expect(calculateProgress(100, 0)).toBe(0);
  });
});
