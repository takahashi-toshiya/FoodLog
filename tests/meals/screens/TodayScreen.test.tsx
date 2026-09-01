import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { createMealEntryFixtures } from "@/meals/fixtures/mealEntries";
import { TodayScreen } from "@/meals/screens/TodayScreen";
import type { MealRepository } from "@/meals/storage/MealRepository";

describe("今日画面", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 7, 28, 12));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function createRepository(): MealRepository {
    return {
      create: jest.fn(),
      findByDate: jest.fn(async (date: string) =>
        date === "2026-08-28" ? createMealEntryFixtures(date) : [],
      ),
    };
  }

  it("当日の食事と栄養集計を表示する", async () => {
    const { getByText } = await render(
      <TodayScreen repository={createRepository()} />,
    );

    await waitFor(() => expect(getByText("オートミールとバナナ")).toBeTruthy());
    expect(getByText("8月28日 金曜日")).toBeTruthy();
    expect(getByText("1,188")).toBeTruthy();
    expect(getByText("812 kcal")).toBeTruthy();
  });

  it("記録のない日を選択すると空状態を表示する", async () => {
    const { getByLabelText, getAllByText, getByText } = await render(
      <TodayScreen repository={createRepository()} />,
    );

    await waitFor(() => expect(getByText("4件")).toBeTruthy());
    await fireEvent.press(getByLabelText("8月27日"));

    await waitFor(() => expect(getByText("0件")).toBeTruthy());
    expect(getByText("8月27日 木曜日")).toBeTruthy();
    expect(getAllByText(/(朝食|昼食|夕食|間食)を追加$/)).toHaveLength(4);
  });

  it("食事区分の追加導線から日付と区分を渡す", async () => {
    const onAddMeal = jest.fn();
    const { getByLabelText, getByText } = await render(
      <TodayScreen onAddMeal={onAddMeal} repository={createRepository()} />,
    );

    await waitFor(() => expect(getByText("4件")).toBeTruthy());
    await fireEvent.press(getByLabelText("夕食を追加"));

    expect(onAddMeal).toHaveBeenCalledWith("2026-08-28", "dinner");
  });
});
