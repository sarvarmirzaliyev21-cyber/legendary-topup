"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // Таймаут на 6 секунд, чтобы кнопка не вешалась намертво
      const loginPromise = supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Таймаут подключения к Supabase. Проверьте URL ключи")), 6000)
      );

      const res: any = await Promise.race([loginPromise, timeoutPromise]);

      if (res.error) {
        setError("Ошибка: " + res.error.message);
        setLoading(false);
        return;
      }

      if (res.data?.user) {
        router.push("/admin/orders");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "Неизвестная ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur">
        <h1 className="text-xl font-bold text-center">Вход в админку</h1>

        <div className="mt-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-xs text-red-400 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-300">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 outline-none focus:border-violet-500"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 py-3 font-bold transition-all hover:shadow-lg hover:shadow-violet-900/40 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Загрузка..." : "Войти"}
          </button>
        </div>
      </div>
    </main>
  );
}
