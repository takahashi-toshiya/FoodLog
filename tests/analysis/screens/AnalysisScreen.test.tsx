import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { AnalysisScreen } from "@/analysis/screens/AnalysisScreen";
import type { AnalysisRepository } from "@/analysis/storage/AnalysisRepository";
import type { AnalysisSourceData } from "@/analysis/types/analysis";
import { addDays, toDateKey } from "@/shared/utils/date";

describe("分析画面", () => {
  it("初期表示で4週間の集計値を表示する", async () => {
    const repository = createRepository(createSource());
    const { getByText } = await render(
      <AnalysisScreen endDateKey="2026-09-28" repository={repository} />,
    );

    await waitFor(() => expect(getByText("2,000 kcal/日")).toBeTruthy());
    expect(getByText("-1.0 kg")).toBeTruthy();
    expect(getByText(/約2,285 kcal\/日/)).toBeTruthy();
    expect(getByText("食事記録 28/28日")).toBeTruthy();
    expect(repository.findByDateRange).toHaveBeenCalledWith(
      "2026-09-01",
      "2026-09-28",
    );
  });

  it("期間を変更すると変更後のデータを取得する", async () => {
    const repository = createRepository(createSource());
    const { getByText } = await render(
      <AnalysisScreen endDateKey="2026-09-28" repository={repository} />,
    );

    await waitFor(() => expect(getByText("2,000 kcal/日")).toBeTruthy());
    await fireEvent.press(getByText("8週間"));

    await waitFor(() =>
      expect(repository.findByDateRange).toHaveBeenLastCalledWith(
        "2026-08-04",
        "2026-09-28",
      ),
    );
  });

  it("選択した日付のカロリーと体重を表示する", async () => {
    const repository = createRepository(createSource());
    const { getByLabelText, getByText } = await render(
      <AnalysisScreen endDateKey="2026-09-28" repository={repository} />,
    );

    await waitFor(() => expect(getByText("2,000 kcal/日")).toBeTruthy());
    await fireEvent.press(getByLabelText("9/1の分析値を表示"));

    expect(getByText("摂取カロリー：2,000 kcal")).toBeTruthy();
    expect(getByText("体重：70.0 kg")).toBeTruthy();
  });

  it("記録がない場合は空状態を表示する", async () => {
    const repository = createRepository({
      dailyCalories: [],
      dailyWeights: [],
    });
    const { getByText } = await render(
      <AnalysisScreen endDateKey="2026-09-28" repository={repository} />,
    );

    await waitFor(() =>
      expect(getByText("分析できる記録がありません")).toBeTruthy(),
    );
  });

  it("取得に失敗した場合は再試行できる", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const repository: AnalysisRepository = {
      findByDateRange: jest
        .fn()
        .mockRejectedValueOnce(new Error("failed"))
        .mockResolvedValueOnce(createSource()),
    };
    const { getByLabelText, getByText } = await render(
      <AnalysisScreen endDateKey="2026-09-28" repository={repository} />,
    );

    await waitFor(() =>
      expect(getByText("分析データを読み込めませんでした")).toBeTruthy(),
    );
    await fireEvent.press(getByLabelText("分析データを再読み込み"));

    await waitFor(() => expect(getByText("2,000 kcal/日")).toBeTruthy());
    consoleError.mockRestore();
  });
});

function createRepository(source: AnalysisSourceData): AnalysisRepository {
  return {
    findByDateRange: jest.fn(async () => source),
  };
}

function createSource(): AnalysisSourceData {
  const start = new Date("2026-09-01T00:00:00");
  return {
    dailyCalories: Array.from({ length: 28 }, (_, index) => ({
      date: toDateKey(addDays(start, index)),
      calories: 2_000,
    })),
    dailyWeights: [
      { date: "2026-09-01", weightKg: 70 },
      { date: "2026-09-28", weightKg: 69 },
    ],
  };
}
