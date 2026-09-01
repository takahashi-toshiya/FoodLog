import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { FOOD_ITEM_FIXTURES } from "@/foods/fixtures/foodItems";
import { FoodLibraryScreen } from "@/foods/screens/FoodLibraryScreen";
import type { FoodRepository } from "@/foods/storage/FoodRepository";

describe("ライブラリ画面", () => {
  function createRepository(foods = [...FOOD_ITEM_FIXTURES]): FoodRepository {
    return {
      create: jest.fn(),
      findAll: jest.fn(async () => foods),
    };
  }

  function renderScreen(repository = createRepository()) {
    return render(
      <FoodLibraryScreen onAddFood={jest.fn()} repository={repository} />,
    );
  }

  it("よく使う食品と栄養情報を表示する", async () => {
    const { getByText } = await renderScreen();

    expect(getByText("すばやく記録")).toBeTruthy();
    await waitFor(() => expect(getByText("プロテイン")).toBeTruthy());
    expect(getByText("1杯 · 118 kcal · P 22 / F 2 / C 4")).toBeTruthy();
    expect(getByText("玄米")).toBeTruthy();
  });

  it("入力した食品名で一覧を絞り込む", async () => {
    const { getByLabelText, getByText, queryByText } = await renderScreen();

    await waitFor(() => expect(getByText("プロテイン")).toBeTruthy());

    await fireEvent.changeText(getByLabelText("食品を検索"), "ヨーグルト");

    expect(getByText("ギリシャヨーグルト")).toBeTruthy();
    expect(queryByText("プロテイン")).toBeNull();
    expect(queryByText("玄米")).toBeNull();
  });

  it("一致する食品がない場合は検索結果の空状態を表示する", async () => {
    const { getByLabelText, getByText } = await renderScreen();

    await waitFor(() => expect(getByText("プロテイン")).toBeTruthy());

    await fireEvent.changeText(getByLabelText("食品を検索"), "納豆");

    expect(getByText("該当する食品がありません")).toBeTruthy();
  });

  it("食品が未登録の場合は登録用の空状態を表示する", async () => {
    const { getByText } = await renderScreen(createRepository([]));

    await waitFor(() =>
      expect(getByText("登録した食品はありません")).toBeTruthy(),
    );
    expect(getByText("＋ 食品を追加")).toBeTruthy();
  });

  it("セットを選択するとセット用の空状態を表示する", async () => {
    const { getByText } = await renderScreen();

    await waitFor(() => expect(getByText("プロテイン")).toBeTruthy());

    await fireEvent.press(getByText("セット"));

    expect(getByText("セットはまだありません")).toBeTruthy();
  });

  it("食品の取得に失敗した場合は再読み込みできる", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const repository = createRepository();
    const findAll = repository.findAll as jest.MockedFunction<
      FoodRepository["findAll"]
    >;
    findAll
      .mockRejectedValueOnce(new Error("database error"))
      .mockResolvedValueOnce([...FOOD_ITEM_FIXTURES]);
    const { getByText } = await renderScreen(repository);

    await waitFor(() =>
      expect(getByText("食品を読み込めませんでした")).toBeTruthy(),
    );
    await fireEvent.press(getByText("もう一度読み込む"));

    await waitFor(() => expect(getByText("プロテイン")).toBeTruthy());
    expect(findAll).toHaveBeenCalledTimes(2);
    consoleError.mockRestore();
  });
});
