import type { FoodItem } from "@/foods/types/food";

export const FOOD_ITEM_FIXTURES: readonly FoodItem[] = [
  {
    id: "protein",
    name: "プロテイン",
    servingAmount: 1,
    servingUnit: "杯",
    calories: 118,
    protein: 22,
    fat: 2,
    carbs: 4,
  },
  {
    id: "greek-yogurt",
    name: "ギリシャヨーグルト",
    servingAmount: 1,
    servingUnit: "個",
    calories: 100,
    protein: 10,
    fat: 0,
    carbs: 12,
  },
  {
    id: "brown-rice",
    name: "玄米",
    servingAmount: 150,
    servingUnit: "g",
    calories: 248,
    protein: 4,
    fat: 2,
    carbs: 53,
  },
];
