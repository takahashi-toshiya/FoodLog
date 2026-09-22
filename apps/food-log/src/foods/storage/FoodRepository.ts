import type { CreateFoodInput, FoodItem } from "@/foods/types/food";

export interface FoodRepository {
  findAll(): Promise<FoodItem[]>;
  findById(id: string): Promise<FoodItem | null>;
  create(input: CreateFoodInput): Promise<FoodItem>;
  update(id: string, input: CreateFoodInput): Promise<FoodItem>;
  delete(id: string): Promise<void>;
}
