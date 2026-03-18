"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";

type Review = {
  id: number;
  reviewer_name: string | null;
  rating: number;
  content: string | null;
  is_replied: boolean;
  generated_reply: string | null;
  final_reply: string | null;
};

export default function ReviewsPage() {
  const params = useParams();
  const storeId = Number(params.storeId);
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
      return;
    }
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      const data = await api.reviews.list(storeId);
      setReviews(data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">불러오는 중...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
          ← 뒤로
        </button>
        <h1 className="text-xl font-bold">리뷰 관리</h1>
      </div>

      {/* 리뷰 직접 입력 버튼 */}
      <AddReviewSection storeId={storeId} onAdded={loadReviews} />

      <div className="mt-6 flex flex-col gap-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm">
            <p>아직 리뷰가 없어요</p>
            <p className="text-sm mt-1">위에서 리뷰를 붙여넣기 해보세요</p>
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} storeId={storeId} onUpdated={loadReviews} />
          ))
        )}
      </div>
    </div>
  );
}

// 리뷰 직접 입력 섹션
function AddReviewSection({ storeId, onAdded }: { storeId: number; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewer, setReviewer] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // 리뷰를 직접 DB에 넣는 API (임시 - 추후 크롤러로 대체)
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:8000/api/reviews/${storeId}/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, reviewer_name: reviewer, content }),
      });
      setOpen(false);
      setContent("");
      setReviewer("");
      onAdded();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 text-left text-sm font-medium text-blue-600 hover:bg-blue-50 flex items-center justify-between"
      >
        <span>+ 리뷰 직접 입력하기</span>
        <span className="text-gray-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 flex flex-col gap-3 border-t border-gray-100">
          <div className="flex items-center gap-3 mt-3">
            <label className="text-sm font-medium text-gray-700 w-16">별점</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className={`text-xl ${s <= rating ? "text-yellow-400" : "text-gray-200"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">작성자 (선택)</label>
            <input
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="네이버 닉네임"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">리뷰 내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="리뷰 내용을 여기에 붙여넣기 하세요"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "저장 중..." : "리뷰 저장"}
          </button>
        </form>
      )}
    </div>
  );
}

// 리뷰 카드
function ReviewCard({ review, storeId, onUpdated }: { review: Review; storeId: number; onUpdated: () => void }) {
  const [reply, setReply] = useState(review.generated_reply || review.final_reply || "");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const data = await api.reviews.generate(storeId, review.id);
      setReply(data.generated_reply);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.reviews.reply(storeId, review.id, reply);
      onUpdated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm ${review.is_replied ? "opacity-70" : ""}`}>
      {/* 리뷰 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{review.reviewer_name || "익명"}</span>
          <span className="text-yellow-400 text-sm">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
        </div>
        {review.is_replied && (
          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">답변 완료</span>
        )}
      </div>

      {/* 리뷰 내용 */}
      <p className="text-sm text-gray-700 mb-4">{review.content || "(내용 없음)"}</p>

      {/* 답변 영역 */}
      {!review.is_replied && (
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">AI 답변</span>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 disabled:opacity-50"
            >
              {generating ? "생성 중..." : "✨ AI 답변 생성"}
            </button>
          </div>

          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-700"
            rows={3}
            placeholder="AI 답변을 생성하거나 직접 입력하세요"
          />

          <button
            onClick={handleSave}
            disabled={saving || !reply}
            className="mt-2 w-full bg-gray-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-900 disabled:opacity-40"
          >
            {saving ? "저장 중..." : "답변 저장"}
          </button>
        </div>
      )}

      {/* 이미 답변한 경우 */}
      {review.is_replied && review.final_reply && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-400 mb-1">등록된 답변</p>
          <p className="text-sm text-gray-600">{review.final_reply}</p>
        </div>
      )}
    </div>
  );
}
