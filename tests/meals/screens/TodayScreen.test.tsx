import { fireEvent, render } from "@testing-library/react-native";

import { TodayScreen } from "@/meals/screens/TodayScreen";

describe("TodayScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 7, 28, 12));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows meals and calculated nutrition for today", async () => {
    const { getByText } = await render(<TodayScreen />);

    expect(getByText("8月28日 金曜日")).toBeTruthy();
    expect(getByText("1,188")).toBeTruthy();
    expect(getByText("812 kcal")).toBeTruthy();
    expect(getByText("オートミールとバナナ")).toBeTruthy();
  });

  it("shows the empty state when another date is selected", async () => {
    const { getByLabelText, getAllByText, getByText } = await render(<TodayScreen />);

    await fireEvent.press(getByLabelText("8月27日"));

    expect(getByText("8月27日 木曜日")).toBeTruthy();
    expect(getByText("0件")).toBeTruthy();
    expect(getAllByText(/(朝食|昼食|夕食|間食)を追加$/)).toHaveLength(4);
  });
});
