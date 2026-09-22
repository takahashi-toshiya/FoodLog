import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { SettingsScreen } from "@/settings/screens/SettingsScreen";
import type { NutritionGoalRepository } from "@/settings/storage/NutritionGoalRepository";

describe("設定画面", () => {
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
      save: jest.fn(),
    };
  }

  it("現在の目標値とデータ保存方針を表示する", async () => {
    const { getByText } = await render(
      <SettingsScreen
        onEditGoal={jest.fn()}
        onExportCsv={jest.fn()}
        repository={createRepository()}
      />,
    );

    await waitFor(() => expect(getByText("1,975 kcal")).toBeTruthy());
    expect(getByText("120 g")).toBeTruthy();
    expect(getByText("CSVを書き出す")).toBeTruthy();
    expect(
      getByText("データは端末内に保存し、外部へ自動送信しません。"),
    ).toBeTruthy();
  });

  it("目標編集を親へ通知する", async () => {
    const onEditGoal = jest.fn();
    const { getByLabelText, getByText } = await render(
      <SettingsScreen
        onEditGoal={onEditGoal}
        onExportCsv={jest.fn()}
        repository={createRepository()}
      />,
    );

    await waitFor(() => expect(getByText("1,975 kcal")).toBeTruthy());
    await fireEvent.press(getByLabelText("目標を編集"));

    expect(onEditGoal).toHaveBeenCalledTimes(1);
  });

  it("CSV書き出しを親へ通知する", async () => {
    const onExportCsv = jest.fn();
    const { getByLabelText, getByText } = await render(
      <SettingsScreen
        onEditGoal={jest.fn()}
        onExportCsv={onExportCsv}
        repository={createRepository()}
      />,
    );

    await waitFor(() => expect(getByText("1,975 kcal")).toBeTruthy());
    await fireEvent.press(getByLabelText("CSV書き出し画面を開く"));

    expect(onExportCsv).toHaveBeenCalledTimes(1);
  });
});
