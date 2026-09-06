export type NutritionGoalInputValues = {
  protein: string;
  fat: string;
  carbs: string;
};

export type NutritionGoalInputErrors = Partial<
  Record<keyof NutritionGoalInputValues | "form", string>
>;
