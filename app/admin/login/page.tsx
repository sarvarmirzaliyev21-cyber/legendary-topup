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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setLoading(false);
      setError("Неверный email или пароль");
      return;
    }

    // Клиентская проверка для быстрого фидбека.
    // Настоящая защита — в middleware.ts на сервере.
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (adminEmail && data.user.email !== adminEmail) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("Этот аккаунт не имеет доступа к админке");
      return;
    }

    router.push("/admin/support");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur">
        <h1 className="text-xl font-bold">Вход в админку</h1>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 outline-none transition-colors duration-200 focus:border-violet-500"
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
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 outline-none transition-colors duration-200 focus:border-violet-500"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 py-3 font-bold transition-all duration-200 hover:shadow-lg hover:shadow-violet-900/40 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </div>
      </div>
    </main>
  );
}
