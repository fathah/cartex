import type { Metadata } from "next";
import { Funnel_Display } from "next/font/google";

export const dynamic = "force-dynamic";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";

const font = Funnel_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: settings.seoTitle || settings.storeName || "Cartex",
    description: settings.seoDescription || "Cartex",
    applicationName: settings.storeName || "Cartex",
    icons: settings.faviconUrl
      ? [{ rel: "icon", url: settings.faviconUrl }]
      : undefined,
  };
}

import { getSettings } from "../actions/settings";
import { CurrencyProvider } from "@/components/providers/currency-provider";
import WishlistSync from "@/components/WishlistSync";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html lang="en">
      <body className={`${font.className} overflow-x-hidden`}>
        <AntdRegistry>
          <CurrencyProvider initialCurrency={settings.currency}>
            <WishlistSync />
            {children}
          </CurrencyProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
