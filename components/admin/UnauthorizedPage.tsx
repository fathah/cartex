"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const UnauthorizedPage = () => {
  return (
    <section className="h-screen w-full flex items-center justify-center bg-[#F9FBFC] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full bg-white border border-zinc-200/60 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-zinc-200/40"
      >
        <div className="mx-auto w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-8">
          <Lock className="w-10 h-10 text-red-500" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-900 mb-4 tracking-tight">
          Unauthorized Access
        </h1>
        
        <p className="text-zinc-500 mb-10 leading-relaxed text-balance">
          You don't have the necessary permissions to access this area. 
          Please sign in with an administrative account to proceed.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/auth"
            className="w-full bg-zinc-900 text-white py-4 px-6 rounded-2xl font-medium hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-lg shadow-zinc-900/10"
          >
            Go to Login
          </Link>
          
          <Link
            href="/"
            className="w-full text-zinc-500 py-3 px-6 rounded-2xl font-medium hover:text-zinc-900 hover:bg-zinc-50 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default UnauthorizedPage;
