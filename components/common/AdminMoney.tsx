"use client";

type AdminMoneyProps = {
  value: number | string;
  className?: string;
  currencyCode?: string | null;
  codeOnly?: boolean;
};

function formatAdminAmount(value: number) {
  return value.toFixed(2).replace(/\.00$/, "");
}

export default function AdminMoney({
  value,
  className = "",
  currencyCode,
  codeOnly = false,
}: AdminMoneyProps) {
  if (codeOnly) {
    return <span className={className}>{currencyCode || "Amount"}</span>;
  }

  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(numValue)) return null;

  const formatted = formatAdminAmount(numValue);
  return (
    <span className={className}>
      {currencyCode ? `${currencyCode} ${formatted}` : formatted}
    </span>
  );
}
