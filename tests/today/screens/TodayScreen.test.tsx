import { fireEvent, render, waitFor } from "@testing-library/react-native";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";

import { createMealEntryFixtures } from "@/meals/fixtures/mealEntries";
import { TodayScreen } from "@/today/screens/TodayScreen";
import type { MealRepository } from "@/meals/storage/MealRepository";
import type { NutritionGoalRepository } from "@/settings/storage/NutritionGoalRepository";
import type { WeightRepository } from "@/weights/storage/WeightRepository";

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
      createMany: jest.fn(),
      delete: jest.fn(),
      findByDate: jest.fn(async (date: string) =>
        date === "2026-08-28" ? createMealEntryFixtures(date) : [],
      ),
      findById: jest.fn(),
      update: jest.fn(),
    };
  }

  function createNutritionGoalRepository(): NutritionGoalRepository {
    return {
      findEffectiveOn: jest.fn(async (date) => ({
        id: `goal-${date}`,
        effectiveFrom: date,
        calories: date === "2026-08-27" ? 1800 : 1975,
        protein: 120,
        fat: 55,
        carbs: 250,
        createdAt: `${date}T00:00:00.000Z`,
        updatedAt: `${date}T00:00:00.000Z`,
      })),
      save: jest.fn(),
    };
  }

  function createWeightRepository(): WeightRepository {
    return {
      findByDate: jest.fn(async (date) =>
        date === "2026-08-28"
          ? {
              id: "weight-1",
              recordedDate: date,
              weightKg: 72.45,
              createdAt: `${date}T00:00:00.000Z`,
              updatedAt: `${date}T00:00:00.000Z`,
            }
          : null,
      ),
      save: jest.fn(async (input) => ({
        id: "weight-1",
        recordedDate: input.recordedDate,
        weightKg: input.weightKg,
        createdAt: `${input.recordedDate}T00:00:00.000Z`,
        updatedAt: `${input.recordedDate}T00:00:00.000Z`,
      })),
    };
  }

  it("当日の食事と栄養集計を表示する", async () => {
    const { getByText } = await render(
      <TodayScreen
        nutritionGoalRepository={createNutritionGoalRepository()}
        repository={createRepository()}
        weightRepository={createWeightRepository()}
      />,
    );

    await waitFor(() => expect(getByText("オートミールとバナナ")).toBeTruthy());
    expect(getByText("8月28日 金曜日")).toBeTruthy();
    expect(getByText("1,188")).toBeTruthy();
    expect(getByText("787 kcal")).toBeTruthy();
  });

  it("読み込み中は0件や集計値を表示しない", async () => {
    const repository = createRepository();
    repository.findByDate = jest.fn(() => new Promise(() => undefined));
    const { getByText, queryByText } = await render(
      <TodayScreen
        nutritionGoalRepository={createNutritionGoalRepository()}
        repository={repository}
        weightRepository={createWeightRepository()}
      />,
    );

    expect(getByText("食事記録を読み込んでいます")).toBeTruthy();
    expect(queryByText("0件")).toBeNull();
    expect(queryByText("0 kcal")).toBeNull();
  });

  it("記録のない日を選択すると空状態を表示する", async () => {
    const { getByLabelText, getAllByText, getByText } = await render(
      <TodayScreen
        nutritionGoalRepository={createNutritionGoalRepository()}
        repository={createRepository()}
        weightRepository={createWeightRepository()}
      />,
    );

    await waitFor(() => expect(getByText("4件")).toBeTruthy());
    await fireEvent.press(getByLabelText("8月27日"));

    await waitFor(() => expect(getByText("0件")).toBeTruthy());
    expect(getByText("8月27日 木曜日")).toBeTruthy();
    expect(getByText("/ 1,800 kcal")).toBeTruthy();
    expect(getAllByText(/(朝食|昼食|夕食|間食)を追加$/)).toHaveLength(4);
  });

  it("指定された日付を初期表示する", async () => {
    const repository = createRepository();
    const { getByLabelText, getByText, rerender } = await render(
      <TodayScreen
        initialDateKey="2026-08-27"
        initialDateRequestId="request-1"
        nutritionGoalRepository={createNutritionGoalRepository()}
        repository={repository}
        weightRepository={createWeightRepository()}
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
        nutritionGoalRepository={createNutritionGoalRepository()}
        repository={repository}
        weightRepository={createWeightRepository()}
      />,
    );
    await waitFor(() => expect(getByText("8月27日 木曜日")).toBeTruthy());
  });

  it("食事区分の追加導線から日付と区分を渡す", async () => {
    const onAddMeal = jest.fn();
    const { getByLabelText, getByText } = await render(
      <TodayScreen
        nutritionGoalRepository={createNutritionGoalRepository()}
        onAddMeal={onAddMeal}
        repository={createRepository()}
        weightRepository={createWeightRepository()}
      />,
    );

    await waitFor(() => expect(getByText("4件")).toBeTruthy());
    await fireEvent.press(getByLabelText("夕食を追加"));

    expect(onAddMeal).toHaveBeenCalledWith("2026-08-28", "dinner");
  });

  it("食事記録を押すと対象IDを編集導線へ渡す", async () => {
    const onEditMeal = jest.fn();
    const { getByLabelText, getByText } = await render(
      <TodayScreen
        nutritionGoalRepository={createNutritionGoalRepository()}
        onEditMeal={onEditMeal}
        repository={createRepository()}
        weightRepository={createWeightRepository()}
      />,
    );

    await waitFor(() => expect(getByText("4件")).toBeTruthy());
    await fireEvent.press(getByLabelText("オートミールとバナナを編集"));

    expect(onEditMeal).toHaveBeenCalledWith("oatmeal-banana");
  });

  it("カレンダーで選択した日付の記録へ切り替える", async () => {
    const { getByLabelText, getByText } = await render(
      <TodayScreen
        nutritionGoalRepository={createNutritionGoalRepository()}
        repository={createRepository()}
        weightRepository={createWeightRepository()}
      />,
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
      <TodayScreen
        nutritionGoalRepository={createNutritionGoalRepository()}
        repository={createRepository()}
        weightRepository={createWeightRepository()}
      />,
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
        nutritionGoalRepository={createNutritionGoalRepository()}
        repository={createRepository()}
        weightRepository={createWeightRepository()}
      />,
    );

    await waitFor(() => expect(getByText("8月27日 木曜日")).toBeTruthy());
    await fireEvent.press(getByLabelText("今日へ戻る"));

    await waitFor(() => expect(getByText("8月28日 金曜日")).toBeTruthy());
    expect(getByText("4件")).toBeTruthy();
    expect(queryByText("今日へ戻る")).toBeNull();
  });

  it("体重タブへ切り替えると選択日の体重を表示する", async () => {
    const { getByLabelText, getByRole, getByText, queryByLabelText } =
      await render(
        <TodayScreen
          nutritionGoalRepository={createNutritionGoalRepository()}
          repository={createRepository()}
          weightRepository={createWeightRepository()}
        />,
      );

    await waitFor(() => expect(getByText("4件")).toBeTruthy());
    await fireEvent.press(getByRole("tab", { name: "体重" }));

    await waitFor(() => expect(getByText("72.45")).toBeTruthy());
    expect(getByLabelText("体重を編集")).toBeTruthy();
    expect(queryByLabelText("食事を追加")).toBeNull();
  });

  it("体重タブのまま日付を変更すると変更後の日付の記録を表示する", async () => {
    const { getByLabelText, getByRole, getByText } = await render(
      <TodayScreen
        nutritionGoalRepository={createNutritionGoalRepository()}
        repository={createRepository()}
        weightRepository={createWeightRepository()}
      />,
    );

    await fireEvent.press(getByRole("tab", { name: "体重" }));
    await waitFor(() => expect(getByText("72.45")).toBeTruthy());
    await fireEvent.press(getByLabelText("8月27日"));

    await waitFor(() =>
      expect(getByText("この日の体重は未記録です")).toBeTruthy(),
    );
    expect(
      getByRole("tab", { name: "体重" }).props.accessibilityState.selected,
    ).toBe(true);
  });

  it("未記録の日付へ体重を保存する", async () => {
    const weightRepository = createWeightRepository();
    weightRepository.findByDate = jest.fn(async () => null);
    const { getByLabelText, getByRole, getByText } = await render(
      <TodayScreen
        nutritionGoalRepository={createNutritionGoalRepository()}
        repository={createRepository()}
        weightRepository={weightRepository}
      />,
    );

    await fireEvent.press(getByRole("tab", { name: "体重" }));
    await waitFor(() => expect(getByLabelText("体重を記録")).toBeTruthy());
    await fireEvent.press(getByLabelText("体重を記録"));
    await fireEvent.changeText(getByLabelText("体重"), "71.8");
    await fireEvent.press(getByLabelText("体重を保存"));

    await waitFor(() =>
      expect(weightRepository.save).toHaveBeenCalledWith({
        recordedDate: "2026-08-28",
        weightKg: 71.8,
      }),
    );
    expect(getByText("71.8")).toBeTruthy();
  });

  it("不正な体重は保存しない", async () => {
    const weightRepository = createWeightRepository();
    weightRepository.findByDate = jest.fn(async () => null);
    const { getByLabelText, getByRole, getByText } = await render(
      <TodayScreen
        nutritionGoalRepository={createNutritionGoalRepository()}
        repository={createRepository()}
        weightRepository={weightRepository}
      />,
    );

    await fireEvent.press(getByRole("tab", { name: "体重" }));
    await waitFor(() => expect(getByLabelText("体重を記録")).toBeTruthy());
    await fireEvent.press(getByLabelText("体重を記録"));
    await fireEvent.changeText(getByLabelText("体重"), "0");
    await fireEvent.press(getByLabelText("体重を保存"));

    expect(getByText("0より大きい数値を入力してください")).toBeTruthy();
    expect(weightRepository.save).not.toHaveBeenCalled();
  });
});
