import {getLocale} from "next-intl/server";
import "./globals.css";
import {Geist, Geist_Mono} from "next/font/google";
import type {Metadata} from "next";
import {defaultLocale} from "@/i18n.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Aika World",
  description: "Aika világának bemutató oldala.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale().catch(() => defaultLocale);

  return (
    <html lang={locale} className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-white text-neutral-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
