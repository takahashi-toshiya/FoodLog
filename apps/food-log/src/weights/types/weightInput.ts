export type WeightInputValues = {
  weightKg: string;
};

export type WeightInputErrors = Partial<
  Record<keyof WeightInputValues, string>
>;
