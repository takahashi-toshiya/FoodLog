export type FoodItem = {
  id: string;
  name: string;
  servingAmount: number;
  servingUnit: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateFoodInput = Pick<
  FoodItem,
  | "name"
  | "servingAmount"
  | "servingUnit"
  | "calories"
  | "protein"
  | "fat"
  | "carbs"
  | "memo"
>;
