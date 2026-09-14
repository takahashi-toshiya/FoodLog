import type { CreateFoodSetInput, FoodSet } from "@/foods/types/foodSet";

export interface FoodSetRepository {
  findAll(): Promise<FoodSet[]>;
  findById(id: string): Promise<FoodSet | null>;
  isFoodUsed(foodId: string): Promise<boolean>;
  create(input: CreateFoodSetInput): Promise<FoodSet>;
  update(id: string, input: CreateFoodSetInput): Promise<FoodSet>;
  delete(id: string): Promise<void>;
}
