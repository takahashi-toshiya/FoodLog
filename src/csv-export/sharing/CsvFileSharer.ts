export interface CsvFileSharer {
  isAvailable(): Promise<boolean>;
  share(content: string, fileName: string): Promise<void>;
}
