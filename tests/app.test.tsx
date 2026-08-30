import { render } from "@testing-library/react-native";

import TodayRoute from "@/app/(tabs)/today";

describe("FoodLogアプリ", () => {
  it("今日画面を表示する", async () => {
    const { getByText } = await render(<TodayRoute />);

    expect(getByText("今日の記録")).toBeTruthy();
    expect(getByText("オートミールとバナナ")).toBeTruthy();
    expect(getByText("4件")).toBeTruthy();
  });
});
