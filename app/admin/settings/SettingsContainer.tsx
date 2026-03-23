"use client";

import { useState, useEffect } from "react";
import type { Settings } from "@prisma/client";
import { Tabs } from "antd";
import {
  Store,
  CreditCard,
  Truck,
  User,
  WalletCards,
  Percent,
  FileDown,
  Globe,
  Bot,
} from "lucide-react";
import SiteSettings from "./SiteSettings/SiteSettings";
import ShippingSettings from "./Shipping/ShippingSettings";
import PaymentSettings from "./Payment/payment-settings";
import UserAccess from "./UserAccess/UserAccess";
import PaymentGateways from "./Payment/PaymentGateways";
import TaxCurrencySettings from "./TaxCurrency/TaxCurrencySettings";
import DataExport from "./DataExport/page";
import ShopMarket from "./Market/Market";
import AIAutomationSettings from "./AIAutomation/AIAutomationSettings";

interface SettingsContainerProps {
  initialSettings: Settings;
  aiAutomationSettings: {
    openrouterApiKey: string | null;
    openrouterModel: string | null;
  };
}

export default function SettingsContainer({
  initialSettings,
  aiAutomationSettings,
}: SettingsContainerProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const items = [
    {
      key: "site",
      label: (
        <span className="flex items-center gap-2">
          <Store size={16} />
          Site Settings
        </span>
      ),
      children: <SiteSettings initialSettings={initialSettings} />,
    },
    {
      key: "tax-currency",
      label: (
        <span className="flex items-center gap-2">
          <Percent size={16} />
          Tax & Currency
        </span>
      ),
      children: <TaxCurrencySettings initialSettings={initialSettings} />,
    },
    {
      key: "payment",
      label: (
        <span className="flex items-center gap-2">
          <CreditCard size={16} />
          Payment Methods
        </span>
      ),
      children: <PaymentSettings />,
    },
    {
      key: "payment-gateway",
      label: (
        <span className="flex items-center gap-2">
          <WalletCards size={16} />
          Payment Gateway
        </span>
      ),
      children: <PaymentGateways />,
    },
    {
      key: "shipping",
      label: (
        <span className="flex items-center gap-2">
          <Truck size={16} />
          Shipping
        </span>
      ),
      children: <ShippingSettings />,
    },
    {
      key: "user-access",
      label: (
        <span className="flex items-center gap-2">
          <User size={16} />
          User Access
        </span>
      ),
      children: <UserAccess />,
    },
    {
      key: "market-country",
      label: (
        <span className="flex items-center gap-2">
          <Globe size={16} />
          Market Country
        </span>
      ),
      children: <ShopMarket />,
    },
    {
      key: "ai-automation",
      label: (
        <span className="flex items-center gap-2">
          <Bot size={16} />
          AI & Automation
        </span>
      ),
      children: <AIAutomationSettings initialSettings={aiAutomationSettings} />,
    },
    {
      key: "data-export",
      label: (
        <span className="flex items-center gap-2">
          <FileDown size={16} /> Data Export
        </span>
      ),
      children: <DataExport />,
    },
  ];

  return (
    <div>
      <Tabs
        tabPlacement={isMobile ? "top" : "start"}
        items={items}
        defaultActiveKey="site"
        className="min-h-[400px]"
      />
    </div>
  );
}
