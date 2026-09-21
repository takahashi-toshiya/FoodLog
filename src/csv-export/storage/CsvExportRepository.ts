import type { CsvExportSourceData } from "@/csv-export/types/csvExport";

export interface CsvExportRepository {
  findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<CsvExportSourceData>;
}
