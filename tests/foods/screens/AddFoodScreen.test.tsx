import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { AddFoodScreen } from "@/foods/screens/AddFoodScreen";
import type { FoodRepository } from "@/foods/storage/FoodRepository";

describe("食品登録画面", () => {
  function createRepository(): FoodRepository {
    return {
      create: jest.fn(async (input) => ({
        id: "food-id",
        createdAt: "2026-09-01T00:00:00.000Z",
        updatedAt: "2026-09-01T00:00:00.000Z",
        ...input,
      })),
      findAll: jest.fn(),
      findById: jest.fn(),
    };
  }

  it("入力した食品を保存する", async () => {
    const repository = createRepository();
    const onSaved = jest.fn();
    const { getByLabelText } = await render(
      <AddFoodScreen
        onCancel={jest.fn()}
        onSaved={onSaved}
        repository={repository}
      />,
    );

    await fireEvent.changeText(getByLabelText("食品名"), "玄米");
    await fireEvent.changeText(getByLabelText("量"), "150");
    await fireEvent.changeText(getByLabelText("単位"), "g");
    await fireEvent.changeText(getByLabelText("P たんぱく質"), "4");
    await fireEvent.changeText(getByLabelText("F 脂質"), "2");
    await fireEvent.changeText(getByLabelText("C 炭水化物"), "53");
    await fireEvent.press(getByLabelText("食品を保存する"));

    await waitFor(() => expect(repository.create).toHaveBeenCalledTimes(1));
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "玄米",
        servingAmount: 150,
        servingUnit: "g",
        calories: 246,
      }),
    );
    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it("必須項目が空の場合は保存しない", async () => {
    const repository = createRepository();
    const { getByLabelText, getByText } = await render(
      <AddFoodScreen
        onCancel={jest.fn()}
        onSaved={jest.fn()}
        repository={repository}
      />,
    );

    await fireEvent.changeText(getByLabelText("単位"), "");
    await fireEvent.press(getByLabelText("食品を保存する"));

    expect(getByText("食品名を入力してください")).toBeTruthy();
    expect(getByText("単位を入力してください")).toBeTruthy();
    expect(repository.create).not.toHaveBeenCalled();
  });
});
