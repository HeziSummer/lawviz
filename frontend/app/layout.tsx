import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "律析 LawViz",
  description: "私有 MVP：律师案件可视化报告生成工作台",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
