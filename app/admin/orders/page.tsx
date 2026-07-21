"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

type Order = {
  id: string;
  created_at: string;
  game: string;
  product: string;
  price_usd: number;
  price_sum: number;
  receipt_url: string | null;
  player_info: string | null;
  status: string;
  code_requested?: boolean;
  verification_code?: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  ожидает_подтверждения: "Ожидает подтверждения",
  оплачено: "Оплата подтверждена",
  выполнено: "Выполнено",
  отклонено: "Отклонено",
};

const STATUS_COLORS: Record<string, string> = {
  ожидает_подтверждения: "bg-yellow-950/40 text-yellow-400 border-yellow-500/20",
  оплачено: "bg-blue-950/40 text-blue-400 border-blue-500/20",
  выполнено: "bg-emerald-950/40 text-emerald-400 border-emerald-500/20",
  отклонено: "bg-red-950/40 text-red-400 border-red-500/20",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parsePlayerInfo(raw: string | null) {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return { "Данные": raw };
  }
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [inputCodes, setInputCodes] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/orders");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    async function loadOrders() {
      if (!user) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setOrders(data as Order[]);
      setLoadingOrders(false);
    }

    if (user) {
      loadOrders();

      const channel = supabase
        .channel("user_orders_realtime")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "orders" },
          (payload) => {
            const updated = payload.new as Order;
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else if (!authLoading) {
      setLoadingOrders(false);
    }
  }, [user, authLoading]);

  async function submitCode(orderId: string) {
    const code = inputCodes[orderId]?.trim();
    if (!code) return;

    setSubmittingId(orderId);

    const { error } = await supabase
      .from("orders")
      .update({ verification_code: code })
      .eq("id", orderId);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, verification_code: code } : o))
      );
    }

    setSubmittingId(null);
  }

  if (authLoading || loadingOrders) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-violet-500" />
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 md:py-16 selection:bg-violet-500/30 relative z-10">
      
      <style>{`
        @keyframes orderIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-order-card {
          animation: orderIn 0.4s cubic-bezier(0.215, 0.61, 0.355, 1) both;
        }
      `}</style>

      <div className="mx-auto max-w-3xl">
        <div className="mb-5">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 transition-colors hover:text-zinc-300"
          >
            ← На главную
          </Link>
        </div>

        <div className="border-b border-zinc-900 pb-5">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-zinc-100">Мои заказы</h1>
          <p className="mt-1 text-xs text-zinc-500 font-medium">
            Всего покупок: <span className="text-zinc-400 font-bold">{orders.length}</span>
          </p>
        </div>

        <div className="mt-6 space-y-3.5">
          {orders.length === 0 && (
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md p-8 text-center max-w-md mx-auto space-y-3.5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-xl shadow-md">
                📦
              </div>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">У вас пока нет активных или завершённых заказов.</p>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2 text-xs font-black text-white shadow-md shadow-violet-950/30 transition-all duration-300 hover:from-violet-500 hover:scale-[1.02] active:scale-95"
              >
                Перейти в каталог
              </Link>
            </div>
          )}

          {orders.map((order, index) => {
            const playerInfo = parsePlayerInfo(order.player_info);

            return (
              <div
                key={order.id}
                className="animate-order-card rounded-2xl border border-zinc-900 bg-zinc-900/30 p-5 backdrop-blur-md transition-all duration-300 hover:border-zinc-800/80 hover:bg-zinc-900/50"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-zinc-500">
                      {formatDate(order.created_at)}
                    </p>
                    <h3 className="text-base font-black tracking-tight text-zinc-100 sm:text-lg">
                      {order.game} — <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{order.product}</span>
                    </h3>
                    <p className="text-sm font-extrabold text-violet-400 mt-0.5">
                      ${order.price_usd} ·{" "}
                      <span className="text-zinc-300">{order.price_sum.toLocaleString("ru-RU")} сум</span>
                    </p>
                  </div>

                  <span
                    className={`rounded-xl border px-2.5 py-1 text-[11px] font-bold tracking-wide transition-all ${
                      STATUS_COLORS[order.status] ?? "border-zinc-800 text-zinc-400 bg-zinc-900/40"
                    }`}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>

                {/* БЛОК ВВОДА КОДА */}
                {order.code_requested && (
                  <div className="mt-4 rounded-2xl border border-violet-500/40 bg-violet-600/10 p-4 space-y-3 shadow-[0_0_25px_rgba(124,58,237,0.15)]">
                    <div className="flex items-center gap-2 text-violet-300 font-black text-xs uppercase tracking-wider">
                      <span>🔐</span> Продавец запрашивает код подтверждения!
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                      Владелец сайта выполняет ваш заказ. Пожалуйста, проверьте ваши SMS или Почту и введите 6-значный код ниже:
                    </p>

                    {order.verification_code ? (
                      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center text-xs font-bold text-emerald-400">
                        ✓ Код ({order.verification_code}) отправлен продавцу! Ожидайте завершения.
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={8}
                          placeholder="Код (напр. 123456)"
                          value={inputCodes[order.id] ?? ""}
                          onChange={(e) => setInputCodes({ ...inputCodes, [order.id]: e.target.value })}
                          className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm font-mono font-bold tracking-widest text-center text-white outline-none focus:border-violet-500"
                        />
                        <button
                          onClick={() => submitCode(order.id)}
                          disabled={submittingId === order.id || !inputCodes[order.id]?.trim()}
                          className="rounded-xl bg-violet-600 px-5 py-3 text-xs font-black text-white hover:bg-violet-500 transition-all active:scale-95 disabled:opacity-40"
                        >
                          {submittingId === order.id ? "..." : "Отправить"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ДАННЫЕ ИГРОКА */}
                {Object.keys(playerInfo).length > 0 && (
                  <div className="mt-4 space-y-1.5 border-t border-zinc-900/60 pt-3.5">
                    {Object.entries(playerInfo).map(([label, value]) => (
                      <p key={label} className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
                        <span className="text-zinc-500">{label}:</span>{" "}
                        <span className="font-mono bg-zinc-950/40 border border-zinc-900 px-2 py-0.5 rounded text-zinc-200 font-bold">
                          {value}
                        </span>
                      </p>
                    ))}
                  </div>
                )}

                {/* ССЫЛКА НА ЧЕК */}
                {order.receipt_url && (
                  <div className="mt-4 border-t border-zinc-900/60 pt-3 flex items-center">
                    <a
                      href={order.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 transition-colors hover:text-violet-400"
                    >
                      📎 Ваш прикреплённый чек
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}