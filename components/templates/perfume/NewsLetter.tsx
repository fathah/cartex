"use client";

import React, { useActionState } from "react";
import { subscribeToNewsletter } from "@/actions/newsletter";
import { Spin } from "antd";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function NewsLetter() {
  const [state, formAction, isPending] = useActionState(
    subscribeToNewsletter,
    null,
  );

  return (
    <section className="relative h-96">
      <img
        src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=2000"
        className="w-full h-full object-cover"
        alt="Newsletter Background"
      />
      <div className="absolute inset-0 bg-black/20 flex items-center justify-center p-4">
        <div className="bg-[#FDF8F5] p-6 md:p-12 max-w-2xl w-full text-center shadow-2xl mx-4">
          <h2 className="text-3xl font-serif mb-4 text-[#4A3B32]">
            Subscribe Now
          </h2>
          <p className="text-[#6D5D52] mb-8 text-sm">
            Refresh Your Senses With Exclusive Fragrances, Product Launches, And
            Special Offers Delivered To Your Inbox.
          </p>

          <form action={formAction} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                name="email"
                required
                disabled={isPending || state?.success}
                placeholder="Your email address"
                className="flex-1 border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#6F4E37] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              />
              <button
                type="submit"
                disabled={isPending || state?.success}
                className="bg-[#4A3B32] text-white px-6 py-3 text-xs uppercase hover:bg-[#2d241e] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors min-w-[120px] flex items-center justify-center"
              >
                {isPending ? (
                  <Spin size="small" />
                ) : state?.success ? (
                  "Subscribed"
                ) : (
                  "Submit"
                )}
              </button>
            </div>

            {/* Status Messages */}
            {state?.error && (
              <div className="mt-4 flex items-center justify-center gap-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                <span>{state.error}</span>
              </div>
            )}

            {state?.success && (
              <div className="mt-4 flex items-center justify-center gap-2 text-green-700 text-sm font-medium">
                <CheckCircle2 size={16} />
                <span>{state.message}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
