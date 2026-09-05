import { fireEvent, render, waitFor } from "@testing-library/react-native";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";

import { createMealEntryFixtures } from "@/meals/fixtures/mealEntries";
import { TodayScreen } from "@/meals/screens/TodayScreen";
import type { MealRepository } from "@/meals/storage/MealRepository";

jest.mock("@react-native-community/datetimepicker", () => {
  const { Pressable, Text } = jest.requireActual("react-native");

  return function MockDateTimePicker({
    onChange,
  }: {
    onChange: (event: DateTimePickerEvent, date?: Date) => void;
  }) {
    return (
      <Pressable
        accessibilityLabel="日付を選択"
        onPress={() =>
          onChange(
            {
              nativeEvent: {
                timestamp: new Date(2026, 7, 27, 12).getTime(),
                utcOffset: 540,
              },
              type: "set",
            },
            new Date(2026, 7, 27, 12),
          )
        }
      >
        <Text>日付ピッカー</Text>
      </Pressable>
    );
  };
});

describe("今日画面", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 7, 28, 12));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function createRepository(): MealRepository {
    return {
      create: jest.fn(),
      findByDate: jest.fn(async (date: string) =>
        date === "2026-08-28" ? createMealEntryFixtures(date) : [],
      ),
    };
  }

  it("当日の食事と栄養集計を表示する", async () => {
    const { getByText } = await render(
      <TodayScreen repository={createRepository()} />,
    );

    await waitFor(() => expect(getByText("オートミールとバナナ")).toBeTruthy());
    expect(getByText("8月28日 金曜日")).toBeTruthy();
    expect(getByText("1,188")).toBeTruthy();
    expect(getByText("812 kcal")).toBeTruthy();
  });

  it("読み込み中は0件や集計値を表示しない", async () => {
    const repository = createRepository();
    repository.findByDate = jest.fn(() => new Promise(() => undefined));
    const { getByText, queryByText } = await render(
      <TodayScreen repository={repository} />,
    );

    expect(getByText("食事記録を読み込んでいます")).toBeTruthy();
    expect(queryByText("0件")).toBeNull();
    expect(queryByText("0 kcal")).toBeNull();
  });

  it("記録のない日を選択すると空状態を表示する", async () => {
    const { getByLabelText, getAllByText, getByText } = await render(
      <TodayScreen repository={createRepository()} />,
    );

    await waitFor(() => expect(getByText("4件")).toBeTruthy());
    await fireEvent.press(getByLabelText("8月27日"));

    await waitFor(() => expect(getByText("0件")).toBeTruthy());
    expect(getByText("8月27日 木曜日")).toBeTruthy();
    expect(getAllByText(/(朝食|昼食|夕食|間食)を追加$/)).toHaveLength(4);
  });

  it("指定された日付を初期表示する", async () => {
    const repository = createRepository();
    const { getByLabelText, getByText, rerender } = await render(
      <TodayScreen
        initialDateKey="2026-08-27"
        initialDateRequestId="request-1"
        repository={repository}
      />,
    );

    await waitFor(() => expect(getByText("8月27日 木曜日")).toBeTruthy());
    expect(getByText("0件")).toBeTruthy();

    await fireEvent.press(getByLabelText("8月28日"));
    await waitFor(() => expect(getByText("8月28日 金曜日")).toBeTruthy());

    await rerender(
      <TodayScreen
        initialDateKey="2026-08-27"
        initialDateRequestId="request-2"
        repository={repository}
      />,
    );
    await waitFor(() => expect(getByText("8月27日 木曜日")).toBeTruthy());
  });

  it("食事区分の追加導線から日付と区分を渡す", async () => {
    const onAddMeal = jest.fn();
    const { getByLabelText, getByText } = await render(
      <TodayScreen onAddMeal={onAddMeal} repository={createRepository()} />,
    );

    await waitFor(() => expect(getByText("4件")).toBeTruthy());
    await fireEvent.press(getByLabelText("夕食を追加"));

    expect(onAddMeal).toHaveBeenCalledWith("2026-08-28", "dinner");
  });

  it("カレンダーで選択した日付の記録へ切り替える", async () => {
    const { getByLabelText, getByText } = await render(
      <TodayScreen repository={createRepository()} />,
    );

    await waitFor(() => expect(getByText("4件")).toBeTruthy());
    await fireEvent.press(getByLabelText("カレンダーを開く"));
    await waitFor(() => expect(getByLabelText("日付を選択")).toBeTruthy());
    await fireEvent.press(getByLabelText("日付を選択"));
    await fireEvent.press(getByText("選択"));

    await waitFor(() => expect(getByText("8月27日 木曜日")).toBeTruthy());
    expect(getByText("0件")).toBeTruthy();
    expect(getByLabelText("今日へ戻る")).toBeTruthy();
  });

  it("日付選択をキャンセルすると現在の日付を維持する", async () => {
    const { getByLabelText, getByText, queryByText } = await render(
      <TodayScreen repository={createRepository()} />,
    );

    await waitFor(() => expect(getByText("4件")).toBeTruthy());
    await fireEvent.press(getByLabelText("カレンダーを開く"));
    await waitFor(() => expect(getByLabelText("日付を選択")).toBeTruthy());
    await fireEvent.press(getByLabelText("日付を選択"));
    await fireEvent.press(getByText("キャンセル"));

    expect(getByText("8月28日 金曜日")).toBeTruthy();
    expect(queryByText("今日へ戻る")).toBeNull();
  });

  it("今日へ戻ると当日の記録へ切り替える", async () => {
    const { getByLabelText, getByText, queryByText } = await render(
      <TodayScreen
        initialDateKey="2026-08-27"
        repository={createRepository()}
      />,
    );

    await waitFor(() => expect(getByText("8月27日 木曜日")).toBeTruthy());
    await fireEvent.press(getByLabelText("今日へ戻る"));

    await waitFor(() => expect(getByText("8月28日 金曜日")).toBeTruthy());
    expect(getByText("4件")).toBeTruthy();
    expect(queryByText("今日へ戻る")).toBeNull();
  });
});
