import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shora Line — караоке дома",
  description: "Домашняя караоке-система с очередью, текстами песен и пультом управления.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
