import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { FoodSelectionModal } from "@/foods/screens/FoodSelectionModal";
import { FOOD_ITEM_FIXTURES } from "@/foods/fixtures/foodItems";
import type { FoodRepository } from "@/foods/storage/FoodRepository";

function createRepository(): FoodRepository {
  return {
    create: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(async () => [...FOOD_ITEM_FIXTURES]),
    findById: jest.fn(),
    update: jest.fn(),
  };
}

describe("食事追加用の食品選択モーダル", () => {
  it("食品の検索と選択だけを提供する", async () => {
    const onSelectFood = jest.fn();
    const { getByLabelText, getByText, queryByLabelText } = await render(
      <FoodSelectionModal
        isVisible
        onClose={jest.fn()}
        onSelectFood={onSelectFood}
        repository={createRepository()}
      />,
    );

    await waitFor(() => expect(getByText("プロテイン")).toBeTruthy());
    await fireEvent.changeText(getByLabelText("食品を検索"), "玄米");

    expect(getByText("玄米")).toBeTruthy();
    expect(queryByLabelText("玄米のメニューを開く")).toBeNull();

    await fireEvent.press(getByLabelText("玄米を選択"));

    expect(onSelectFood).toHaveBeenCalledWith(
      FOOD_ITEM_FIXTURES.find((food) => food.id === "brown-rice"),
    );
  });

  it("食品の取得に失敗した場合は再読み込みできる", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const repository = createRepository();
    const findAll = repository.findAll as jest.MockedFunction<
      FoodRepository["findAll"]
    >;
    findAll
      .mockRejectedValueOnce(new Error("database error"))
      .mockResolvedValueOnce([...FOOD_ITEM_FIXTURES]);
    const { getByText } = await render(
      <FoodSelectionModal
        isVisible
        onClose={jest.fn()}
        onSelectFood={jest.fn()}
        repository={repository}
      />,
    );

    await waitFor(() =>
      expect(getByText("食品を読み込めませんでした")).toBeTruthy(),
    );
    await fireEvent.press(getByText("もう一度読み込む"));

    await waitFor(() => expect(getByText("プロテイン")).toBeTruthy());
    expect(findAll).toHaveBeenCalledTimes(2);
    consoleError.mockRestore();
  });
});
