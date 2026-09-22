import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { EditNutritionGoalScreen } from "@/settings/screens/EditNutritionGoalScreen";
import type { NutritionGoalRepository } from "@/settings/storage/NutritionGoalRepository";

describe("栄養目標編集画面", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 8, 5, 12));
  });

  afterEach(() => jest.useRealTimers());

  function createRepository(): NutritionGoalRepository {
    return {
      findEffectiveOn: jest.fn(async () => ({
        id: "goal",
        effectiveFrom: "1970-01-01",
        calories: 1975,
        protein: 120,
        fat: 55,
        carbs: 250,
        createdAt: "1970-01-01T00:00:00.000Z",
        updatedAt: "1970-01-01T00:00:00.000Z",
      })),
      save: jest.fn(async (input) => ({
        id: "new-goal",
        ...input,
        createdAt: "2026-09-05T00:00:00.000Z",
        updatedAt: "2026-09-05T00:00:00.000Z",
      })),
    };
  }

  it("変更日の目標値を保存する", async () => {
    const repository = createRepository();
    const onSaved = jest.fn();
    const { getByLabelText, getByText } = await render(
      <EditNutritionGoalScreen
        onCancel={jest.fn()}
        onSaved={onSaved}
        repository={repository}
      />,
    );

    await waitFor(() =>
      expect(getByLabelText("たんぱく質").props.value).toBe("120"),
    );
    await fireEvent.changeText(getByLabelText("たんぱく質"), "130");
    expect(getByText("2,015 kcal")).toBeTruthy();
    await fireEvent.press(getByLabelText("目標を保存"));

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(repository.save).toHaveBeenCalledWith({
      effectiveFrom: "2026-09-05",
      calories: 2015,
      protein: 130,
      fat: 55,
      carbs: 250,
    });
  });

  it("不正な入力は保存せずエラーを表示する", async () => {
    const repository = createRepository();
    const { getByLabelText, getByText } = await render(
      <EditNutritionGoalScreen
        onCancel={jest.fn()}
        onSaved={jest.fn()}
        repository={repository}
      />,
    );

    await waitFor(() =>
      expect(getByLabelText("たんぱく質").props.value).toBe("120"),
    );
    await fireEvent.changeText(getByLabelText("たんぱく質"), "-1");
    await fireEvent.press(getByLabelText("目標を保存"));

    expect(getByText("0以上の数値を入力してください")).toBeTruthy();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("保存に失敗した場合は入力内容を維持してエラーを表示する", async () => {
    const repository = createRepository();
    repository.save = jest.fn(async () => {
      throw new Error("save failed");
    });
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const { getByLabelText, getByText } = await render(
      <EditNutritionGoalScreen
        onCancel={jest.fn()}
        onSaved={jest.fn()}
        repository={repository}
      />,
    );

    await waitFor(() =>
      expect(getByLabelText("たんぱく質").props.value).toBe("120"),
    );
    await fireEvent.changeText(getByLabelText("たんぱく質"), "130");
    await fireEvent.press(getByLabelText("目標を保存"));

    await waitFor(() =>
      expect(
        getByText("目標値を保存できませんでした。もう一度お試しください"),
      ).toBeTruthy(),
    );
    expect(getByLabelText("たんぱく質").props.value).toBe("130");
    consoleError.mockRestore();
  });
});
