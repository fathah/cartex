"use client";

import React from "react";
import PaymentMethods from "./payment-methods";
import PaymentGateways from "./PaymentGateways";

export default function PaymentSettings() {
  return (
    <div className="space-y-8">
      <PaymentMethods />

      {/* Payment Gateways hidden for now as per requirement */}
      {/* <PaymentGateways /> */}
    </div>
  );
}
