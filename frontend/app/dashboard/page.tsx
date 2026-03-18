"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

type Store = {
  id: number;
  name: string;
  platform: string;
  tone: string;
  auto_reply: boolean;
};

const PLATFORM_LABEL: Record<string, string> = {
  naver: "네이버 플레이스",
  baemin: "배달의민족",
  kakao: "카카오맵",
};

const TONE_LABEL: Record<string, string> = {
  friendly: "친근하게",
  formal: "정중하게",
  apologetic: "사과형",
};

export default function DashboardPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const router = useRouter();

  // useEffect = 페이지가 처음 열릴 때 실행 (Python의 startup 이벤트와 비슷)
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
      return;
    }
    loadStores();
  }, []); // [] = 한 번만 실행

  async function loadStores() {
    try {
      const data = await api.stores.list();
      setStores(data);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    api.auth.logout();
    router.push("/login");
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">불러오는 중...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">ReviewFit</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/pricing")}
            className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100"
          >
            플랜 업그레이드
          </button>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
            로그아웃
          </button>
        </div>
      </div>

      {/* 가게 목록 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">내 가게</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + 가게 추가
        </button>
      </div>

      {stores.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm">
          <p className="text-lg mb-2">등록된 가게가 없어요</p>
          <p className="text-sm">위의 '가게 추가' 버튼으로 시작하세요</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {stores.map((store) => (
            <Link key={store.id} href={`/dashboard/reviews/${store.id}`}>
              <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{store.name}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {PLATFORM_LABEL[store.platform]} · 톤: {TONE_LABEL[store.tone]}
                    </p>
                  </div>
                  <span className="text-blue-600 text-sm">리뷰 보기 →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 가게 추가 모달 */}
      {showAddForm && <AddStoreModal onClose={() => setShowAddForm(false)} onAdded={loadStores} />}
    </div>
  );
}

function AddStoreModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("naver");
  const [platformStoreId, setPlatformStoreId] = useState("");
  const [tone, setTone] = useState("formal");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.stores.create({ name, platform, platform_store_id: platformStoreId, tone });
      onAdded();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="font-semibold text-lg mb-4">가게 추가</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700">가게 이름</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예) 홍길동 카페"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">플랫폼</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="naver">네이버 플레이스</option>
              <option value="baemin">배달의민족</option>
              <option value="kakao">카카오맵</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">플레이스 ID</label>
            <input
              value={platformStoreId}
              onChange={(e) => setPlatformStoreId(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="네이버 지도 URL의 숫자"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">답변 톤</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="formal">정중하게</option>
              <option value="friendly">친근하게</option>
              <option value="apologetic">사과형</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "추가 중..." : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
