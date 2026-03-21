import type { Metadata } from "next";
import { Funnel_Display } from "next/font/google";
import { ConfigProvider } from "antd";

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
import { PublicEnvScript } from "next-runtime-env";
import { resolveCurrentMarket } from "@/lib/market";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, market] = await Promise.all([
    getSettings(),
    resolveCurrentMarket(),
  ]);

  return (
    <html lang="en">
      <head>
        <PublicEnvScript />
      </head>
      <body className={`${font.className} overflow-x-hidden`}>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                controlHeight: 44,
                controlHeightSM: 38,
                controlHeightLG: 50,
              },
              components: {
                Input: {
                  paddingBlock: 10,
                },
                InputNumber: {
                  paddingBlock: 10,
                },
                Select: {
                  controlHeight: 44,
                  optionHeight: 40,
                },
              },
            }}
          >
            <CurrencyProvider
              initialCurrency={market?.currencyCode || settings.currency}
              initialMarketCode={market?.code || null}
            >
              <WishlistSync />
              {children}
            </CurrencyProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
