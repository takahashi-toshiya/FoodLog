import { Alert } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { EditMealScreen } from "@/meals/screens/EditMealScreen";
import type { MealRepository } from "@/meals/storage/MealRepository";
import type { MealEntry } from "@/meals/types/meal";

const ENTRY: MealEntry = {
  id: "meal-id",
  sourceFoodId: "food-id",
  date: "2026-09-07",
  mealType: "lunch",
  name: "鶏むね肉",
  servingMultiplier: 0.5,
  calories: 145,
  calorieSource: "calculated",
  protein: 10,
  fat: 5,
  carbs: 15,
  memo: "半分",
  createdAt: "2026-09-07T00:00:00.000Z",
  updatedAt: "2026-09-07T00:00:00.000Z",
};

function createRepository(entry: MealEntry | null = ENTRY): MealRepository {
  return {
    create: jest.fn(),
    delete: jest.fn(),
    findByDate: jest.fn(),
    findById: jest.fn(async () => entry),
    update: jest.fn(async (id, input) => ({
      ...ENTRY,
      ...input,
      id,
      updatedAt: "2026-09-07T01:00:00.000Z",
    })),
  };
}

describe("食事編集画面", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("保存済みの倍率適用前の値を復元し、編集内容を保存する", async () => {
    const repository = createRepository();
    const onSaved = jest.fn();
    const { getByDisplayValue, getByLabelText } = await render(
      <EditMealScreen
        entryId="meal-id"
        onCancel={jest.fn()}
        onDeleted={jest.fn()}
        onSaved={onSaved}
        repository={repository}
      />,
    );

    await waitFor(() => expect(getByDisplayValue("鶏むね肉")).toBeTruthy());
    expect(getByDisplayValue("20")).toBeTruthy();
    expect(getByDisplayValue("10")).toBeTruthy();
    expect(getByDisplayValue("30")).toBeTruthy();

    await fireEvent.changeText(getByLabelText("食品・料理名"), "鶏肉弁当");
    await fireEvent.press(getByLabelText("変更を保存する"));

    await waitFor(() => expect(repository.update).toHaveBeenCalledTimes(1));
    expect(repository.update).toHaveBeenCalledWith(
      "meal-id",
      expect.objectContaining({
        sourceFoodId: "food-id",
        name: "鶏肉弁当",
        protein: 10,
        fat: 5,
        carbs: 15,
        calories: 145,
      }),
    );
    expect(onSaved).toHaveBeenCalledWith("2026-09-07");
  });

  it("削除確認をキャンセルした場合は削除しない", async () => {
    const repository = createRepository();
    jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        buttons?.[0]?.onPress?.();
      });
    const { getByLabelText } = await render(
      <EditMealScreen
        entryId="meal-id"
        onCancel={jest.fn()}
        onDeleted={jest.fn()}
        onSaved={jest.fn()}
        repository={repository}
      />,
    );

    await waitFor(() => expect(getByLabelText("食事記録を削除")).toBeTruthy());
    await fireEvent.press(getByLabelText("食事記録を削除"));

    expect(repository.delete).not.toHaveBeenCalled();
  });

  it("削除確認後に記録を削除し、元の日付を通知する", async () => {
    const repository = createRepository();
    const onDeleted = jest.fn();
    jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        buttons?.[1]?.onPress?.();
      });
    const { getByLabelText } = await render(
      <EditMealScreen
        entryId="meal-id"
        onCancel={jest.fn()}
        onDeleted={onDeleted}
        onSaved={jest.fn()}
        repository={repository}
      />,
    );

    await waitFor(() => expect(getByLabelText("食事記録を削除")).toBeTruthy());
    await fireEvent.press(getByLabelText("食事記録を削除"));

    await waitFor(() =>
      expect(repository.delete).toHaveBeenCalledWith("meal-id"),
    );
    expect(onDeleted).toHaveBeenCalledWith("2026-09-07");
  });

  it("対象が存在しない場合は編集フォームを表示しない", async () => {
    const { getByText, queryByLabelText } = await render(
      <EditMealScreen
        entryId="missing"
        onCancel={jest.fn()}
        onDeleted={jest.fn()}
        onSaved={jest.fn()}
        repository={createRepository(null)}
      />,
    );

    await waitFor(() =>
      expect(getByText("編集する食事記録が見つかりませんでした")).toBeTruthy(),
    );
    expect(queryByLabelText("食品・料理名")).toBeNull();
  });
});
