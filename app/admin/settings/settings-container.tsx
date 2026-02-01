"use client";

import React from 'react';
import { Tabs } from 'antd';
import { Store, CreditCard, Truck } from 'lucide-react';
import SiteSettings from './SiteSettings/SiteSettings';
import ShippingSettings from './shipping-settings';
import PaymentSettings from './Payment/payment-settings';

interface SettingsContainerProps {
  initialSettings: any;
}

export default function SettingsContainer({ initialSettings }: SettingsContainerProps) {
  const items = [
    {
      key: 'site',
      label: (
        <span className="flex items-center gap-2">
          <Store size={16} />
          Site Settings
        </span>
      ),
      children: <SiteSettings initialSettings={initialSettings} />,
    },
    {
      key: 'payment',
      label: (
        <span className="flex items-center gap-2">
          <CreditCard size={16} />
          Payment Methods
        </span>
      ),
      children: (
        <PaymentSettings/>
      ),
    },
    {
      key: 'shipping',
      label: (
        <span className="flex items-center gap-2">
          <Truck size={16} />
          Shipping
        </span>
      ),
      children: (
        <ShippingSettings />
      ),
    },
  ];

  return (
    <div>
   
        <Tabs 
            tabPlacement="start" 
            items={items} 
            defaultActiveKey="site"
            className="min-h-[400px]" 
        />
  
    </div>
  );
}
