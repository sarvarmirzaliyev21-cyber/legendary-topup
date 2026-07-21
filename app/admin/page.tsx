"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import AdminNav from "./AdminNav";

const ADMIN_EMAIL = "sarvarmirzaliyev21@gmail.com";

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
  оплачено: "Оплачено",
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
    return {};
  }
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("все");

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setOrders(data as Order[]);
    setLoadingOrders(false);
  }

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) {
      loadOrders();

      // Подписка на реалтайм
      const channel = supabase
        .channel("admin_orders_code_realtime")
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
    } else {
      setLoadingOrders(false);
    }
  }, [user]);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
    }
    setUpdatingId(null);
  }

  // ФУНКЦИЯ ЗАПРОСА КОДА
  async function requestCode(id: string) {
    setUpdatingId(id);
    const { error } = await supabase
      .from("orders")
      .update({ code_requested: true, verification_code: null })
      .eq("id", id);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, code_requested: true, verification_code: null } : o))
      );
    }
    setUpdatingId(null);
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-violet-500" />
      </main>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white select-none">
        <div className="text-center space-y-3 max-w-sm px-6 py-8 rounded-2xl border border-zinc-900/50 bg-zinc-900/10 backdrop-blur-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-xl">
            🔒
          </div>
          <h1 className="text-base font-bold text-zinc-200">Доступ запрещён</h1>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Эта страница доступна только владельцу сайта.
          </p>
        </div>
      </main>
    );
  }

  if (loadingOrders) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-violet-500" />
      </main>
    );
  }

  const filteredOrders =
    filter === "все" ? orders : orders.filter((o) => o.status === filter);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 md:py-12 selection:bg-violet-500/30">
      <style>{`
        @keyframes orderIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-order-card {
          animation: orderIn 0.4s cubic-bezier(0.215, 0.61, 0.355, 1) both;
        }
      `}</style>

      <div className="mx-auto max-w-4xl">
        <AdminNav />
        
        <div className="mt-6 border-b border-zinc-900 pb-5">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-zinc-100">Заказы</h1>
          <p className="mt-1 text-xs text-zinc-500 font-medium">
            Всего заказов: <span className="text-zinc-400 font-bold">{orders.length}</span>
          </p>
        </div>

        {/* ТАБ-ФИЛЬТР */}
        <div className="mt-6 flex flex-wrap gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {["все", ...Object.keys(STATUS_LABELS)].map((s) => {
            const isActive = filter === s;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 select-none border ${
                  isActive
                    ? "border-violet-500/30 bg-violet-600/10 text-violet-400 shadow-[0_0_20px_rgba(124,58,237,0.1)]"
                    : "border-transparent bg-zinc-900/30 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                }`}
              >
                {s === "все" ? "Все" : STATUS_LABELS[s]}
              </button>
            );
          })}
        </div>

        {/* СПИСОК ЗАКАЗОВ */}
        <div className="mt-6 space-y-3.5">
          {filteredOrders.length === 0 && (
            <div className="text-center py-12 rounded-2xl border border-zinc-900 bg-zinc-900/10 text-zinc-500 text-xs">
              Заказов нет
            </div>
          )}

          {filteredOrders.map((order, index) => {
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

                {/* КАСТОМНЫЕ ПОЛЯ ДАННЫХ ИГРОКА */}
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

                {/* ПОКАЗЫВАЕМ ПОЛУЧЕННЫЙ КОД ОТ КЛИЕНТА */}
                {order.verification_code ? (
                  <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">Полученный код подтверждения:</span>
                      <span className="text-2xl font-mono font-black text-white tracking-widest">{order.verification_code}</span>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(order.verification_code!)}
                      className="rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-600/40 active:scale-95 transition-all"
                    >
                      Скопировать
                    </button>
                  </div>
                ) : order.code_requested ? (
                  <div className="mt-4 rounded-xl bg-violet-600/10 border border-violet-500/30 p-3 text-xs font-bold text-violet-300 animate-pulse">
                    ⏳ Запрос отправлен. Ожидаем ввод кода клиентом в разделе «Мои заказы»...
                  </div>
                ) : null}

                {/* КНОПКИ ДЕЙСТВИЙ */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-900/60 pt-4">
                  {order.receipt_url ? (
                    <a
                      href={order.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 transition-colors hover:text-violet-400"
                    >
                      📎 Посмотреть чек
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-600 font-medium italic">Без чека</span>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {/* КНОПКА ЗАПРОСА КОДА */}
                    <button
                      onClick={() => requestCode(order.id)}
                      disabled={updatingId === order.id}
                      className="rounded-xl border border-violet-500/30 bg-violet-600/20 px-3.5 py-2 text-xs font-bold text-violet-300 transition-all duration-200 hover:bg-violet-600 hover:text-white active:scale-95 disabled:opacity-40"
                    >
                      🔑 Запросить код
                    </button>

                    <button
                      onClick={() => updateStatus(order.id, "оплачено")}
                      disabled={updatingId === order.id}
                      className="rounded-xl bg-blue-600/90 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-950/30 transition-all duration-200 hover:bg-blue-500 hover:scale-[1.02] active:scale-95 disabled:opacity-40"
                    >
                      Подтвердить оплату
                    </button>
                    <button
                      onClick={() => updateStatus(order.id, "выполнено")}
                      disabled={updatingId === order.id}
                      className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-3.5 py-2 text-xs font-black text-white shadow-md shadow-emerald-950/30 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-40"
                    >
                      Выполнено
                    </button>
                    <button
                      onClick={() => updateStatus(order.id, "отклонено")}
                      disabled={updatingId === order.id}
                      className="rounded-xl border border-red-500/20 bg-red-500/5 px-3.5 py-2 text-xs font-bold text-red-400 transition-all duration-200 hover:bg-red-500/10 active:scale-95 disabled:opacity-40"
                    >
                      Отклонить
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}