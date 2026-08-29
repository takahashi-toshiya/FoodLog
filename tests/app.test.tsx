import { render } from "@testing-library/react-native";

import Index from "@/app/index";

describe("FoodLog app", () => {
  it("renders the Today screen", async () => {
    const { getByText } = await render(<Index />);

    expect(getByText("今日の記録")).toBeTruthy();
    expect(getByText("オートミールとバナナ")).toBeTruthy();
    expect(getByText("4件")).toBeTruthy();
  });
});
