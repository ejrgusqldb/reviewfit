"use client";

import { useRouter } from "next/navigation";

const PLANS = [
  {
    id: "free",
    name: "무료",
    price: 0,
    features: ["월 20개 답변", "1개 플랫폼"],
    cta: "현재 플랜",
    disabled: true,
  },
  {
    id: "standard",
    name: "스탠다드",
    price: 9900,
    features: ["무제한 답변", "2개 플랫폼", "AI 자동 답변"],
    cta: "시작하기",
    disabled: false,
    highlight: true,
  },
  {
    id: "pro",
    name: "프로",
    price: 19900,
    features: ["무제한 답변", "3개 플랫폼", "AI 자동 답변", "SNS 자동 포스팅"],
    cta: "시작하기",
    disabled: false,
  },
];

export default function PricingPage() {
  const router = useRouter();

  function handleSelect(planId: string) {
    // 결제 페이지로 이동 (플랜 정보 URL에 담아서 전달)
    router.push(`/payment?plan=${planId}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-2">플랜 선택</h1>
      <p className="text-gray-500 text-center mb-12">지금 시작하고 리뷰 답변을 자동화하세요</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl p-6 shadow-sm flex flex-col ${
              plan.highlight ? "ring-2 ring-blue-500" : ""
            }`}
          >
            {plan.highlight && (
              <span className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full w-fit mb-3">추천</span>
            )}
            <h2 className="text-xl font-bold">{plan.name}</h2>
            <div className="mt-2 mb-6">
              {plan.price === 0 ? (
                <span className="text-3xl font-bold">무료</span>
              ) : (
                <>
                  <span className="text-3xl font-bold">{plan.price.toLocaleString()}원</span>
                  <span className="text-gray-400 text-sm"> / 월</span>
                </>
              )}
            </div>

            <ul className="flex flex-col gap-2 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-blue-500">✓</span> {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => !plan.disabled && handleSelect(plan.id)}
              disabled={plan.disabled}
              className={`w-full py-2 rounded-lg text-sm font-medium transition ${
                plan.disabled
                  ? "bg-gray-100 text-gray-400 cursor-default"
                  : plan.highlight
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-800 text-white hover:bg-gray-900"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/dashboard")}
        className="mt-8 text-sm text-gray-400 hover:text-gray-600"
      >
        ← 대시보드로 돌아가기
      </button>
    </div>
  );
}
