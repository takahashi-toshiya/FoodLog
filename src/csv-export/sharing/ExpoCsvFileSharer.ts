import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import type { CsvFileSharer } from "@/csv-export/sharing/CsvFileSharer";

export class ExpoCsvFileSharer implements CsvFileSharer {
  isAvailable(): Promise<boolean> {
    return Sharing.isAvailableAsync();
  }

  async share(content: string, fileName: string): Promise<void> {
    const file = new File(Paths.cache, fileName);
    file.create({ overwrite: true });
    file.write(content);

    await Sharing.shareAsync(file.uri, {
      dialogTitle: "CSVを書き出す",
      mimeType: "text/csv",
      UTI: "public.comma-separated-values-text",
    });
  }
}
