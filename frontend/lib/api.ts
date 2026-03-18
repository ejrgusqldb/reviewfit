// 백엔드 API 호출 유틸
// Python의 httpx.get() 과 동일한 역할

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "오류가 발생했습니다" }));
    throw new Error(error.detail || "오류가 발생했습니다");
  }

  return res.json();
}

// 인증
export const api = {
  auth: {
    register: (email: string, password: string, name: string) =>
      request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      }),

    login: async (email: string, password: string) => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      });
      if (!res.ok) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다");
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      return data;
    },

    logout: () => localStorage.removeItem("token"),
  },

  stores: {
    list: () => request("/api/stores"),
    create: (body: { name: string; platform: string; platform_store_id: string; tone: string }) =>
      request("/api/stores", { method: "POST", body: JSON.stringify(body) }),
    update: (id: number, body: { tone?: string; auto_reply?: boolean }) =>
      request(`/api/stores/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  },

  reviews: {
    list: (storeId: number) => request(`/api/reviews/${storeId}`),
    generate: (storeId: number, reviewId: number) =>
      request(`/api/reviews/${storeId}/reviews/${reviewId}/generate`, { method: "POST" }),
    reply: (storeId: number, reviewId: number, reply: string) =>
      request(`/api/reviews/${storeId}/reviews/${reviewId}/reply`, {
        method: "POST",
        body: JSON.stringify({ reply }),
      }),
  },
};
