import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { FOOD_ITEM_FIXTURES } from "@/foods/fixtures/foodItems";
import type { FoodRepository } from "@/foods/storage/FoodRepository";
import { AddMealScreen } from "@/meals/screens/AddMealScreen";
import type { MealRepository } from "@/meals/storage/MealRepository";

describe("食事追加画面", () => {
  function createFoodRepository(): FoodRepository {
    return {
      create: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(async () => [...FOOD_ITEM_FIXTURES]),
      findById: jest.fn(),
      update: jest.fn(),
    };
  }

  function createRepository(): MealRepository {
    return {
      create: jest.fn(async (input) => ({
        id: "meal-id",
        createdAt: "2026-08-30T00:00:00.000Z",
        updatedAt: "2026-08-30T00:00:00.000Z",
        ...input,
      })),
      delete: jest.fn(),
      findByDate: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };
  }

  it("初期日付と食事区分を表示する", async () => {
    const { getByDisplayValue, getByLabelText, getByText } = await render(
      <AddMealScreen
        foodRepository={createFoodRepository()}
        initialDate="2026-08-30"
        initialMealType="lunch"
        onCancel={jest.fn()}
        onSaved={jest.fn()}
        repository={createRepository()}
      />,
    );

    expect(getByDisplayValue("2026-08-30")).toBeTruthy();
    expect(getByLabelText("食事区分を昼食にする")).toBeTruthy();
    expect(getByText("食事記録を追加")).toBeTruthy();
    expect(getByText("食事記録を保存")).toBeTruthy();
  });

  it("入力値を検証し、正常な食事を保存する", async () => {
    const repository = createRepository();
    const onSaved = jest.fn();
    const { getByLabelText } = await render(
      <AddMealScreen
        foodRepository={createFoodRepository()}
        initialDate="2026-08-30"
        initialMealType="dinner"
        onCancel={jest.fn()}
        onSaved={onSaved}
        repository={repository}
      />,
    );

    await fireEvent.changeText(getByLabelText("食品・料理名"), "鶏むね肉");
    await fireEvent.changeText(getByLabelText("P たんぱく質"), "20");
    await fireEvent.changeText(getByLabelText("F 脂質"), "10");
    await fireEvent.changeText(getByLabelText("C 炭水化物"), "30");
    await fireEvent.changeText(
      getByLabelText("食べた量（1回分に対する倍率）"),
      "0.5",
    );
    await fireEvent.press(getByLabelText("食事記録を保存する"));

    await waitFor(() => expect(repository.create).toHaveBeenCalledTimes(1));
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "鶏むね肉",
        mealType: "dinner",
        servingMultiplier: 0.5,
        calories: 145,
      }),
    );
    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it("食品名が空の場合は保存しない", async () => {
    const repository = createRepository();
    const { getByLabelText, getByText } = await render(
      <AddMealScreen
        foodRepository={createFoodRepository()}
        initialDate="2026-08-30"
        initialMealType="breakfast"
        onCancel={jest.fn()}
        onSaved={jest.fn()}
        repository={repository}
      />,
    );

    await fireEvent.press(getByLabelText("食事記録を保存する"));

    expect(getByText("食品・料理名を入力してください")).toBeTruthy();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("ライブラリから食品を選び、食事の入力条件を維持して保存する", async () => {
    const foodRepository = createFoodRepository();
    const mealRepository = createRepository();
    const { getByDisplayValue, getByLabelText, getByText, queryByLabelText } =
      await render(
        <AddMealScreen
          foodRepository={foodRepository}
          initialDate="2026-09-11"
          initialMealType="lunch"
          onCancel={jest.fn()}
          onSaved={jest.fn()}
          repository={mealRepository}
        />,
      );

    await fireEvent.changeText(
      getByLabelText("食べた量（1回分に対する倍率）"),
      "0.5",
    );
    await fireEvent.press(getByLabelText("ライブラリから食品を選ぶ"));

    await waitFor(() => expect(getByText("プロテイン")).toBeTruthy());
    expect(getByLabelText("食品選択を閉じる")).toBeTruthy();
    expect(queryByLabelText("プロテインのメニューを開く")).toBeNull();

    await fireEvent.changeText(getByLabelText("食品を検索"), "プロテイン");
    await fireEvent.press(getByLabelText("プロテインを選択"));

    expect(getByDisplayValue("2026-09-11")).toBeTruthy();
    expect(getByDisplayValue("プロテイン")).toBeTruthy();
    expect(getByDisplayValue("0.5")).toBeTruthy();

    await fireEvent.press(getByLabelText("食事記録を保存する"));

    await waitFor(() => expect(mealRepository.create).toHaveBeenCalledTimes(1));
    expect(mealRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceFoodId: "protein",
        date: "2026-09-11",
        mealType: "lunch",
        servingMultiplier: 0.5,
      }),
    );
    expect(foodRepository.update).not.toHaveBeenCalled();
  });
});
