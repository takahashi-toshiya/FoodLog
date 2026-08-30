import type { FoodItem } from "@/foods/types/food";

export function filterFoods(
  foods: readonly FoodItem[],
  searchText: string,
): FoodItem[] {
  const normalizedSearchText = searchText.trim().toLocaleLowerCase("ja-JP");

  if (!normalizedSearchText) {
    return [...foods];
  }

  return foods.filter((food) =>
    food.name.toLocaleLowerCase("ja-JP").includes(normalizedSearchText),
  );
}
