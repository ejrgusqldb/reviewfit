"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function FailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "결제가 취소되었습니다";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-5xl mb-2">😢</div>
      <h1 className="text-xl font-bold text-gray-800">결제 실패</h1>
      <p className="text-gray-500 text-sm">{message}</p>
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => router.push("/pricing")}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          다시 시도
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50"
        >
          대시보드로
        </button>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense>
      <FailContent />
    </Suspense>
  );
}
