import {
  mapMealEntryRow,
  type MealEntryRow,
} from "@/meals/storage/mealEntryMapper";

describe("食事記録のDB変換", () => {
  it("DBのsnake_caseをアプリの型へ変換する", () => {
    const row: MealEntryRow = {
      id: "meal-id",
      source_food_id: "food-id",
      recorded_date: "2026-08-30",
      meal_type: "lunch",
      name: "玄米",
      serving_multiplier: 0.5,
      calories: 124,
      calorie_source: "manual",
      protein: 2,
      fat: 1,
      carbs: 26.5,
      memo: null,
      created_at: "2026-08-30T00:00:00.000Z",
      updated_at: "2026-08-30T00:00:00.000Z",
    };

    expect(mapMealEntryRow(row)).toEqual({
      id: "meal-id",
      sourceFoodId: "food-id",
      date: "2026-08-30",
      mealType: "lunch",
      name: "玄米",
      servingMultiplier: 0.5,
      calories: 124,
      calorieSource: "manual",
      protein: 2,
      fat: 1,
      carbs: 26.5,
      memo: null,
      createdAt: "2026-08-30T00:00:00.000Z",
      updatedAt: "2026-08-30T00:00:00.000Z",
    });
  });
});
