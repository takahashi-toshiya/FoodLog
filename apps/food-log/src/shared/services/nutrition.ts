export function calculateCalories(
  protein: number,
  fat: number,
  carbs: number,
): number {
  return Math.round(protein * 4 + fat * 9 + carbs * 4);
}
