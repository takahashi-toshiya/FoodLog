import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { FOOD_ITEM_FIXTURES } from "@/foods/fixtures/foodItems";
import type { FoodRepository } from "@/foods/storage/FoodRepository";
import { AddLibraryFoodToMealScreen } from "@/meals/screens/AddLibraryFoodToMealScreen";
import type { MealRepository } from "@/meals/storage/MealRepository";

describe("ライブラリ食品の食事追加画面", () => {
  function createFoodRepository(): FoodRepository {
    return {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(async () => FOOD_ITEM_FIXTURES[0]),
    };
  }

  function createMealRepository(): MealRepository {
    return {
      create: jest.fn(async (input) => ({
        id: "meal-id",
        createdAt: "2026-09-03T00:00:00.000Z",
        updatedAt: "2026-09-03T00:00:00.000Z",
        ...input,
      })),
      findByDate: jest.fn(),
    };
  }

  it("食品を初期表示し、摂取倍率を反映して食事を保存する", async () => {
    const foodRepository = createFoodRepository();
    const mealRepository = createMealRepository();
    const onSaved = jest.fn();
    const { getByDisplayValue, getByLabelText } = await render(
      <AddLibraryFoodToMealScreen
        foodId="protein"
        foodRepository={foodRepository}
        initialDate="2026-09-03"
        initialMealType="snack"
        mealRepository={mealRepository}
        onCancel={jest.fn()}
        onSaved={onSaved}
      />,
    );

    await waitFor(() => expect(getByDisplayValue("プロテイン")).toBeTruthy());
    expect(getByDisplayValue("118")).toBeTruthy();

    await fireEvent.changeText(
      getByLabelText("食べた量（1回分に対する倍率）"),
      "0.5",
    );
    await fireEvent.press(getByLabelText("食事を保存する"));

    await waitFor(() => expect(mealRepository.create).toHaveBeenCalledTimes(1));
    expect(mealRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceFoodId: "protein",
        date: "2026-09-03",
        mealType: "snack",
        calories: 59,
        protein: 11,
        fat: 1,
        carbs: 2,
      }),
    );
    expect(onSaved).toHaveBeenCalledWith("2026-09-03");
  });

  it("指定した食品が存在しない場合は保存画面を表示しない", async () => {
    const foodRepository = createFoodRepository();
    foodRepository.findById = jest.fn(async () => null);
    const { getByText, queryByLabelText } = await render(
      <AddLibraryFoodToMealScreen
        foodId="missing"
        foodRepository={foodRepository}
        initialDate="2026-09-03"
        initialMealType="breakfast"
        mealRepository={createMealRepository()}
        onCancel={jest.fn()}
        onSaved={jest.fn()}
      />,
    );

    await waitFor(() =>
      expect(getByText("指定した食品が見つかりません")).toBeTruthy(),
    );
    expect(queryByLabelText("食事を保存する")).toBeNull();
  });

  it("食品取得に失敗した場合は再試行できる", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const foodRepository = createFoodRepository();
    const findById = foodRepository.findById as jest.MockedFunction<
      FoodRepository["findById"]
    >;
    findById
      .mockRejectedValueOnce(new Error("database error"))
      .mockResolvedValueOnce(FOOD_ITEM_FIXTURES[0]);
    const { getByDisplayValue, getByText } = await render(
      <AddLibraryFoodToMealScreen
        foodId="protein"
        foodRepository={foodRepository}
        initialDate="2026-09-03"
        initialMealType="breakfast"
        mealRepository={createMealRepository()}
        onCancel={jest.fn()}
        onSaved={jest.fn()}
      />,
    );

    await waitFor(() =>
      expect(getByText("食品を読み込めませんでした")).toBeTruthy(),
    );
    await fireEvent.press(getByText("もう一度読み込む"));

    await waitFor(() => expect(getByDisplayValue("プロテイン")).toBeTruthy());
    expect(findById).toHaveBeenCalledTimes(2);
    consoleError.mockRestore();
  });
});
