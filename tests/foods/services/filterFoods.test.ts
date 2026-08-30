import { FOOD_ITEM_FIXTURES } from "@/foods/fixtures/foodItems";
import { filterFoods } from "@/foods/services/filterFoods";

describe("食品の絞り込み", () => {
  it("食品名の一部に一致する食品を返す", () => {
    const result = filterFoods(FOOD_ITEM_FIXTURES, "ヨーグルト");

    expect(result.map((food) => food.name)).toEqual(["ギリシャヨーグルト"]);
  });

  it("検索文字列の前後の空白と英字の大文字小文字を無視する", () => {
    const foods = [
      {
        ...FOOD_ITEM_FIXTURES[0],
        id: "protein-bar",
        name: "Protein Bar",
      },
    ];

    expect(filterFoods(foods, "  protein  ")).toEqual(foods);
  });

  it("一致しない場合は空配列を返す", () => {
    expect(filterFoods(FOOD_ITEM_FIXTURES, "納豆")).toEqual([]);
  });

  it("絞り込んでも元の食品一覧を変更しない", () => {
    const originalFoods = [...FOOD_ITEM_FIXTURES];

    filterFoods(FOOD_ITEM_FIXTURES, "玄米");

    expect(FOOD_ITEM_FIXTURES).toEqual(originalFoods);
  });
});
