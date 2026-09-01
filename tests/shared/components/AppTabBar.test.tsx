import { fireEvent, render } from "@testing-library/react-native";

import { AppTabBar } from "@/shared/components/AppTabBar";

describe("下部タブ", () => {
  it("選択したタブを親へ通知する", async () => {
    const onSelectTab = jest.fn();
    const { getByText } = await render(
      <AppTabBar activeTab="today" onSelectTab={onSelectTab} />,
    );

    await fireEvent.press(getByText("ライブラリ"));

    expect(onSelectTab).toHaveBeenCalledWith("library");
  });
});
