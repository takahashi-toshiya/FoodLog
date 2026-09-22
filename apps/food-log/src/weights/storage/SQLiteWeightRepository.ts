import * as Crypto from "expo-crypto";
import type { SQLiteDatabase } from "expo-sqlite";

import type {
  SaveWeightInput,
  WeightRepository,
} from "@/weights/storage/WeightRepository";
import type { WeightRecord } from "@/weights/types/weight";

type WeightRecordRow = {
  id: string;
  recorded_date: string;
  weight_kg: number;
  created_at: string;
  updated_at: string;
};

function mapWeightRecordRow(row: WeightRecordRow): WeightRecord {
  return {
    id: row.id,
    recordedDate: row.recorded_date,
    weightKg: row.weight_kg,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SQLiteWeightRepository implements WeightRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async findByDate(date: string): Promise<WeightRecord | null> {
    const row = await this.db.getFirstAsync<WeightRecordRow>(
      "SELECT * FROM weight_records WHERE recorded_date = ? LIMIT 1",
      date,
    );

    return row ? mapWeightRecordRow(row) : null;
  }

  async save(input: SaveWeightInput): Promise<WeightRecord> {
    const id = Crypto.randomUUID();
    const timestamp = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO weight_records (
        id, recorded_date, weight_kg, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(recorded_date) DO UPDATE SET
        weight_kg = excluded.weight_kg,
        updated_at = excluded.updated_at`,
      id,
      input.recordedDate,
      input.weightKg,
      timestamp,
      timestamp,
    );

    const record = await this.findByDate(input.recordedDate);
    if (!record) {
      throw new Error(
        `保存した体重記録が見つかりません: ${input.recordedDate}`,
      );
    }

    return record;
  }
}
