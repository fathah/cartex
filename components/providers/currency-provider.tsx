"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type CurrencyCode = 'USD' | 'AED' | 'EUR' | 'GBP' | 'INR';

interface CurrencyContextType {
  currency: string;
  symbol: string;
  marketCode?: string | null;
  formatPrice: (amount: number) => string;
  setCurrency: (currency: string) => void;
  setMarketCode: (marketCode: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const SYMBOLS: Record<string, string> = {
  USD: '$',
  AED: 'AED ',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  SAR: 'SAR ',
};

export function CurrencyProvider({ 
  children, 
  initialCurrency = 'USD',
  initialMarketCode = null,
}: { 
  children: React.ReactNode; 
  initialCurrency?: string;
  initialMarketCode?: string | null;
}) {
  const [currency, setCurrencyState] = useState(initialCurrency);
  const [marketCode, setMarketCodeState] = useState<string | null>(initialMarketCode);

  // Sync with prop if it changes (e.g. from server revalidation)
  useEffect(() => {
    setCurrencyState(initialCurrency);
    setMarketCodeState(initialMarketCode);
  }, [initialCurrency, initialMarketCode]);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    // basic cookie setting for simple client-side persistence if needed
    document.cookie = `currency=${newCurrency}; path=/; max-age=31536000`;
  };

  const setMarketCode = (newMarketCode: string) => {
    setMarketCodeState(newMarketCode);
    document.cookie = `market=${newMarketCode}; path=/; max-age=31536000`;
  };

  const formatPrice = (amount: number) => {
    const symbol = SYMBOLS[currency] || currency;
    const formattedAmount = amount.toFixed(2).replace(/\.00$/, "");
    
    if (currency === 'AED' || currency === 'SAR') {
        return `${symbol} ${formattedAmount}`;
    }
    return `${symbol}${formattedAmount}`;
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      symbol: SYMBOLS[currency] || currency, 
      marketCode,
      formatPrice,
      setCurrency,
      setMarketCode,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
