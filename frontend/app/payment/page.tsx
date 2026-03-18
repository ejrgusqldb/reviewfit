"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";

const PLAN_INFO: Record<string, { name: string; amount: number }> = {
  standard: { name: "스탠다드 플랜", amount: 9900 },
  pro: { name: "프로 플랜", amount: 19900 },
};

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get("plan") || "standard";
  const planInfo = PLAN_INFO[plan];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    if (!planInfo) return;
    setLoading(true);
    setError("");

    try {
      const toss = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!);
      const payment = toss.payment({ customerKey: ANONYMOUS });
      const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: planInfo.amount },
        orderId,
        orderName: planInfo.name,
        successUrl: `${window.location.origin}/payment/success?plan=${plan}`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (e: any) {
      if (e.code !== "USER_CANCEL") {
        setError("결제 요청 중 오류가 발생했습니다: " + e.message);
      }
      setLoading(false);
    }
  }

  if (!planInfo) {
    router.push("/pricing");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <button onClick={() => router.back()} className="text-gray-400 text-sm mb-6 hover:text-gray-600">
          ← 뒤로
        </button>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <p className="text-sm text-gray-400 mb-1">{planInfo.name}</p>
          <p className="text-3xl font-bold">
            {planInfo.amount.toLocaleString()}원
            <span className="text-sm text-gray-400 font-normal"> / 월</span>
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {plan === "standard" ? (
              <>
                <li className="text-sm text-gray-600">✓ 무제한 답변</li>
                <li className="text-sm text-gray-600">✓ 2개 플랫폼</li>
                <li className="text-sm text-gray-600">✓ AI 자동 답변</li>
              </>
            ) : (
              <>
                <li className="text-sm text-gray-600">✓ 무제한 답변</li>
                <li className="text-sm text-gray-600">✓ 3개 플랫폼</li>
                <li className="text-sm text-gray-600">✓ AI 자동 답변</li>
                <li className="text-sm text-gray-600">✓ SNS 자동 포스팅</li>
              </>
            )}
          </ul>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "처리 중..." : `${planInfo.amount.toLocaleString()}원 결제하기`}
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">토스페이먼츠로 안전하게 결제됩니다</p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentContent />
    </Suspense>
  );
}
