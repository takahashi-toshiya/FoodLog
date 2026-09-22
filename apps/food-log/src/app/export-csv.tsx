import { useMemo } from "react";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { CsvExportScreen } from "@/csv-export/screens/CsvExportScreen";
import { ExpoCsvFileSharer } from "@/csv-export/sharing/ExpoCsvFileSharer";
import { SQLiteCsvExportRepository } from "@/csv-export/storage/SQLiteCsvExportRepository";

export default function CsvExportRoute() {
  const db = useSQLiteContext();
  const router = useRouter();
  const repository = useMemo(() => new SQLiteCsvExportRepository(db), [db]);
  const fileSharer = useMemo(() => new ExpoCsvFileSharer(), []);

  return (
    <CsvExportScreen
      fileSharer={fileSharer}
      onClose={() => router.back()}
      repository={repository}
    />
  );
}
