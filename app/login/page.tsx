"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

const ADMIN_EMAIL = "sarvarmirzaliyev21@gmail.com";

type Mode = "signin" | "signup" | "verify";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function translateError(msg: string) {
    if (msg.includes("Invalid login credentials")) {
      return "Неверный email или пароль";
    }
    if (msg.includes("already registered")) {
      return "Этот email уже зарегистрирован";
    }
    if (msg.includes("Password should be at least")) {
      return "Пароль должен быть не короче 6 символов";
    }
    if (msg.includes("Token has expired") || msg.includes("invalid")) {
      return "Неверный или устаревший код";
    }
    return msg;
  }

  function redirectAfterLogin(userEmail: string | null | undefined) {
    if (userEmail === ADMIN_EMAIL) {
      router.push("/admin/login");
    } else {
      router.push("/");
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      redirectAfterLogin(data.user?.email);
    } catch (err) {
      setError(translateError(err instanceof Error ? err.message : ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      // Если у пользователя уже есть подтверждённые "личности" —
      // значит email уже был зарегистрирован раньше
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError("Аккаунт уже зарегистрирован. Попробуйте войти.");
        setMode("signin");
        return;
      }

      setMessage("Мы отправили код на почту. Введите его ниже.");
      setMode("verify");
    } catch (err) {
      setError(translateError(err instanceof Error ? err.message : ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup",
      });
      if (error) throw error;
      redirectAfterLogin(data.user?.email);
    } catch (err) {
      setError(translateError(err instanceof Error ? err.message : ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="text-2xl font-bold">
          {mode === "signin" && "Вход"}
          {mode === "signup" && "Регистрация"}
          {mode === "verify" && "Подтверждение почты"}
        </h1>

        {/* Вход */}
        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 outline-none focus:border-violet-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Пароль</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 outline-none focus:border-violet-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-950/50 p-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 py-3 font-bold transition hover:bg-violet-500 disabled:opacity-50"
            >
              {loading ? "Подождите..." : "Войти"}
            </button>
          </form>
        )}

        {/* Регистрация */}
        {mode === "signup" && (
          <form onSubmit={handleSignUp} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 outline-none focus:border-violet-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Пароль</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 outline-none focus:border-violet-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-950/50 p-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 py-3 font-bold transition hover:bg-violet-500 disabled:opacity-50"
            >
              {loading ? "Подождите..." : "Зарегистрироваться"}
            </button>
          </form>
        )}

        {/* Ввод кода подтверждения */}
        {mode === "verify" && (
          <form onSubmit={handleVerify} className="mt-6 space-y-4">
            <p className="text-sm text-zinc-400">
              Код отправлен на <span className="text-white">{email}</span>
            </p>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Код из письма
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-center text-xl tracking-widest outline-none focus:border-violet-500"
                placeholder="Введите код полностью"
              />
            </div>

            {message && (
              <p className="rounded-lg bg-emerald-950/50 p-3 text-sm text-emerald-400">
                {message}
              </p>
            )}

            {error && (
              <p className="rounded-lg bg-red-950/50 p-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 py-3 font-bold transition hover:bg-violet-500 disabled:opacity-50"
            >
              {loading ? "Проверяем..." : "Подтвердить"}
            </button>
          </form>
        )}

        {mode !== "verify" && (
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setMessage(null);
            }}
            className="mt-4 w-full text-center text-sm text-zinc-400 hover:text-violet-400"
          >
            {mode === "signin"
              ? "Нет аккаунта? Зарегистрироваться"
              : "Уже есть аккаунт? Войти"}
          </button>
        )}
      </div>
    </main>
  );
}
