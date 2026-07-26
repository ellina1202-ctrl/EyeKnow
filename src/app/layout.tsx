import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EyeKnow",
  description: "Eye-tracking AAC communication system with LLM sentence generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
