import type { FoodItem } from "@/foods/types/food";

export type CreateFoodInput = {
  name: string;
  servingAmount: number;
  servingUnit: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  memo: string | null;
};

export interface FoodRepository {
  findAll(): Promise<FoodItem[]>;
  findById(id: string): Promise<FoodItem | null>;
  create(input: CreateFoodInput): Promise<FoodItem>;
}
