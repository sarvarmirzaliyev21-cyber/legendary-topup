"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

  const links = [
    { label: "Игры", href: "#games" },
    { label: "Отзывы", href: "#reviews" },
  ];

  // Магия кастомного плавного скролла
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    
    const targetId = href.replace("#", "");
    const elem = document.getElementById(targetId);
    
    if (elem) {
      // Вычисляем позицию с учетом высоты фиксированной шапки (примерно 80px)
      const offsetTop = elem.getBoundingClientRect().top + window.scrollY - 90;
      
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
      
      // Добавляем хэш в URL без перезагрузки страницы
      window.history.pushState(null, "", href);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4 sm:p-6">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent sm:text-2xl md:text-3xl tracking-tight hover:opacity-90 transition">
          LegendaryTopUp
        </Link>

        {/* Меню для десктопа */}
        <nav className="hidden md:flex gap-8 text-zinc-400 font-medium text-sm lg:text-base">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className="transition-colors hover:text-white relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-violet-500 after:transition-all hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
          {!loading && user && (
            <Link
              href="/orders"
              className="transition-colors hover:text-white py-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-violet-500 after:transition-all hover:after:w-full"
            >
              Мои заказы
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {!loading && user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <button
                onClick={signOut}
                className="rounded-xl border border-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-300 transition-all hover:bg-zinc-900 hover:border-zinc-700 active:scale-98"
              >
                Выйти
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-600/20 active:scale-98 sm:px-5 sm:py-2 sm:text-base"
            >
              Войти
            </Link>
          )}

          {/* Кнопка-бургер */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Открыть меню"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl border border-zinc-800 md:hidden hover:bg-zinc-900 transition-colors"
          >
            <span className={`h-0.5 w-5 bg-white transition-all duration-300 ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-5 bg-white transition-all duration-200 ${open ? "opacity-0 scale-0" : ""}`} />
            <span className={`h-0.5 w-5 bg-white transition-all duration-300 ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* Выпадающее мобильное меню с плавной анимацией высоты и прозрачности */}
      <div className={`grid transition-all duration-300 ease-in-out md:hidden ${open ? "grid-rows-[1fr] opacity-100 border-t border-zinc-900" : "grid-rows-[0fr] opacity-0 pointer-events-none"}`}>
        <nav className="overflow-hidden bg-zinc-950/95 px-6 flex flex-col gap-1 dynamic-padding">
          <style jsx>{`
            .dynamic-padding { padding-top: ${open ? "1rem" : "0"}; padding-bottom: ${open ? "1rem" : "0"}; transition: padding 0.3s; }
          `}</style>
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className="rounded-lg px-3 py-3 text-zinc-300 transition-all hover:bg-zinc-900 hover:text-white"
            >
              {link.label}
            </a>
          ))}

          {!loading && user && (
            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-zinc-300 transition-all hover:bg-zinc-900 hover:text-white"
            >
              Мои заказы
            </Link>
          )}

          {!loading && user && (
            <button
              onClick={() => {
                signOut();
                setOpen(false);
              }}
              className="rounded-lg px-3 py-3 text-left text-red-400 transition-all hover:bg-zinc-900/50"
            >
              Выйти
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}