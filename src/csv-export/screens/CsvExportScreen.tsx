import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  buildCsvExportRows,
  createCsvContent,
  createCsvFileName,
  getDefaultCsvExportDateRange,
} from "@/csv-export/services/csvExport";
import type { CsvFileSharer } from "@/csv-export/sharing/CsvFileSharer";
import type { CsvExportRepository } from "@/csv-export/storage/CsvExportRepository";
import { DatePickerModal } from "@/meals/components/DatePickerModal";
import { DateRangeSelector } from "@/shared/components/DateRangeSelector";
import { colors } from "@/shared/theme/colors";
import { toDateKey } from "@/shared/utils/date";

type CsvExportScreenProps = {
  repository: CsvExportRepository;
  fileSharer: CsvFileSharer;
  onClose: () => void;
  todayDateKey?: string;
};

export function CsvExportScreen({
  repository,
  fileSharer,
  onClose,
  todayDateKey = toDateKey(new Date()),
}: CsvExportScreenProps) {
  const [dateRange, setDateRange] = useState(() =>
    getDefaultCsvExportDateRange(todayDateKey),
  );
  const [activeDateField, setActiveDateField] = useState<
    "start" | "end" | null
  >(null);
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isExportingRef = useRef(false);

  const handleSelectDate = (date: Date) => {
    if (!activeDateField) return;

    setDateRange((current) => ({
      ...current,
      [activeDateField === "start" ? "startDate" : "endDate"]: toDateKey(date),
    }));
    setActiveDateField(null);
    setMessage(null);
  };

  const handleExport = async () => {
    if (isExportingRef.current) return;

    isExportingRef.current = true;
    setIsExporting(true);
    setMessage(null);

    try {
      const source = await repository.findByDateRange(
        dateRange.startDate,
        dateRange.endDate,
      );
      const rows = buildCsvExportRows(source);

      if (rows.length === 0) {
        setMessage("選択した期間に書き出せる記録がありません");
        return;
      }

      if (!(await fileSharer.isAvailable())) {
        setMessage("この端末ではファイル共有を利用できません");
        return;
      }

      await fileSharer.share(
        createCsvContent(rows),
        createCsvFileName(dateRange.startDate, dateRange.endDate),
      );
    } catch (error) {
      console.error("CSVの書き出しに失敗しました", error);
      setMessage("CSVを書き出せませんでした。もう一度お試しください");
    } finally {
      isExportingRef.current = false;
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="CSV書き出しを閉じる"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.closeButton}
        >
          <Text style={styles.closeText}>閉じる</Text>
        </Pressable>
        <Text style={styles.title}>CSVを書き出す</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View>
          <Text style={styles.sectionTitle}>出力期間</Text>
          <DateRangeSelector
            accessibilityLabelPrefix="出力期間"
            endDate={dateRange.endDate}
            onSelectEndDate={() => setActiveDateField("end")}
            onSelectStartDate={() => setActiveDateField("start")}
            startDate={dateRange.startDate}
          />
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>1日ごとの記録を出力します</Text>
          <Text style={styles.descriptionText}>
            たんぱく質・脂質・炭水化物・総カロリー・体重を、日本語ヘッダーのCSVにまとめます。
          </Text>
          <Text style={styles.descriptionText}>
            共有画面が開いたら「“ファイル”に保存」を選択してください。
          </Text>
        </View>

        {message && (
          <Text accessibilityRole="alert" style={styles.message}>
            {message}
          </Text>
        )}

        <Pressable
          accessibilityLabel="CSVを書き出す"
          accessibilityRole="button"
          disabled={isExporting}
          onPress={handleExport}
          style={({ pressed }) => [
            styles.exportButton,
            isExporting && styles.exportButtonDisabled,
            pressed && !isExporting && styles.exportButtonPressed,
          ]}
        >
          <Text style={styles.exportButtonText}>
            {isExporting ? "CSVを作成しています" : "CSVを書き出す"}
          </Text>
        </Pressable>
      </View>

      <DatePickerModal
        isVisible={activeDateField !== null}
        maximumDate={
          activeDateField === "start"
            ? parseDateKey(dateRange.endDate)
            : parseDateKey(todayDateKey)
        }
        minimumDate={
          activeDateField === "end"
            ? parseDateKey(dateRange.startDate)
            : undefined
        }
        onCancel={() => setActiveDateField(null)}
        onSelectDate={handleSelectDate}
        selectedDate={parseDateKey(
          activeDateField === "end" ? dateRange.endDate : dateRange.startDate,
        )}
        title={activeDateField === "end" ? "終了日を選択" : "開始日を選択"}
      />
    </SafeAreaView>
  );
}

function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`);
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 58,
    paddingHorizontal: 16,
  },
  closeButton: { minWidth: 52, paddingVertical: 10 },
  closeText: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  title: { color: colors.text, fontSize: 17, fontWeight: "800" },
  headerSpacer: { width: 52 },
  content: { flex: 1, gap: 20, paddingHorizontal: 16, paddingTop: 18 },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 8,
    marginHorizontal: 4,
  },
  descriptionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 17,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  descriptionTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  descriptionText: { color: colors.textMuted, fontSize: 12, lineHeight: 19 },
  message: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  exportButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 18,
  },
  exportButtonDisabled: { opacity: 0.55 },
  exportButtonPressed: { opacity: 0.82 },
  exportButtonText: { color: colors.surface, fontSize: 14, fontWeight: "800" },
});
