import type { WeightRecord } from "@/weights/types/weight";

export type SaveWeightInput = {
  recordedDate: string;
  weightKg: number;
};

export interface WeightRepository {
  findByDate(date: string): Promise<WeightRecord | null>;
  save(input: SaveWeightInput): Promise<WeightRecord>;
}
