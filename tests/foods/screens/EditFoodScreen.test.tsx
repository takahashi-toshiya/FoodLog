import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { EditFoodScreen } from "@/foods/screens/EditFoodScreen";
import type { FoodRepository } from "@/foods/storage/FoodRepository";
import type { FoodItem } from "@/foods/types/food";

const FOOD: FoodItem = {
  id: "food-id",
  name: "玄米",
  servingAmount: 150,
  servingUnit: "g",
  calories: 246,
  protein: 4,
  fat: 2,
  carbs: 53,
  memo: "炊飯後",
  createdAt: "2026-09-08T00:00:00.000Z",
  updatedAt: "2026-09-08T00:00:00.000Z",
};

function createRepository(food: FoodItem | null = FOOD): FoodRepository {
  return {
    create: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(async () => food),
    update: jest.fn(async (id, input) => ({
      ...FOOD,
      ...input,
      id,
      updatedAt: "2026-09-08T01:00:00.000Z",
    })),
  };
}

describe("食品編集画面", () => {
  it("保存済みの値を初期表示し、編集内容を保存する", async () => {
    const repository = createRepository();
    const onSaved = jest.fn();
    const { getByDisplayValue, getByLabelText, getByText } = await render(
      <EditFoodScreen
        foodId="food-id"
        onCancel={jest.fn()}
        onSaved={onSaved}
        repository={repository}
      />,
    );

    await waitFor(() => expect(getByDisplayValue("玄米")).toBeTruthy());
    expect(getByText("ライブラリの食品を編集")).toBeTruthy();
    expect(getByText("ライブラリの変更を保存")).toBeTruthy();
    expect(getByDisplayValue("150")).toBeTruthy();
    expect(getByDisplayValue("炊飯後")).toBeTruthy();

    await fireEvent.changeText(getByLabelText("食品名"), "玄米ごはん");
    await fireEvent.press(getByLabelText("ライブラリの変更を保存する"));

    await waitFor(() => expect(repository.update).toHaveBeenCalledTimes(1));
    expect(repository.update).toHaveBeenCalledWith(
      "food-id",
      expect.objectContaining({
        name: "玄米ごはん",
        servingAmount: 150,
        calories: 246,
      }),
    );
    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it("保存カロリーがPFC計算値と異なる場合は手動入力として復元する", async () => {
    const manualFood = { ...FOOD, calories: 250 };
    const { getByDisplayValue, getByText } = await render(
      <EditFoodScreen
        foodId="food-id"
        onCancel={jest.fn()}
        onSaved={jest.fn()}
        repository={createRepository(manualFood)}
      />,
    );

    await waitFor(() => expect(getByText("手動入力")).toBeTruthy());
    expect(getByDisplayValue("250")).toBeTruthy();
  });

  it("対象が存在しない場合は編集フォームを表示しない", async () => {
    const { getByText, queryByLabelText } = await render(
      <EditFoodScreen
        foodId="missing"
        onCancel={jest.fn()}
        onSaved={jest.fn()}
        repository={createRepository(null)}
      />,
    );

    await waitFor(() =>
      expect(getByText("編集する食品が見つかりませんでした")).toBeTruthy(),
    );
    expect(queryByLabelText("食品名")).toBeNull();
  });
});
