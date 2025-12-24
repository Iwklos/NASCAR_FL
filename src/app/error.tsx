"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-red-600">
            Application Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Something went wrong. This is usually caused by missing environment
            variables or database connection issues.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-mono text-sm text-red-800 break-all">
              {error.message}
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">Common fixes:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Ensure DATABASE_URL is set in environment variables</li>
              <li>Ensure AUTH_SECRET is set (generate with: openssl rand -base64 32)</li>
              <li>Set AUTH_TRUST_HOST=true for Vercel deployments</li>
              <li>Verify database is accessible from Vercel</li>
              <li>Check Vercel runtime logs for more details</li>
            </ul>
          </div>

          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

