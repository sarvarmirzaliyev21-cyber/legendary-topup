"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";

export default function AdminNotifications() {
  const supabase = createClient();
  const [newOrders, setNewOrders] = useState(0);
  const [newMessages, setNewMessages] = useState(0);

  useEffect(() => {
    // Подписка на новые заказы
    const ordersChannel = supabase
      .channel("new_orders")
      .on("postgres_changes", 
        { event: "INSERT", schema: "public", table: "orders" }, 
        () => {
          setNewOrders(prev => prev + 1);
          playNotificationSound();
        }
      )
      .subscribe();

    // Подписка на новые сообщения в поддержку
    const messagesChannel = supabase
      .channel("new_support_messages")
      .on("postgres_changes", 
        { event: "INSERT", schema: "public", table: "support_messages", filter: "sender=eq.user" }, 
        () => {
          setNewMessages(prev => prev + 1);
          playNotificationSound();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, []);

  const playNotificationSound = () => {
    try {
      const audio = new Audio("https://assets.mixkit.co/sfx/preview/2967/2967.wav");
      audio.volume = 0.4;
      
      // Обеспечиваем чистый вызов плеера, отлавливая любые блокировки браузера
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          console.log("Браузер заблокировал звук. Пожалуйста, кликните по интерфейсу.");
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetNotifications = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNewOrders(0);
    setNewMessages(0);
  };

  const totalNotifications = newOrders + newMessages;

  return (
    <div className="flex items-center gap-2 bg-zinc-900/40 border border-zinc-900 rounded-xl p-1 backdrop-blur-md relative group select-none">
      
      {/* Кнопка Заказов */}
      <Link 
        href="/admin"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-all duration-200 active:scale-95"
      >
        <span className="text-base">🛒</span>
        {newOrders > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-zinc-950 shadow-[0_0_12px_rgba(245,158,11,0.4)] border border-zinc-950 animate-pulse">
            {newOrders}
          </span>
        )}
      </Link>

      {/* Кнопка Сообщений поддержки */}
      <Link 
        href="/admin/support"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-all duration-200 active:scale-95"
      >
        <span className="text-base">💬</span>
        {newMessages > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-violet-500 text-[9px] font-black text-white shadow-[0_0_12px_rgba(124,58,237,0.4)] border border-zinc-950 animate-pulse">
            {newMessages}
          </span>
        )}
      </Link>

      {/* Кнопка сброса (появляется только если есть счетчики) */}
      {totalNotifications > 0 && (
        <button
          onClick={resetNotifications}
          className="flex h-9 px-2 items-center justify-center rounded-lg text-[10px] font-bold text-zinc-500 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all duration-200 ml-1"
          title="Сбросить счетчики"
        >
          ✕ Сброс
        </button>
      )}
    </div>
  );
}