import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { CsvExportScreen } from "@/csv-export/screens/CsvExportScreen";
import type { CsvFileSharer } from "@/csv-export/sharing/CsvFileSharer";
import type { CsvExportRepository } from "@/csv-export/storage/CsvExportRepository";

jest.mock("@/meals/components/DatePickerModal", () => {
  const React = jest.requireActual("react");
  const { Pressable, Text } = jest.requireActual("react-native");

  return {
    DatePickerModal: ({
      isVisible,
      onSelectDate,
    }: {
      isVisible: boolean;
      onSelectDate: (date: Date) => void;
    }) =>
      isVisible
        ? React.createElement(
            Pressable,
            {
              accessibilityLabel: "テスト日付を選択",
              onPress: () => onSelectDate(new Date("2026-09-01T00:00:00")),
            },
            React.createElement(Text, null, "テスト日付を選択"),
          )
        : null,
  };
});

describe("CSVエクスポート画面", () => {
  it("初期期間の記録をCSVにして共有する", async () => {
    const repository = createRepository();
    const fileSharer = createFileSharer();
    const { getByLabelText, getByText } = await render(
      <CsvExportScreen
        fileSharer={fileSharer}
        onClose={jest.fn()}
        repository={repository}
        todayDateKey="2026-09-20"
      />,
    );

    expect(getByText("2026/8/22")).toBeTruthy();
    expect(getByText("2026/9/20")).toBeTruthy();
    await fireEvent.press(getByLabelText("CSVを書き出す"));

    await waitFor(() => expect(fileSharer.share).toHaveBeenCalledTimes(1));
    expect(repository.findByDateRange).toHaveBeenCalledWith(
      "2026-08-22",
      "2026-09-20",
    );
    expect(fileSharer.share).toHaveBeenCalledWith(
      expect.stringContaining(
        "日付,たんぱく質(g),脂質(g),炭水化物(g),総カロリー(kcal),体重(kg)",
      ),
      "foodlog_2026-08-22_2026-09-20.csv",
    );
  });

  it("開始日を変更して選択期間を書き出す", async () => {
    const repository = createRepository();
    const fileSharer = createFileSharer();
    const { getByLabelText } = await render(
      <CsvExportScreen
        fileSharer={fileSharer}
        onClose={jest.fn()}
        repository={repository}
        todayDateKey="2026-09-20"
      />,
    );

    await fireEvent.press(getByLabelText("出力期間の開始日を選択"));
    await fireEvent.press(getByLabelText("テスト日付を選択"));
    await fireEvent.press(getByLabelText("CSVを書き出す"));

    await waitFor(() =>
      expect(repository.findByDateRange).toHaveBeenCalledWith(
        "2026-09-01",
        "2026-09-20",
      ),
    );
  });

  it("記録がない場合はファイルを共有しない", async () => {
    const repository: CsvExportRepository = {
      findByDateRange: jest.fn(async () => ({
        dailyNutrition: [],
        dailyWeights: [],
      })),
    };
    const fileSharer = createFileSharer();
    const { getByLabelText, getByText } = await render(
      <CsvExportScreen
        fileSharer={fileSharer}
        onClose={jest.fn()}
        repository={repository}
        todayDateKey="2026-09-20"
      />,
    );

    await fireEvent.press(getByLabelText("CSVを書き出す"));

    await waitFor(() =>
      expect(
        getByText("選択した期間に書き出せる記録がありません"),
      ).toBeTruthy(),
    );
    expect(fileSharer.share).not.toHaveBeenCalled();
  });

  it("ファイル共有を利用できない場合は理由を表示する", async () => {
    const fileSharer = createFileSharer();
    jest.mocked(fileSharer.isAvailable).mockResolvedValue(false);
    const { getByLabelText, getByText } = await render(
      <CsvExportScreen
        fileSharer={fileSharer}
        onClose={jest.fn()}
        repository={createRepository()}
        todayDateKey="2026-09-20"
      />,
    );

    await fireEvent.press(getByLabelText("CSVを書き出す"));

    await waitFor(() =>
      expect(
        getByText("この端末ではファイル共有を利用できません"),
      ).toBeTruthy(),
    );
    expect(fileSharer.share).not.toHaveBeenCalled();
  });

  it("共有に失敗した場合はエラーを表示して再試行できる", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const fileSharer = createFileSharer();
    jest
      .mocked(fileSharer.share)
      .mockRejectedValueOnce(new Error("failed"))
      .mockResolvedValueOnce(undefined);
    const { getByLabelText, getByText } = await render(
      <CsvExportScreen
        fileSharer={fileSharer}
        onClose={jest.fn()}
        repository={createRepository()}
        todayDateKey="2026-09-20"
      />,
    );

    await fireEvent.press(getByLabelText("CSVを書き出す"));
    await waitFor(() =>
      expect(
        getByText("CSVを書き出せませんでした。もう一度お試しください"),
      ).toBeTruthy(),
    );
    await fireEvent.press(getByLabelText("CSVを書き出す"));

    await waitFor(() => expect(fileSharer.share).toHaveBeenCalledTimes(2));
    consoleError.mockRestore();
  });
});

function createRepository(): CsvExportRepository {
  return {
    findByDateRange: jest.fn(async () => ({
      dailyNutrition: [
        {
          date: "2026-09-20",
          protein: 120,
          fat: 55,
          carbs: 240,
          calories: 1_935,
        },
      ],
      dailyWeights: [{ date: "2026-09-20", weightKg: 68.1 }],
    })),
  };
}

function createFileSharer(): CsvFileSharer {
  return {
    isAvailable: jest.fn(async () => true),
    share: jest.fn(async () => undefined),
  };
}
