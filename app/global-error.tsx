"use client";

import { AlertCircle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased overflow-x-hidden">
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 text-center bg-background">
          <div className="bg-red-50 p-6 rounded-full mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>

          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Critical System Error
          </h1>

          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Something went fundamentally wrong with the application. We've been
            notified and are looking into it.
          </p>

          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-full font-semibold hover:opacity-80 transition-all active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            Restart Application
          </button>

          {error.digest && (
            <p className="mt-12 text-xs text-gray-400 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
