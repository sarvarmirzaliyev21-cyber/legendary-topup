"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // ИСПРАВЛЕНО: теперь строго из next/link
import { useAuth } from "../context/AuthContext";

const ADMIN_EMAIL = "sarvarmirzaliyev21@gmail.com";

export default function OwnerBanner() {
  const { user, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading || user?.email !== ADMIN_EMAIL) return null;

  return (
    <>
      {/* ОСНОВНОЙ КОНТЕЙНЕР (ВСЕГДА FIXED БЕЗ ПРЫЖКОВ) */}
      <div 
        className={`fixed left-1/2 -translate-x-1/2 z-40 w-[95vw] transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]
          ${isScrolled 
            ? "top-4 max-w-2xl px-0" 
            : "top-[73px] sm:top-[89px] max-w-7xl px-4 sm:px-6"
          }`}
      >
        <div 
          className={`flex items-center justify-between gap-3 border border-violet-500/10 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] rounded-2xl
            ${isScrolled 
              ? "bg-zinc-950/85 px-5 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] border-violet-500/20" 
              : "bg-zinc-900/60 px-6 py-3.5 shadow-none"
            }`}
        >
          
          {/* Левая часть: Инфо */}
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500" />
            </span>
            <div className="flex items-center gap-2">
              <p className="font-bold text-xs sm:text-sm bg-gradient-to-r from-violet-200 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent tracking-wide">
                {isScrolled ? "Admin Mode" : "Панель управления владельца"}
              </p>
              
              <span className="flex h-5 items-center justify-center rounded-full bg-violet-500/10 border border-violet-500/30 px-1.5 text-[10px] font-black text-violet-300 shadow-[0_0_10px_rgba(124,58,237,0.2)] animate-pulse">
                • 2 новых
              </span>
            </div>
          </div>

          {/* Правая часть: Кнопки админа */}
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="rounded-xl bg-violet-600 px-3.5 py-1.5 text-xs font-black text-white shadow-md shadow-violet-950/30 transition-all duration-300 hover:bg-violet-500 hover:scale-[1.04] active:scale-96"
            >
              Заказы
            </Link>

            <Link
              href="/admin/support"
              className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-3.5 py-1.5 text-xs font-black text-violet-300 transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/10 hover:scale-[1.04] active:scale-96"
            >
              Поддержка
            </Link>
          </div>

        </div>
      </div>

      {/* ЖЕСТКИЙ СТАТИЧНЫЙ ОТСТУП ДЛЯ ПОТОКА */}
      <div className="h-[76px] sm:h-[88px] w-full pointer-events-none sticky top-0" />
    </>
  );
}