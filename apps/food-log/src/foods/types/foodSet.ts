import type { FoodItem } from "@/foods/types/food";

export type FoodSetItem = {
  id: string;
  food: FoodItem;
  servingMultiplier: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type FoodSet = {
  id: string;
  name: string;
  items: FoodSetItem[];
  createdAt: string;
  updatedAt: string;
};

export type FoodSetItemInput = {
  foodId: string;
  servingMultiplier: number;
};

export type CreateFoodSetInput = {
  name: string;
  items: FoodSetItemInput[];
};
