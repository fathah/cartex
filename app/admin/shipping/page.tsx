import { Truck, MapPinned, PackageCheck } from "lucide-react";
import ShippingSettingsWrapper from "./_components/ShippingSettingsWrapper";

export default function ShippingPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/50 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-blue-700">
              <Truck size={14} />
              Shipping Workspace
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900">
              Configure shipping without digging through settings
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Set up delivery profiles, country zones, customer-facing methods,
              and rate rules in one place. This page is designed for day-to-day
              shipping management and future carrier integrations.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <PackageCheck size={14} />
                Catalog Ready
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Profiles connect products to shipping behavior cleanly.
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <MapPinned size={14} />
                Market Ready
              </div>
              <div className="mt-1 text-sm text-gray-600">
                GCC and India flows can start fast, then scale into APIs later.
              </div>
            </div>
          </div>
        </div>
      </section>

      <ShippingSettingsWrapper />
    </div>
  );
}
