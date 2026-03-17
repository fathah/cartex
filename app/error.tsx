"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-full mb-6">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>

      <h1 className="text-3xl font-bold mb-2 ">Something went wrong</h1>

      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We encountered an unexpected error. Don't worry, it's not your fault.
        You can try refreshing the page or head back to the homepage.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-2.5 border border-border rounded-full font-medium hover:bg-accent transition-all active:scale-95"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
      </div>

      {error.digest && (
        <p className="mt-8 text-xs text-muted-foreground/50 font-mono">
          Error ID: {error.digest}
        </p>
      )}
      <div className="fixed w-full bottom-4">
        <p className="text-center text-gray-400">Ziqx Cartex</p>
      </div>
    </div>
  );
}
