"use client";

import React from "react";
import PaymentMethods from "./payment-methods";
import PaymentGateways from "./PaymentGateways";

export default function PaymentSettings() {
  return (
    <div className="space-y-8">
      <PaymentMethods />
      <PaymentGateways />
    </div>
  );
}
