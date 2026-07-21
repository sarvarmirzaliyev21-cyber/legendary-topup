"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

type Order = {
  id: string;
  user_id: string;
  item_title: string;
  price: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  code_requested: boolean;
  verification_code: string | null;
  created_at: string;
};

export default function OrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputCodes, setInputCodes] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();

    // Подписка на изменение заказов в реальном времени
    const channel = supabase
      .channel("user_orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadOrders() {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", sessionData.session.user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data as Order[]);
    }
    setLoading(false);
  }

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

  function getStatusBadge(status: Order["status"]) {
    switch (status) {
      case "completed":
        return <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-black text-emerald-400">Выполнен</span>;
      case "processing":
        return <span className="rounded-lg bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 text-[10px] font-black text-violet-400 animate-pulse">В процессе</span>;
      case "cancelled":
        return <span className="rounded-lg bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-[10px] font-black text-red-400">Отменён</span>;
      default:
        return <span className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[10px] font-black text-amber-400">Ожидает</span>;
    }
  }

  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-violet-500" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-100">Мои заказы</h1>
            <p className="text-xs text-zinc-500 mt-1">Отслеживайте статус и передавайте данные для выполнения</p>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-all"
          >
            ← Главная
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/10 rounded-3xl border border-zinc-900 p-6 space-y-3">
            <div className="text-3xl">📦</div>
            <h3 className="text-sm font-bold text-zinc-300">У вас пока нет заказов</h3>
            <p className="text-xs text-zinc-500">После покупки ваш заказ появится на этой странице.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-zinc-900 bg-zinc-900/20 p-5 space-y-4 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">ID: {order.id.slice(0, 8)}</span>
                    <h2 className="text-base font-black text-zinc-100 mt-0.5">{order.item_title}</h2>
                    <p className="text-xs font-bold text-violet-400 mt-1">{order.price} ₽</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* БЛОК ВВОДА КОДА ПОДТВЕРЖДЕНИЯ */}
                {order.code_requested && (
                  <div className="rounded-2xl border border-violet-500/40 bg-violet-600/10 p-4 space-y-3 shadow-[0_0_25px_rgba(124,58,237,0.15)]">
                    <div className="flex items-center gap-2 text-violet-300 font-black text-xs uppercase tracking-wider">
                      <span>🔐</span> Требуется код подтверждения
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                      Введите код, полученный по SMS или Email, для выполнения заказа:
                    </p>

                    {order.verification_code ? (
                      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center text-xs font-bold text-emerald-400">
                        ✓ Код ({order.verification_code}) отправлен. Ожидайте выполнения.
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={8}
                          placeholder="Код из SMS/Email"
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
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}