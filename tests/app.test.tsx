import { render } from "@testing-library/react-native";

import Index from "@/app/index";

describe("FoodLog app", () => {
  it("renders the initial screen", async () => {
    const { getByText } = await render(<Index />);

    expect(getByText("FoodLog")).toBeTruthy();
  });
});
