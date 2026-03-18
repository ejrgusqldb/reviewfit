import Link from "next/link";

const FEATURES = [
  {
    icon: "⭐",
    title: "별점별 맞춤 답변",
    desc: "5점 감사 인사부터 1점 사과 답변까지, 별점에 맞게 AI가 자동으로 톤을 조절해요.",
  },
  {
    icon: "🎨",
    title: "가게 톤 커스터마이징",
    desc: "친근하게, 정중하게, 사과형 중 우리 가게 분위기에 맞는 말투를 선택하세요.",
  },
  {
    icon: "⚡",
    title: "30초 만에 답변 완성",
    desc: "리뷰 내용을 붙여넣기만 하면 AI가 즉시 답변을 생성해요. 직접 수정도 가능해요.",
  },
];

const PLANS = [
  {
    name: "무료",
    price: "0원",
    features: ["월 20개 답변", "1개 플랫폼"],
    cta: "무료로 시작",
    href: "/register",
    highlight: false,
  },
  {
    name: "스탠다드",
    price: "9,900원",
    features: ["무제한 답변", "2개 플랫폼", "AI 자동 답변"],
    cta: "14일 무료 체험",
    href: "/register",
    highlight: true,
  },
  {
    name: "프로",
    price: "19,900원",
    features: ["무제한 답변", "3개 플랫폼", "AI 자동 답변", "SNS 자동 포스팅"],
    cta: "시작하기",
    href: "/register",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 네비게이션 */}
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <span className="text-xl font-bold">ReviewFit</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-800">
            로그인
          </Link>
          <Link
            href="/register"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            무료로 시작
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-block bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full mb-6">
          AI 리뷰 답변 자동화
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          리뷰 답변,<br />
          이제 AI한테 맡기세요
        </h1>
        <p className="text-lg text-gray-500 mb-10 leading-relaxed">
          네이버 플레이스, 배달앱 리뷰에 매일 답변하느라 지치셨나요?<br />
          ReviewFit이 별점과 내용을 분석해 딱 맞는 답변을 30초 만에 만들어드립니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            무료로 시작하기
          </Link>
          <Link
            href="/login"
            className="border border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            로그인
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">신용카드 불필요 · 무료 플랜 영구 제공</p>
      </section>

      {/* Problem */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-12">
            혹시 이런 고민 하고 계신가요?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: "😓", text: "리뷰 답변 안 달면\n이미지 손해인 거 알면서도\n매일 하기 너무 귀찮아요" },
              { emoji: "😰", text: "나쁜 리뷰에 어떻게\n답변해야 할지\n매번 막막해요" },
              { emoji: "🕐", text: "바쁜 영업 중에\n리뷰 하나하나 읽고\n답변할 시간이 없어요" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-4xl mb-4">{item.emoji}</div>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-gray-800">ReviewFit이 해결해드립니다</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="text-center">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-12">사용 방법</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "리뷰 입력", desc: "네이버 플레이스에서 리뷰를 복사해 붙여넣기 하세요" },
              { step: "02", title: "AI 답변 생성", desc: "버튼 하나로 별점과 내용에 맞는 답변이 생성돼요" },
              { step: "03", title: "답변 저장", desc: "수정하거나 그대로 저장 후 플레이스에 등록하세요" },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">합리적인 가격</h2>
            <p className="text-gray-500 text-sm">언제든지 취소 가능 · 숨겨진 요금 없음</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl p-6 flex flex-col ${
                  plan.highlight ? "ring-2 ring-blue-500 shadow-lg" : "shadow-sm"
                }`}
              >
                {plan.highlight && (
                  <span className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full w-fit mb-3">
                    가장 인기
                  </span>
                )}
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <div className="mt-2 mb-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.price !== "0원" && <span className="text-gray-400 text-sm"> / 월</span>}
                </div>
                <ul className="flex flex-col gap-2 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="text-blue-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`text-center py-2.5 rounded-lg text-sm font-medium transition ${
                    plan.highlight
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-20 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-4">
            지금 바로 시작해보세요
          </h2>
          <p className="text-blue-100 mb-8">
            무료 플랜으로 시작해서 효과를 직접 확인해보세요
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
          >
            무료로 시작하기
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-gray-400">
        <p>© 2025 ReviewFit. All rights reserved.</p>
      </footer>
    </div>
  );
}
