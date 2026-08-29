import { calculateNutritionTotals, calculateProgress, calculateRemaining } from "@/meals/services/nutrition";
import type { MealEntry } from "@/meals/types/meal";

const entries: MealEntry[] = [
  { id: "1", date: "2026-08-28", mealType: "breakfast", name: "朝食", calories: 300, protein: 20, fat: 10, carbs: 35 },
  { id: "2", date: "2026-08-28", mealType: "lunch", name: "昼食", calories: 500, protein: 35, fat: 15, carbs: 55 },
];

describe("nutrition calculations", () => {
  it("totals calories and macros", () => {
    expect(calculateNutritionTotals(entries)).toEqual({ calories: 800, protein: 55, fat: 25, carbs: 90 });
  });

  it("returns zero totals for an empty day", () => {
    expect(calculateNutritionTotals([])).toEqual({ calories: 0, protein: 0, fat: 0, carbs: 0 });
  });

  it("clamps remaining values and progress", () => {
    expect(calculateRemaining(2200, 2000)).toBe(0);
    expect(calculateProgress(2200, 2000)).toBe(1);
    expect(calculateProgress(100, 0)).toBe(0);
  });
});
