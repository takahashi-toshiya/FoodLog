import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { FOOD_ITEM_FIXTURES } from "@/foods/fixtures/foodItems";
import type { FoodSetRepository } from "@/foods/storage/FoodSetRepository";
import type { FoodSet } from "@/foods/types/foodSet";
import { AddFoodSetToMealScreen } from "@/meals/screens/AddFoodSetToMealScreen";
import type { MealRepository } from "@/meals/storage/MealRepository";

const FOOD_SET: FoodSet = {
  id: "set-id",
  name: "いつもの朝食",
  items: [
    {
      id: "item-1",
      food: FOOD_ITEM_FIXTURES[0],
      servingMultiplier: 0.5,
      sortOrder: 0,
      createdAt: "2026-09-16T00:00:00.000Z",
      updatedAt: "2026-09-16T00:00:00.000Z",
    },
    {
      id: "item-2",
      food: FOOD_ITEM_FIXTURES[1],
      servingMultiplier: 1,
      sortOrder: 1,
      createdAt: "2026-09-16T00:00:00.000Z",
      updatedAt: "2026-09-16T00:00:00.000Z",
    },
  ],
  createdAt: "2026-09-16T00:00:00.000Z",
  updatedAt: "2026-09-16T00:00:00.000Z",
};

function createFoodSetRepository(
  foodSet: FoodSet | null = FOOD_SET,
): FoodSetRepository {
  return {
    create: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(async () => foodSet),
    isFoodUsed: jest.fn(),
    update: jest.fn(),
  };
}

function createMealRepository(): MealRepository {
  return {
    create: jest.fn(),
    createMany: jest.fn(async (inputs) =>
      inputs.map((input, index) => ({
        ...input,
        id: `meal-${index}`,
        createdAt: "2026-09-16T00:00:00.000Z",
        updatedAt: "2026-09-16T00:00:00.000Z",
      })),
    ),
    delete: jest.fn(),
    findByDate: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };
}

describe("食品セットの食事追加画面", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("セット内容を表示し、指定した日付と食事区分へ一括追加する", async () => {
    const mealRepository = createMealRepository();
    const onSaved = jest.fn();
    const { getByLabelText, getByText } = await render(
      <AddFoodSetToMealScreen
        foodSetId="set-id"
        foodSetRepository={createFoodSetRepository()}
        initialDate="2026-09-16"
        initialMealType="breakfast"
        mealRepository={mealRepository}
        onCancel={jest.fn()}
        onSaved={onSaved}
      />,
    );

    await waitFor(() => expect(getByText("いつもの朝食")).toBeTruthy());
    expect(getByText("2品 · 149 kcal")).toBeTruthy();
    expect(getByText("プロテイン")).toBeTruthy();
    expect(getByText("ギリシャヨーグルト")).toBeTruthy();

    await fireEvent.press(getByLabelText("食事区分を昼食にする"));
    await fireEvent.press(getByLabelText("食品セットを食事へ追加する"));

    await waitFor(() =>
      expect(mealRepository.createMany).toHaveBeenCalledTimes(1),
    );
    expect(mealRepository.createMany).toHaveBeenCalledWith([
      expect.objectContaining({
        sourceFoodId: "protein",
        date: "2026-09-16",
        mealType: "lunch",
        servingMultiplier: 0.5,
        calories: 61,
      }),
      expect.objectContaining({
        sourceFoodId: "greek-yogurt",
        date: "2026-09-16",
        mealType: "lunch",
        servingMultiplier: 1,
        calories: 88,
      }),
    ]);
    expect(onSaved).toHaveBeenCalledWith("2026-09-16");
  });

  it("保存に失敗しても内容を維持して再試行できる", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    const mealRepository = createMealRepository();
    const createMany = mealRepository.createMany as jest.MockedFunction<
      MealRepository["createMany"]
    >;
    createMany
      .mockRejectedValueOnce(new Error("database error"))
      .mockResolvedValueOnce([]);
    const { getByLabelText, getByText } = await render(
      <AddFoodSetToMealScreen
        foodSetId="set-id"
        foodSetRepository={createFoodSetRepository()}
        initialDate="2026-09-16"
        initialMealType="dinner"
        mealRepository={mealRepository}
        onCancel={jest.fn()}
        onSaved={jest.fn()}
      />,
    );

    await waitFor(() => expect(getByText("いつもの朝食")).toBeTruthy());
    await fireEvent.press(getByLabelText("食品セットを食事へ追加する"));
    await waitFor(() =>
      expect(
        getByText("食品セットを追加できませんでした。もう一度お試しください"),
      ).toBeTruthy(),
    );

    expect(getByText("プロテイン")).toBeTruthy();
    await fireEvent.press(getByLabelText("食品セットを食事へ追加する"));
    await waitFor(() => expect(createMany).toHaveBeenCalledTimes(2));
    consoleError.mockRestore();
  });

  it("存在しないセットでは追加操作を表示しない", async () => {
    const { getByText, queryByLabelText } = await render(
      <AddFoodSetToMealScreen
        foodSetId="missing"
        foodSetRepository={createFoodSetRepository(null)}
        initialDate="2026-09-16"
        initialMealType="breakfast"
        mealRepository={createMealRepository()}
        onCancel={jest.fn()}
        onSaved={jest.fn()}
      />,
    );

    await waitFor(() =>
      expect(getByText("指定した食品セットが見つかりません")).toBeTruthy(),
    );
    expect(queryByLabelText("食品セットを食事へ追加する")).toBeNull();
  });
});
