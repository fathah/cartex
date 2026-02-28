import { getCheckoutData } from "@/actions/checkout";
import { getSettings } from "@/actions/settings";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CheckoutPageClient from "./CheckoutPageClient";
import { getCurrentUser } from "@/actions/user";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const CheckoutPage = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?backto=checkout");
  }
  const [{ customer, addresses }, settings] = await Promise.all([
    getCheckoutData(),
    getSettings(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <CheckoutPageClient
        customer={customer}
        addresses={addresses}
        taxRate={settings.taxRate ?? 5}
        taxMode={settings.taxMode ?? "EXCLUSIVE"}
      />
    </div>
  );
};

export default CheckoutPage;
