import type { CreateMealEntryInput, MealEntry } from "@/meals/types/meal";

export interface MealRepository {
  findByDate(date: string): Promise<MealEntry[]>;
  findById(id: string): Promise<MealEntry | null>;
  create(input: CreateMealEntryInput): Promise<MealEntry>;
  update(id: string, input: CreateMealEntryInput): Promise<MealEntry>;
  delete(id: string): Promise<void>;
}
