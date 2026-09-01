import { render, waitFor } from "@testing-library/react-native";

import { createMealEntryFixtures } from "@/meals/fixtures/mealEntries";
import { TodayScreen } from "@/meals/screens/TodayScreen";
import type { MealRepository } from "@/meals/storage/MealRepository";

describe("FoodLogアプリ", () => {
  it("今日画面を表示する", async () => {
    const repository: MealRepository = {
      create: jest.fn(),
      findByDate: jest.fn(async (date) => createMealEntryFixtures(date)),
    };
    const { getByText } = await render(<TodayScreen repository={repository} />);

    await waitFor(() => expect(getByText("今日の記録")).toBeTruthy());
    expect(getByText("オートミールとバナナ")).toBeTruthy();
    expect(getByText("4件")).toBeTruthy();
  });
});
