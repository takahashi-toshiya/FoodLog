import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PFC Meal — 食事管理アプリ",
  description: "カロリーとPFCを迷わず記録できる食事管理アプリのUIプロトタイプ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
