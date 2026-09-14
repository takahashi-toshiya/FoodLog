import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { EditFoodSetScreen } from "@/foods/screens/EditFoodSetScreen";
import type { FoodRepository } from "@/foods/storage/FoodRepository";
import type { FoodSetRepository } from "@/foods/storage/FoodSetRepository";
import type { FoodItem } from "@/foods/types/food";
import type { FoodSet } from "@/foods/types/foodSet";

const FOOD: FoodItem = {
  id: "food-1",
  name: "ゆで卵",
  servingAmount: 1,
  servingUnit: "個",
  calories: 76,
  protein: 6.2,
  fat: 5.2,
  carbs: 0.2,
  memo: null,
  createdAt: "2026-09-01T00:00:00.000Z",
  updatedAt: "2026-09-01T00:00:00.000Z",
};

const FOOD_SET: FoodSet = {
  id: "set-id",
  name: "いつもの朝食",
  items: [
    {
      id: "item-id",
      food: FOOD,
      servingMultiplier: 1,
      sortOrder: 0,
      createdAt: "2026-09-13T00:00:00.000Z",
      updatedAt: "2026-09-13T00:00:00.000Z",
    },
  ],
  createdAt: "2026-09-13T00:00:00.000Z",
  updatedAt: "2026-09-13T00:00:00.000Z",
};

function createFoodRepository(): FoodRepository {
  return {
    create: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(async () => [FOOD]),
    findById: jest.fn(),
    update: jest.fn(),
  };
}

function createFoodSetRepository(
  foodSet: FoodSet | null = FOOD_SET,
): FoodSetRepository {
  return {
    create: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(async () => foodSet),
    update: jest.fn(async () => ({ ...FOOD_SET, name: "更新後" })),
  };
}

describe("食品セット編集画面", () => {
  it("保存済みの値を表示し、変更内容を保存する", async () => {
    const foodSetRepository = createFoodSetRepository();
    const onSaved = jest.fn();
    const { getByDisplayValue, getByLabelText } = await render(
      <EditFoodSetScreen
        foodRepository={createFoodRepository()}
        foodSetId="set-id"
        foodSetRepository={foodSetRepository}
        onCancel={jest.fn()}
        onSaved={onSaved}
      />,
    );

    await waitFor(() => expect(getByDisplayValue("いつもの朝食")).toBeTruthy());
    expect(getByDisplayValue("1")).toBeTruthy();

    await fireEvent.changeText(getByLabelText("セット名"), "朝食セット");
    await fireEvent.changeText(getByLabelText("ゆで卵の摂取倍率"), "2");
    await fireEvent.press(getByLabelText("セットの変更を保存する"));

    await waitFor(() =>
      expect(foodSetRepository.update).toHaveBeenCalledWith("set-id", {
        name: "朝食セット",
        items: [{ foodId: "food-1", servingMultiplier: 2 }],
      }),
    );
    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it("食品を削除すると空のセットを保存できない", async () => {
    const foodSetRepository = createFoodSetRepository();
    const { getByLabelText, getByText } = await render(
      <EditFoodSetScreen
        foodRepository={createFoodRepository()}
        foodSetId="set-id"
        foodSetRepository={foodSetRepository}
        onCancel={jest.fn()}
        onSaved={jest.fn()}
      />,
    );

    await waitFor(() => expect(getByText("ゆで卵")).toBeTruthy());
    await fireEvent.press(getByLabelText("ゆで卵をセットから削除"));
    await fireEvent.press(getByLabelText("セットの変更を保存する"));

    expect(getByText("食品を1件以上追加してください")).toBeTruthy();
    expect(foodSetRepository.update).not.toHaveBeenCalled();
  });

  it("対象が存在しない場合は編集フォームを表示しない", async () => {
    const { getByText, queryByLabelText } = await render(
      <EditFoodSetScreen
        foodRepository={createFoodRepository()}
        foodSetId="missing"
        foodSetRepository={createFoodSetRepository(null)}
        onCancel={jest.fn()}
        onSaved={jest.fn()}
      />,
    );

    await waitFor(() =>
      expect(
        getByText("編集する食品セットが見つかりませんでした"),
      ).toBeTruthy(),
    );
    expect(queryByLabelText("セット名")).toBeNull();
  });
});
