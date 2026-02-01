import type { Metadata } from "next";
import {  Google_Sans } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import "./globals.css";

const font = Google_Sans({
  
  subsets: ["latin"],
});



export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: settings.seoTitle || settings.storeName || 'Cartex',
    description: settings.seoDescription || 'Cartex',
    applicationName: settings.storeName || 'Cartex',
    icons: settings.faviconUrl ? [{ rel: "icon", url: settings.faviconUrl }] : undefined,
  };
}

import { getSettings } from "./actions/settings";
import { CurrencyProvider } from "@/components/providers/currency-provider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html lang="en">
      <body
        className={font.className}
      >
        <AntdRegistry>
          <CurrencyProvider initialCurrency={settings.currency}>
            {children}
          </CurrencyProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
