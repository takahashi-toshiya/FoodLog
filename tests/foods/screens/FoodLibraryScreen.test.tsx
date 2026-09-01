import { fireEvent, render } from "@testing-library/react-native";

import { FoodLibraryScreen } from "@/foods/screens/FoodLibraryScreen";

describe("ライブラリ画面", () => {
  it("よく使う食品と栄養情報を表示する", async () => {
    const { getByText } = await render(<FoodLibraryScreen />);

    expect(getByText("すばやく記録")).toBeTruthy();
    expect(getByText("プロテイン")).toBeTruthy();
    expect(getByText("1杯 · 118 kcal · P 22 / F 2 / C 4")).toBeTruthy();
    expect(getByText("玄米")).toBeTruthy();
  });

  it("入力した食品名で一覧を絞り込む", async () => {
    const { getByLabelText, getByText, queryByText } = await render(
      <FoodLibraryScreen />,
    );

    await fireEvent.changeText(getByLabelText("食品を検索"), "ヨーグルト");

    expect(getByText("ギリシャヨーグルト")).toBeTruthy();
    expect(queryByText("プロテイン")).toBeNull();
    expect(queryByText("玄米")).toBeNull();
  });

  it("一致する食品がない場合は検索結果の空状態を表示する", async () => {
    const { getByLabelText, getByText } = await render(<FoodLibraryScreen />);

    await fireEvent.changeText(getByLabelText("食品を検索"), "納豆");

    expect(getByText("該当する食品がありません")).toBeTruthy();
  });

  it("食品が未登録の場合は登録用の空状態を表示する", async () => {
    const { getByText } = await render(<FoodLibraryScreen foods={[]} />);

    expect(getByText("登録した食品はありません")).toBeTruthy();
    expect(getByText("＋ 食品を追加")).toBeTruthy();
  });

  it("セットを選択するとセット用の空状態を表示する", async () => {
    const { getByText } = await render(<FoodLibraryScreen />);

    await fireEvent.press(getByText("セット"));

    expect(getByText("セットはまだありません")).toBeTruthy();
  });
});
