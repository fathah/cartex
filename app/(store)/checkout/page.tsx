import { getCheckoutData } from "@/actions/checkout";
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
  const { customer, addresses } = await getCheckoutData();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header / Back Link */}
      <div className="mb-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Cart</span>
        </Link>
      </div>

      <CheckoutPageClient customer={customer} addresses={addresses} />
    </div>
  );
};

export default CheckoutPage;
