export type FoodInputValues = {
  name: string;
  servingAmount: string;
  servingUnit: string;
  protein: string;
  fat: string;
  carbs: string;
  calorieMode: "calculated" | "manual";
  manualCalories: string;
  memo: string;
};

export type FoodInputErrors = Partial<Record<keyof FoodInputValues, string>>;
