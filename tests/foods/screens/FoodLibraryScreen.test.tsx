import { Alert } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { FOOD_ITEM_FIXTURES } from "@/foods/fixtures/foodItems";
import { FoodLibraryScreen } from "@/foods/screens/FoodLibraryScreen";
import type { FoodRepository } from "@/foods/storage/FoodRepository";
import type { FoodSetRepository } from "@/foods/storage/FoodSetRepository";
import type { FoodSet } from "@/foods/types/foodSet";

const FOOD_SET: FoodSet = {
  id: "breakfast-set",
  name: "いつもの朝食",
  items: [
    {
      id: "set-item-1",
      food: FOOD_ITEM_FIXTURES[0],
      servingMultiplier: 1,
      sortOrder: 0,
      createdAt: "2026-09-14T00:00:00.000Z",
      updatedAt: "2026-09-14T00:00:00.000Z",
    },
    {
      id: "set-item-2",
      food: FOOD_ITEM_FIXTURES[1],
      servingMultiplier: 0.5,
      sortOrder: 1,
      createdAt: "2026-09-14T00:00:00.000Z",
      updatedAt: "2026-09-14T00:00:00.000Z",
    },
  ],
  createdAt: "2026-09-14T00:00:00.000Z",
  updatedAt: "2026-09-14T00:00:00.000Z",
};

