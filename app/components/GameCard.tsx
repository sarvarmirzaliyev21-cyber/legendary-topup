"use client";

import Link from "next/link";

type GameCardProps = {
  name: string;
  image: string;
  price: string;
  popular: boolean;
  slug: string;
};

export default function GameCard({
  name,
  image,
  price,
  popular,
  slug,
}: GameCardProps) {
  return (
    <Link
      href={`/games/${slug}`}
      className="group relative block overflow-hidden rounded-[32px] border border-zinc-900 bg-zinc-900/30 backdrop-blur-md shadow-xl transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-2 hover:border-violet-500/30 hover:shadow-[0_20px_50px_rgba(124,58,237,0.15)] select-none"
    >
      {/* КРУТОЙ НЕОНОВЫЙ БЕЙДЖ TOP */}
      {popular && (
        <div className="absolute right-4 top-4 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1 text-[11px] font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(124,58,237,0.4)] border border-white/10">
          🔥 TOP
        </div>
      )}

      {/* БЛОК КАРТИНКИ С УМНЫМ ЗАТЕМНЕНИЕМ */}
      <div className="relative h-48 overflow-hidden sm:h-56 md:h-64 lg:h-72">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
        />
        {/* Градиент снизу вверх для идеальной читаемости текста */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
      </div>

      {/* ТЕКСТОВЫЙ БЛОК (ПОЛУПРОЗРАЧНОЕ СТЕКЛО) */}
      <div className="p-5 sm:p-6 relative z-10 border-t border-zinc-900/50 bg-zinc-950/20">
        <h4 className="text-lg font-black tracking-tight text-zinc-200 group-hover:text-white transition-colors duration-300 sm:text-xl md:text-2xl truncate">
          {name}
        </h4>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Цена</span>
            <p className="text-base font-extrabold text-violet-400 sm:text-lg tracking-tight">
              от {price}
            </p>
          </div>

          {/* ИНТЕРАКТИВНАЯ КНОПКА ПОПОЛНЕНИЯ */}
          <span className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-violet-950/30 transition-all duration-300 group-hover:from-violet-500 group-hover:to-fuchsia-600 group-hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] active:scale-95">
            Пополнить
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </div>

      {/* ЭФФЕКТ СВЕТОВОГО БЛИКА ПРИ ХОВЕРЕ */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none z-30" />
    </Link>
  );
}