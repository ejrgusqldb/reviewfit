"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    const plan = searchParams.get("plan");

    if (!paymentKey || !orderId || !amount || !plan) {
      setStatus("error");
      setMessage("잘못된 접근입니다");
      return;
    }

    confirmPayment(paymentKey, orderId, Number(amount), plan);
  }, []);

  async function confirmPayment(paymentKey: string, orderId: string, amount: number, plan: string) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ payment_key: paymentKey, order_id: orderId, amount, plan }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "결제 승인 실패");
      }

      setStatus("success");
    } catch (e: any) {
      setStatus("error");
      setMessage(e.message);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">결제 확인 중...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-semibold">결제 실패</p>
        <p className="text-gray-500 text-sm">{message}</p>
        <button onClick={() => router.push("/pricing")} className="text-blue-600 text-sm hover:underline">
          다시 시도하기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-5xl mb-2">🎉</div>
      <h1 className="text-2xl font-bold">결제 완료!</h1>
      <p className="text-gray-500 text-sm">플랜이 업그레이드되었습니다</p>
      <button
        onClick={() => router.push("/dashboard")}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        대시보드로 이동
      </button>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
