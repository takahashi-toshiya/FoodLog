import { validateWeightInput } from "@/weights/services/weightInput";

describe("体重入力", () => {
  it.each(["72", "72.45"])("正の数値%sを保存値へ変換する", (weightKg) => {
    expect(validateWeightInput({ weightKg }, "2026-09-19")).toEqual({
      isValid: true,
      value: {
        recordedDate: "2026-09-19",
        weightKg: Number(weightKg),
      },
    });
  });

  it.each([
    ["", "体重を入力してください"],
    ["weight", "数値を入力してください"],
    ["0", "0より大きい数値を入力してください"],
    ["-1", "0より大きい数値を入力してください"],
  ])("入力%sを拒否する", (weightKg, message) => {
    expect(validateWeightInput({ weightKg }, "2026-09-19")).toEqual({
      isValid: false,
      errors: { weightKg: message },
    });
  });
});
