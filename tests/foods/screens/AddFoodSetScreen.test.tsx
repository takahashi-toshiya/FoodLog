import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { AddFoodSetScreen } from "@/foods/screens/AddFoodSetScreen";
import type { FoodRepository } from "@/foods/storage/FoodRepository";
import type { FoodSetRepository } from "@/foods/storage/FoodSetRepository";
import type { FoodItem } from "@/foods/types/food";

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

function createFoodRepository(): FoodRepository {
  return {
    create: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(async () => [FOOD]),
    findById: jest.fn(),
    update: jest.fn(),
  };
}

function createFoodSetRepository(): FoodSetRepository {
  return {
    create: jest.fn(async (input) => ({
      id: "set-id",
      name: input.name,
      items: [],
      createdAt: "2026-09-13T00:00:00.000Z",
      updatedAt: "2026-09-13T00:00:00.000Z",
    })),
    delete: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };
}

describe("食品セット登録画面", () => {
  it("食品と倍率を指定してセットを保存する", async () => {
    const foodSetRepository = createFoodSetRepository();
    const onSaved = jest.fn();
    const { getByLabelText, getByText } = await render(
      <AddFoodSetScreen
        foodRepository={createFoodRepository()}
        foodSetRepository={foodSetRepository}
        onCancel={jest.fn()}
        onSaved={onSaved}
      />,
    );

    await fireEvent.changeText(getByLabelText("セット名"), "いつもの朝食");
    await fireEvent.press(getByLabelText("食品を追加"));
    await waitFor(() => expect(getByText("ゆで卵")).toBeTruthy());
    await fireEvent.press(getByLabelText("ゆで卵を選択"));
    await fireEvent.changeText(getByLabelText("ゆで卵の摂取倍率"), "2");
    await fireEvent.press(getByLabelText("セットを保存する"));

    await waitFor(() =>
      expect(foodSetRepository.create).toHaveBeenCalledWith({
        name: "いつもの朝食",
        items: [{ foodId: "food-1", servingMultiplier: 2 }],
      }),
    );
    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it("セット名と食品が空の場合は保存しない", async () => {
    const foodSetRepository = createFoodSetRepository();
    const { getByLabelText, getByText } = await render(
      <AddFoodSetScreen
        foodRepository={createFoodRepository()}
        foodSetRepository={foodSetRepository}
        onCancel={jest.fn()}
        onSaved={jest.fn()}
      />,
    );

    await fireEvent.press(getByLabelText("セットを保存する"));

    expect(getByText("セット名を入力してください")).toBeTruthy();
    expect(getByText("食品を1件以上追加してください")).toBeTruthy();
    expect(foodSetRepository.create).not.toHaveBeenCalled();
  });

  it("同じ食品を再選択しても重複追加せず、既存の倍率を維持する", async () => {
    const { getAllByLabelText, getByDisplayValue, getByLabelText, getByText } =
      await render(
        <AddFoodSetScreen
          foodRepository={createFoodRepository()}
          foodSetRepository={createFoodSetRepository()}
          onCancel={jest.fn()}
          onSaved={jest.fn()}
        />,
      );

    await fireEvent.press(getByLabelText("食品を追加"));
    await waitFor(() => expect(getByText("ゆで卵")).toBeTruthy());
    await fireEvent.press(getByLabelText("ゆで卵を選択"));
    await fireEvent.changeText(getByLabelText("ゆで卵の摂取倍率"), "2");

    await fireEvent.press(getByLabelText("食品を追加"));
    await waitFor(() => expect(getByLabelText("ゆで卵を選択")).toBeTruthy());
    await fireEvent.press(getByLabelText("ゆで卵を選択"));

    expect(getByText("この食品はすでにセットへ追加されています")).toBeTruthy();
    expect(getAllByLabelText("ゆで卵の摂取倍率")).toHaveLength(1);
    expect(getByDisplayValue("2")).toBeTruthy();
  });
});
