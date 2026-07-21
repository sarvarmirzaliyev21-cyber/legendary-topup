"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

const ADMIN_EMAIL = "sarvarmirzaliyev21@gmail.com";

export default function OwnerBanner() {
  const { user, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Стейты для реалтайм-данных
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [unreadSupportCount, setUnreadSupportCount] = useState<number>(0);

  // 1. Отслеживание скролла
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Отслеживание Онлайн-посетителей
  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;

    const channelName = "online-tracker";

    const existingChannel = supabase
      .getChannels()
      .find((c) => c.topic === `realtime:${channelName}`);

    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: `admin-${Math.random().toString(36).substring(2, 7)}`,
        },
      },
    });

    const updateCount = () => {
      const state = channel.presenceState();
      const count = Object.keys(state).length;
      setOnlineCount(count > 0 ? count : 1);
    };

    channel
      .on("presence", { event: "sync" }, updateCount)
      .on("presence", { event: "join" }, updateCount)
      .on("presence", { event: "leave" }, updateCount);

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ online_at: new Date().toISOString(), is_admin: true });
      }
    });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [user]);

  // 3. Отслеживание новых Заказов и Сообщений Поддержки
  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;

    // --- А) ЗАКАЗЫ: Получаем новые заказы со статусом 'pending' (ожидает) ---
    const fetchPendingOrders = async () => {
      const { count, error } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      if (!error && count !== null) {
        setPendingOrdersCount(count);
      }
    };

    // --- Б) ПОДДЕРЖКА: Получаем непрочитанные сообщения поддержки ---
    const fetchUnreadSupport = async () => {
      const { count, error } = await supabase
        .from("support_messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false)
        .neq("sender_role", "admin"); // Считаем только сообщения от клиентов

      if (!error && count !== null) {
        setUnreadSupportCount(count);
      }
    };

    // Первичная загрузка
    fetchPendingOrders();
    fetchUnreadSupport();

    // --- В) REALTIME ПОДПИСКА на таблицу Заказов ---
    const ordersSubscription = supabase
      .channel("admin-orders-counter")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchPendingOrders();
        }
      )
      .subscribe();

    // --- Г) REALTIME ПОДПИСКА на таблицу Сообщений Поддержки ---
    const supportSubscription = supabase
      .channel("admin-support-counter")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_messages" },
        () => {
          fetchUnreadSupport();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
      supabase.removeChannel(supportSubscription);
    };
  }, [user]);

  if (loading || user?.email !== ADMIN_EMAIL) return null;

  return (
    <>
      {/* ПЛАВАЮЩАЯ ПАНЕЛЬ ВЛАДЕЛЬЦА */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-50 w-[94vw] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled
            ? "top-3 max-w-2xl scale-[0.98]"
            : "top-[76px] sm:top-[92px] max-w-7xl scale-100"
        }`}
      >
        <div
          className={`group relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border transition-all duration-500 ${
            isScrolled
              ? "border-violet-500/30 bg-zinc-950/80 px-4 py-2 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(124,58,237,0.15)] backdrop-blur-2xl"
              : "border-violet-500/20 bg-zinc-900/40 px-5 py-3 shadow-lg shadow-violet-950/10 backdrop-blur-xl hover:border-violet-500/40 hover:bg-zinc-900/60"
          }`}
        >
          {/* НЕОНОВЫЙ БЛИК ПРИ НАВЕДЕНИИ */}
          <div className="pointer-events-none absolute -inset-x-20 -top-20 bottom-0 bg-gradient-to-r from-transparent via-violet-500/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* ЛЕВАЯ ЧАСТЬ: ИНФОРМАЦИЯ И ОНЛАЙН */}
          <div className="relative z-10 flex items-center gap-2.5 sm:gap-3.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-violet-500 shadow-[0_0_8px_#8b5cf6]" />
            </span>

            <div className="flex items-center gap-2">
              <p className="bg-gradient-to-r from-white via-violet-200 to-fuchsia-300 bg-clip-text text-xs font-black tracking-wide text-transparent sm:text-sm">
                {isScrolled ? "Admin" : "Панель владельца"}
              </p>

              {/* ИНДИКАТОР ОНЛАЙН */}
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span>
                  Онлайн: <strong className="text-white font-black">{onlineCount}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* ПРАВАЯ ЧАСТЬ: КНОПКИ С ДИНАМИЧЕСКИМИ БЕЙДЖАМИ */}
          <div className="relative z-10 flex items-center gap-2 sm:gap-2.5">
            {/* КНОПКА ЗАКАЗЫ */}
            <Link
              href="/admin"
              className="relative flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-3.5 py-1.5 text-xs font-black text-white shadow-md shadow-violet-950/40 transition-all duration-300 hover:scale-[1.05] hover:from-violet-500 hover:to-violet-400 active:scale-95"
            >
              <span>Заказы</span>
              
              {/* Счётчик новых заказов (+X) */}
              {pendingOrdersCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[10px] font-black text-white shadow-[0_0_8px_rgba(217,70,239,0.8)] animate-pulse">
                  +{pendingOrdersCount}
                </span>
              )}
            </Link>

            {/* КНОПКА ПОДДЕРЖКА */}
            <Link
              href="/admin/support"
              className="relative flex items-center gap-1.5 rounded-xl border border-zinc-700/60 bg-zinc-800/50 px-3.5 py-1.5 text-xs font-bold text-zinc-300 transition-all duration-300 hover:border-violet-500/40 hover:bg-zinc-800 hover:text-white hover:scale-[1.05] active:scale-95"
            >
              <span>Поддержка</span>

              {/* Счётчик новых сообщений поддержки (+X) */}
              {unreadSupportCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-violet-500 px-1 text-[10px] font-black text-white shadow-[0_0_8px_rgba(139,92,246,0.8)] animate-pulse">
                  +{unreadSupportCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* МЯГКИЙ ОТСТУП ДЛЯ ВЕРХНЕГО ПОТОКА */}
      <div className="pointer-events-none h-[72px] w-full sm:h-[88px]" />
    </>
  );
}