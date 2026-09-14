import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "余白 / YOHAKU — 目を閉じる。あとは、話すだけ。",
  description: "AIに入口を渡し、声と想像力で遊ぶ即興TRPG。決まっているのは、世界観と最初の瞬間だけ。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
