import type { SQLiteDatabase } from "expo-sqlite";

import { migrateDatabase } from "@/shared/storage/migrations";

describe("DBマイグレーション", () => {
  it("バージョン1のDBへ栄養目標、食品セット、体重のテーブルを追加する", async () => {
    const execAsync = jest.fn(async () => undefined);
    const db = {
      execAsync,
      getFirstAsync: jest.fn(async () => ({ user_version: 1 })),
      withTransactionAsync: jest.fn(async (callback: () => Promise<void>) =>
        callback(),
      ),
    } as unknown as SQLiteDatabase;

    await migrateDatabase(db);

    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE nutrition_goals"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("'default-nutrition-goal', '1970-01-01'"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("PRAGMA user_version = 2"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE food_sets"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE food_set_items"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("ON DELETE RESTRICT"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("UNIQUE (food_set_id, food_id)"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("PRAGMA user_version = 3"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE weight_records"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("PRAGMA user_version = 4"),
    );
  });

  it("バージョン2のDBへ食品セットと体重のテーブルを追加する", async () => {
    const execAsync = jest.fn(async () => undefined);
    const withTransactionAsync = jest.fn(
      async (callback: () => Promise<void>) => callback(),
    );
    const db = {
      execAsync,
      getFirstAsync: jest.fn(async () => ({ user_version: 2 })),
      withTransactionAsync,
    } as unknown as SQLiteDatabase;

    await migrateDatabase(db);

    expect(withTransactionAsync).toHaveBeenCalledTimes(2);
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE food_sets"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("PRAGMA user_version = 3"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE weight_records"),
    );
  });

  it("バージョン3のDBへ体重テーブルを追加する", async () => {
    const execAsync = jest.fn(async () => undefined);
    const withTransactionAsync = jest.fn(
      async (callback: () => Promise<void>) => callback(),
    );
    const db = {
      execAsync,
      getFirstAsync: jest.fn(async () => ({ user_version: 3 })),
      withTransactionAsync,
    } as unknown as SQLiteDatabase;

    await migrateDatabase(db);

    expect(withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE weight_records"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("recorded_date TEXT NOT NULL UNIQUE"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("PRAGMA user_version = 4"),
    );
  });

  it("最新バージョンではスキーマを変更しない", async () => {
    const withTransactionAsync = jest.fn();
    const db = {
      execAsync: jest.fn(async () => undefined),
      getFirstAsync: jest.fn(async () => ({ user_version: 4 })),
      withTransactionAsync,
    } as unknown as SQLiteDatabase;

    await migrateDatabase(db);

    expect(withTransactionAsync).not.toHaveBeenCalled();
  });
});
