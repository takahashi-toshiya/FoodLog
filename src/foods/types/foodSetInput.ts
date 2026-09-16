import type { FoodItem } from "@/foods/types/food";

export type FoodSetInputItemValues = {
  food: FoodItem;
  servingMultiplier: string;
};

export type FoodSetInputValues = {
  name: string;
  items: FoodSetInputItemValues[];
};

export type FoodSetInputErrors = {
  name?: string;
  items?: string;
  servingMultipliers?: Record<string, string | undefined>;
};
