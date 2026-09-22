import type { AnalysisSourceData } from "@/analysis/types/analysis";

export interface AnalysisRepository {
  findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<AnalysisSourceData>;
}
