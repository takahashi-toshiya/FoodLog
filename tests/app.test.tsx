import { render, waitFor } from "@testing-library/react-native";

import { createMealEntryFixtures } from "@/meals/fixtures/mealEntries";
import { TodayScreen } from "@/meals/screens/TodayScreen";
import type { MealRepository } from "@/meals/storage/MealRepository";
import type { NutritionGoalRepository } from "@/settings/storage/NutritionGoalRepository";

describe("FoodLogアプリ", () => {
  it("今日画面を表示する", async () => {
    const repository: MealRepository = {
      create: jest.fn(),
      createMany: jest.fn(),
      delete: jest.fn(),
      findByDate: jest.fn(async (date) => createMealEntryFixtures(date)),
      findById: jest.fn(),
      update: jest.fn(),
    };
    const nutritionGoalRepository: NutritionGoalRepository = {
      findEffectiveOn: jest.fn(async () => ({
        id: "goal",
        effectiveFrom: "1970-01-01",
        calories: 1975,
        protein: 120,
        fat: 55,
        carbs: 250,
        createdAt: "1970-01-01T00:00:00.000Z",
        updatedAt: "1970-01-01T00:00:00.000Z",
      })),
      save: jest.fn(),
    };
    const { getByText } = await render(
      <TodayScreen
        nutritionGoalRepository={nutritionGoalRepository}
        repository={repository}
      />,
    );

    await waitFor(() => expect(getByText("今日の記録")).toBeTruthy());
    expect(getByText("オートミールとバナナ")).toBeTruthy();
    expect(getByText("4件")).toBeTruthy();
  });
});
