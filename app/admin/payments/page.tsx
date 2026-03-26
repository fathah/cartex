import { CreditCard, ShieldCheck, WalletCards } from "lucide-react";
import PaymentSettings from "../settings/Payment/payment-settings";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-700">
              <CreditCard size={14} />
              Payments Workspace
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900">
              Manage checkout methods and gateway connections in one place
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Configure customer-facing payment choices, connect live or test
              gateways, and keep payment operations separate from general store
              settings.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <WalletCards size={14} />
                Checkout Ready
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Keep customer choice simple with COD and Online Payment.
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <ShieldCheck size={14} />
                Gateway Ready
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Connect secure gateway configurations without cluttering settings.
              </div>
            </div>
          </div>
        </div>
      </section>

      <PaymentSettings />
    </div>
  );
}
