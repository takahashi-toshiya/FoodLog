import type { SQLiteDatabase } from "expo-sqlite";

import { migrateDatabase } from "@/shared/storage/migrations";

describe("DBマイグレーション", () => {
  it("バージョン1のDBへ栄養目標テーブルと初期履歴を追加する", async () => {
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
  });

  it("最新バージョンではスキーマを変更しない", async () => {
    const withTransactionAsync = jest.fn();
    const db = {
      execAsync: jest.fn(async () => undefined),
      getFirstAsync: jest.fn(async () => ({ user_version: 2 })),
      withTransactionAsync,
    } as unknown as SQLiteDatabase;

    await migrateDatabase(db);

    expect(withTransactionAsync).not.toHaveBeenCalled();
  });
});
