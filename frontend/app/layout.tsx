import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReviewFit",
  description: "AI 리뷰 답변 자동화",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
