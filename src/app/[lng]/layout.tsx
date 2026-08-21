import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { dir } from "i18next";

import { languages } from "@/app/i18n/settings";
import { ProvidersTheme } from "@/context/ThemeContext";

export function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}
// const webVersion = process.env.NEXT_PUBLIC_WEB_VERSION

export const metadata: Metadata = {
  title: "TPA Systems",
  // title: "TPA Systems : " + webVersion,
  description: "for PTT",
};

export default function RootLayout({
  children,
  params: { lng },
}: Readonly<{
  children: React.ReactNode;
  params: {
    lng: string;
  };
}>) {
  return <section>{children}</section>;
}