describe("ライブラリ画面", () => {
  function createRepository(foods = [...FOOD_ITEM_FIXTURES]): FoodRepository {
    return {
      create: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(async () => foods),
      findById: jest.fn(),
      update: jest.fn(),
    };
  }

  function createFoodSetRepository(
    foodSets: FoodSet[] = [FOOD_SET],
  ): FoodSetRepository {
    return {
      create: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(async () => foodSets),
      findById: jest.fn(),
      isFoodUsed: jest.fn(async () => false),
      update: jest.fn(),
    };
  }

  function renderScreen(
    repository = createRepository(),
    onSelectFood = jest.fn(),
    onEditFood = jest.fn(),
    foodSetRepository = createFoodSetRepository(),
    onAddFoodSet = jest.fn(),
    onEditFoodSet = jest.fn(),
  ) {
    return render(
      <FoodLibraryScreen
        foodSetRepository={foodSetRepository}
        onAddFood={jest.fn()}
        onAddFoodSet={onAddFoodSet}
        onEditFood={onEditFood}
        onEditFoodSet={onEditFoodSet}
        onSelectFood={onSelectFood}
        repository={repository}
      />,
    );
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

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

  it("セットタブに登録済みセットと合計栄養値を表示する", async () => {
    const { getByText } = await renderScreen();

    await waitFor(() => expect(getByText("プロテイン")).toBeTruthy());

    await fireEvent.press(getByText("セット"));

    await waitFor(() => expect(getByText("いつもの朝食")).toBeTruthy());
    expect(getByText("2品 · 166 kcal")).toBeTruthy();
    expect(getByText("P 27 / F 2 / C 10")).toBeTruthy();
  });

  it("セットが未登録の場合は登録用の空状態を表示する", async () => {
    const { getByText } = await renderScreen(
      createRepository(),
      jest.fn(),
      jest.fn(),
      createFoodSetRepository([]),
    );

    await fireEvent.press(getByText("セット"));

    await waitFor(() =>
      expect(getByText("セットはまだありません")).toBeTruthy(),
    );
    expect(getByText("＋ セットを追加")).toBeTruthy();
  });

  it("セットタブの追加ボタンからセット登録を開く", async () => {
    const onAddFoodSet = jest.fn();
    const { getByLabelText, getByText } = await renderScreen(
      createRepository(),
      jest.fn(),
      jest.fn(),
      createFoodSetRepository(),
      onAddFoodSet,
    );

    await fireEvent.press(getByText("セット"));
    await fireEvent.press(getByLabelText("セットを追加"));

    expect(onAddFoodSet).toHaveBeenCalledTimes(1);
  });

  it("セットメニューから対象セットを編集できる", async () => {
    const onEditFoodSet = jest.fn();
    jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        buttons?.[0]?.onPress?.();
      });
    const { getByLabelText, getByText } = await renderScreen(
      createRepository(),
      jest.fn(),
      jest.fn(),
      createFoodSetRepository(),
      jest.fn(),
      onEditFoodSet,
    );

    await fireEvent.press(getByText("セット"));
    await waitFor(() => expect(getByText("いつもの朝食")).toBeTruthy());
    await fireEvent.press(getByLabelText("いつもの朝食のメニューを開く"));

    expect(onEditFoodSet).toHaveBeenCalledWith("breakfast-set");
  });

  it("削除を承認するとセットを削除して一覧を再取得する", async () => {
    const foodSetRepository = createFoodSetRepository();
    let alertCount = 0;
    jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        const buttonIndex = 1;
        alertCount += 1;
        buttons?.[buttonIndex]?.onPress?.();
      });
    const { getByLabelText, getByText } = await renderScreen(
      createRepository(),
      jest.fn(),
      jest.fn(),
      foodSetRepository,
    );

    await fireEvent.press(getByText("セット"));
    await waitFor(() => expect(getByText("いつもの朝食")).toBeTruthy());
    await fireEvent.press(getByLabelText("いつもの朝食のメニューを開く"));

    await waitFor(() =>
      expect(foodSetRepository.delete).toHaveBeenCalledWith("breakfast-set"),
    );
    expect(foodSetRepository.findAll).toHaveBeenCalledTimes(2);
    expect(alertCount).toBe(2);
  });

  it("食品カードを押すと選択した食品を通知する", async () => {
    const onSelectFood = jest.fn();
    const { getByLabelText, getByText } = await renderScreen(
      createRepository(),
      onSelectFood,
    );

    await waitFor(() => expect(getByText("プロテイン")).toBeTruthy());
    await fireEvent.press(getByLabelText("プロテインを選択"));

    expect(onSelectFood).toHaveBeenCalledWith(FOOD_ITEM_FIXTURES[0]);
  });

  it("食品メニューから対象食品を編集できる", async () => {
    const onSelectFood = jest.fn();
    const onEditFood = jest.fn();
    jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        buttons?.[0]?.onPress?.();
      });
    const { getByLabelText, getByText } = await renderScreen(
      createRepository(),
      onSelectFood,
      onEditFood,
    );

    await waitFor(() => expect(getByText("プロテイン")).toBeTruthy());
    await fireEvent.press(getByLabelText("プロテインのメニューを開く"));

    expect(onEditFood).toHaveBeenCalledWith("protein");
    expect(onSelectFood).not.toHaveBeenCalled();
  });

  it("削除を承認すると食品を削除して一覧を再取得する", async () => {
    const repository = createRepository();
    jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        buttons?.[1]?.onPress?.();
      });
    const { getByLabelText, getByText } = await renderScreen(repository);

    await waitFor(() => expect(getByText("プロテイン")).toBeTruthy());
    await fireEvent.press(getByLabelText("プロテインのメニューを開く"));

    await waitFor(() =>
      expect(repository.delete).toHaveBeenCalledWith("protein"),
    );
    expect(repository.findAll).toHaveBeenCalledTimes(2);
  });

  it("削除確認をキャンセルした場合は食品を削除しない", async () => {
    const repository = createRepository();
    let alertCount = 0;
    jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        const buttonIndex = alertCount === 0 ? 1 : 0;
        alertCount += 1;
        buttons?.[buttonIndex]?.onPress?.();
      });
    const { getByLabelText, getByText } = await renderScreen(repository);

    await waitFor(() => expect(getByText("プロテイン")).toBeTruthy());
    await fireEvent.press(getByLabelText("プロテインのメニューを開く"));

    expect(repository.delete).not.toHaveBeenCalled();
  });

  it("セットで使用中の食品は削除しない", async () => {
    const repository = createRepository();
    const foodSetRepository = createFoodSetRepository();
    const isFoodUsed = foodSetRepository.isFoodUsed as jest.MockedFunction<
      FoodSetRepository["isFoodUsed"]
    >;
    isFoodUsed.mockResolvedValue(true);
    jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        buttons?.[1]?.onPress?.();
      });
    const { getByLabelText, getByText } = await renderScreen(
      repository,
      jest.fn(),
      jest.fn(),
      foodSetRepository,
    );

    await waitFor(() => expect(getByText("プロテイン")).toBeTruthy());
    await fireEvent.press(getByLabelText("プロテインのメニューを開く"));

    await waitFor(() =>
      expect(
        getByText(
          "この食品はセットで使用中です。セットから外してから削除してください",
        ),
      ).toBeTruthy(),
    );
    expect(repository.delete).not.toHaveBeenCalled();
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

  it("食品セットの取得に失敗した場合は再読み込みできる", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const foodSetRepository = createFoodSetRepository();
    const findAll = foodSetRepository.findAll as jest.MockedFunction<
      FoodSetRepository["findAll"]
    >;
    findAll
      .mockRejectedValueOnce(new Error("database error"))
      .mockResolvedValueOnce([FOOD_SET]);
    const { getByText } = await renderScreen(
      createRepository(),
      jest.fn(),
      jest.fn(),
      foodSetRepository,
    );

    await fireEvent.press(getByText("セット"));
    await waitFor(() =>
      expect(getByText("食品セットを読み込めませんでした")).toBeTruthy(),
    );
    await fireEvent.press(getByText("もう一度読み込む"));

    await waitFor(() => expect(getByText("いつもの朝食")).toBeTruthy());
    expect(findAll).toHaveBeenCalledTimes(2);
    consoleError.mockRestore();
  });
});
