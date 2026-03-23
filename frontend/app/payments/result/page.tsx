"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

const getResultMeta = (status: string | null) => {
  if (status === "success") {
    return {
      title: "Payment Successful",
      description: "Your transaction has been completed successfully.",
      icon: <CheckCircle size={56} className="text-green-600" />,
      colorClass: "text-green-700",
    };
  }

  if (status === "cancelled") {
    return {
      title: "Payment Cancelled",
      description: "The transaction was cancelled.",
      icon: <AlertCircle size={56} className="text-yellow-600" />,
      colorClass: "text-yellow-700",
    };
  }

  return {
    title: "Payment Failed",
    description: "The transaction did not complete successfully.",
    icon: <XCircle size={56} className="text-red-600" />,
    colorClass: "text-red-700",
  };
};

export default function PaymentResultPage() {
  const searchParams = useSearchParams();

  const result = useMemo(() => {
    const status = searchParams.get("status");
    const txnRef = searchParams.get("txnRef");
    const responseCode = searchParams.get("responseCode");
    const message = searchParams.get("message");

    return {
      status,
      txnRef,
      responseCode,
      message,
      meta: getResultMeta(status),
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-card shadow-soft-md max-w-xl w-full p-8 text-center space-y-6">
        <div className="flex justify-center">{result.meta.icon}</div>

        <div>
          <h1 className={`text-2xl font-bold ${result.meta.colorClass}`}>
            {result.meta.title}
          </h1>
          <p className="text-slate-600 mt-2">
            {result.message || result.meta.description}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 text-left space-y-2">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Transaction Ref:</span>{" "}
            {result.txnRef || "-"}
          </p>
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Response Code:</span>{" "}
            {result.responseCode || "-"}
          </p>
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Status:</span>{" "}
            {result.status || "failed"}
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/payments"
            className="px-4 py-2 bg-primary text-white rounded-btn hover:bg-blue-600 transition"
          >
            Payment History
          </Link>
          <Link
            href="/bookings"
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-btn hover:bg-slate-50 transition"
          >
            Back to Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
