"use client";
import { useCurrency } from "@/components/providers/currency-provider";
const Currency = ({
  value,
  className = "",
  currencyOnly,
}: {
  value: number | string;
  className?: string;
  currencyOnly?: boolean;
}) => {
  const { formatPrice, currency } = useCurrency();

  if (currencyOnly) {
    return <span className={className}>{currency}</span>;
  }
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) return null;

  return <span className={className}>{formatPrice(numValue)}</span>;
};

export default Currency;
