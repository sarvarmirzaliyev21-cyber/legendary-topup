"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

// Скрытый email владельца
const OWNER_EMAIL = "sarvarmirzaliyev21@gmail.com";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const inputPassword = password.trim();

    if (!inputPassword) {
      setError("Введите пароль");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loginPromise = supabase.auth.signInWithPassword({
        email: OWNER_EMAIL,
        password: inputPassword,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Ошибка подключения к Supabase. Проверьте ключи.")), 6000)
      );

      const res: any = await Promise.race([loginPromise, timeoutPromise]);

      if (res.error) {
        setError("Неверный пароль владельца");
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
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-7 backdrop-blur-xl shadow-2xl shadow-violet-950/20">
        
        {/* Красивый заголовок */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-white bg-clip-text text-transparent">
            Добро пожаловать
          </h1>
          <p className="text-xs font-semibold text-zinc-500">
            Панель управления владельца
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-xs text-red-400 font-bold animate-pulse">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Пароль
            </label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="••••••••"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3.5 text-sm outline-none transition-all duration-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-600 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-900/30 transition-all duration-300 hover:opacity-90 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Авторизация..." : "Войти"}
          </button>
        </div>
      </div>
    </main>
  );
}