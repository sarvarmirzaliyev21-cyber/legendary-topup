"use client";

import { useState } from "react";
import { games } from "../../data/games";
import { notFound, useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const game = games.find((g) => g.slug === slug);

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [showError, setShowError] = useState(false);

  if (!game) {
    notFound();
  }

  // Проверки на игры
  const isBrawlStars = game.name === "Brawl Stars" || slug === "brawl-stars";
  const isPubg = game.name === "PUBG Mobile" || slug === "pubg-mobile";
  const isFcMobile = game.name === "FC Mobile" || slug === "fc-mobile";
  const isFortnite = game.name === "Fortnite" || slug === "fortnite";
  const isStumble = game.name === "Stumble Guys" || slug === "stumble-guys";

  // ПОЛЯ ВВОДА
  const displayFields = isBrawlStars
    ? [
        {
          label: "Supercell ID (Email)",
          placeholder: "Введите вашу почту от Supercell ID",
        },
      ]
    : isPubg
    ? [
        {
          label: "Player ID",
          placeholder: "Введите ваш числовой Player ID",
        },
        {
          label: "Игровой никнейм",
          placeholder: "Введите ваш ник в игре для проверки",
        },
      ]
    : isFcMobile
    ? [
        {
          label: "Почта (Gmail / EA Account)",
          placeholder: "example@gmail.com",
        },
      ]
    : isStumble
    ? [
        {
          label: "Игровой никнейм",
          placeholder: "Введите ваш точный ник в Stumble Guys",
        },
      ]
    : game.fields;

  // ТОВАРЫ И ЦЕНЫ
  const displayProducts = isBrawlStars
    ? [
        { name: "30 Gems", price: 2.28, priceDisplay: "$2.28" },
        { name: "80 Gems", price: 5.70, priceDisplay: "$5.70" },
        { name: "170 Gems", price: 10.84, priceDisplay: "$10.84" },
        { name: "360 Gems", price: 21.67, priceDisplay: "$21.67" },
        { name: "950 Gems", price: 56.98, priceDisplay: "$56.98" },
        { name: "2000 Gems", price: 112.13, priceDisplay: "$112.13" },
        { name: "4000 Gems", price: 224.09, priceDisplay: "$224.09" },
        { name: "6000 Gems", price: 336.24, priceDisplay: "$336.24" },
      ]
    : isPubg
    ? [
        { name: "60 UC 🪙", price: 2.05, priceDisplay: "$2.05" },
        { name: "300 + 25 UC 🪙", price: 10.84, priceDisplay: "$10.84" },
        { name: "600 + 60 UC 🪙", price: 18.25, priceDisplay: "$18.25" },
        { name: "1500 + 300 UC 🪙", price: 42.20, priceDisplay: "$42.20" },
        { name: "3000 + 850 UC 🪙", price: 84.35, priceDisplay: "$84.35" },
        { name: "6000 + 2100 UC 🪙", price: 168.50, priceDisplay: "$168.50" },
        { name: "Elite Pass LVL1-100 👑", price: 20.99, priceDisplay: "$20.99" },
        { name: "Elite Pass Plus LVL1-100 ➕", price: 48.50, priceDisplay: "$48.50" },
        { name: "Elite Pass LVL1-50 🎫", price: 13.25, priceDisplay: "$13.25" },
        { name: "First Purchase Pack 🎁", price: 2.05, priceDisplay: "$2.05" },
        { name: "Mythic Emblem Pack 💎", price: 10.85, priceDisplay: "$10.85" },
        { name: "Upgradable Firearm Materials Pack 📦", price: 6.25, priceDisplay: "$6.25" },
        { name: "Weekly Deal Pack 1 📅", price: 2.05, priceDisplay: "$2.05" },
        { name: "Weekly Deal Pack 2 📅", price: 6.35, priceDisplay: "$6.35" },
        { name: "Weekly Mythic Emblem Value Pack 🌟", price: 6.35, priceDisplay: "$6.35" },
        { name: "Prime (1 месяц) 💎", price: 2.05, priceDisplay: "$2.05" },
        { name: "Prime (3 месяца) 💎", price: 6.25, priceDisplay: "$6.25" },
        { name: "Prime (6 месяцев) 💎", price: 12.95, priceDisplay: "$12.95" },
        { name: "Prime (12 месяцев) 💎", price: 20.50, priceDisplay: "$20.50" },
        { name: "Prime Plus (1 Month) ⭐", price: 17.25, priceDisplay: "$17.25" },
        { name: "Prime Plus (3 Months) ⭐", price: 47.50, priceDisplay: "$47.50" },
        { name: "Prime Plus (6 Months) ⭐", price: 94.99, priceDisplay: "$94.99" },
        { name: "Prime Plus (12 Months) ⭐", price: 189.99, priceDisplay: "$189.99" },
      ]
    : isFcMobile
    ? [
        { name: "100 FC Points", price: 1.29, priceDisplay: "$1.29" },
        { name: "520 FC Points", price: 5.99, priceDisplay: "$5.99" },
        { name: "1070 FC Points", price: 11.99, priceDisplay: "$11.99" },
        { name: "2200 FC Points", price: 22.99, priceDisplay: "$22.99" },
        { name: "5750 FC Points", price: 54.99, priceDisplay: "$54.99" },
        { name: "12000 FC Points", price: 109.99, priceDisplay: "$109.99" },
      ]
    : isFortnite
    ? [
        { name: "800 V-Bucks", price: 5.99, priceDisplay: "$5.99" },
        { name: "2400 V-Bucks", price: 14.99, priceDisplay: "$14.99" },
        { name: "4500 V-Bucks", price: 23.99, priceDisplay: "$23.99" },
        { name: "12500 V-Bucks", price: 59.99, priceDisplay: "$59.99" },
        { name: "25000 V-Bucks (12500*2)", price: 114.99, priceDisplay: "$114.99" },
        { name: "37500 V-Bucks (12500*3)", price: 169.99, priceDisplay: "$169.99" },
        { name: "75000 V-Bucks (12500*6)", price: 329.99, priceDisplay: "$329.99" },
      ]
    : game.products;

  function handleFieldChange(label: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [label]: value }));
    if (value.trim() !== "") setShowError(false);
  }

  function buildPlayerInfo() {
    return JSON.stringify(fieldValues);
  }

  const isAllFieldsFilled = displayFields.every(
    (f) => fieldValues[f.label] && fieldValues[f.label].trim() !== ""
  );

  function handleBuyClick(product: any) {
    if (!isAllFieldsFilled) {
      setShowError(true);
      window.scrollTo({ top: 150, behavior: "smooth" });
      return;
    }

    const url = `/checkout?game=${encodeURIComponent(
      game.name
    )}&product=${encodeURIComponent(
      product.name
    )}&price=${encodeURIComponent(
      product.priceDisplay
    )}&priceUsd=${product.price}&playerInfo=${encodeURIComponent(
      buildPlayerInfo()
    )}`;

    router.push(url);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-violet-500/30 relative z-10">
      <style>{`
        @keyframes packIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pack-card {
          animation: packIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        /* Стильный скроллбар */
        .scrollbar-custom::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: rgba(24, 24, 27, 0.5);
          border-radius: 8px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 8px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #7c3aed;
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-16">
        <div className="mb-6">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 transition-colors hover:text-zinc-300"
          >
            ← Назад к витрине игр
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-start">
          {/* ЛЕВАЯ КОЛОНКА */}
          <div className="sticky top-24">
            <img
              src={game.image}
              alt={game.name}
              className="w-full rounded-[32px] border border-zinc-900 bg-zinc-900/10 backdrop-blur-md shadow-2xl shadow-violet-950/10 object-cover aspect-[4/3] lg:aspect-auto"
            />
          </div>

          {/* ПРАВАЯ КОЛОНКА */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 border border-violet-500/30 px-3.5 py-1.5 text-xs font-black text-violet-300 shadow-[0_0_15px_rgba(124,58,237,0.15)] select-none">
                ⚡ Моментальное пополнение
              </span>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl text-zinc-100">
                {game.name}
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
                Официальное и безопасное пополнение вашего аккаунта {game.name}. Укажите ваши данные ниже и выберите необходимый пакет валюты.
              </p>
            </div>

            {/* БЛОК ПОЛЕЙ ВВОДА ДАННЫХ ИГРОКА */}
            <div className={`space-y-5 rounded-2xl border backdrop-blur-md p-5 sm:p-6 shadow-sm transition-all duration-300 ${
              showError
                ? "border-red-500/40 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.1)]"
                : "border-zinc-900 bg-zinc-900/30"
            }`}>
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  1. Данные аккаунта
                </h2>
                {showError && (
                  <span className="text-[11px] font-black uppercase text-red-400 animate-pulse">
                    ⚠️ Заполните поле!
                  </span>
                )}
              </div>

              {displayFields.map((field) => (
                <div key={field.label} className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 px-0.5">
                    {field.label}
                  </label>
                  <input
                    placeholder={field.placeholder}
                    value={fieldValues[field.label] ?? ""}
                    onChange={(e) => handleFieldChange(field.label, e.target.value)}
                    className={`w-full rounded-xl border p-4 text-sm text-zinc-200 outline-none transition-all duration-300 font-medium ${
                      showError && (!fieldValues[field.label] || fieldValues[field.label].trim() === "")
                        ? "border-red-500 bg-red-950/20 focus:border-red-400 focus:ring-red-500/5"
                        : "border-zinc-800 bg-zinc-950/60 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 placeholder-zinc-600"
                    }`}
                  />
                </div>
              ))}

              {isBrawlStars && (
                <div className="rounded-xl border border-violet-500/20 bg-violet-600/10 p-4 text-xs font-medium text-violet-300 leading-relaxed">
                  <span className="font-black text-violet-400 uppercase tracking-wide block mb-1">💬 Внимание:</span> 
                  Когда вам придет 6-значный код на почту, <span className="text-white font-bold">сообщите его в чате поддержки</span> (в личном кабинете после оплаты) для выполнения вашего заказа.
                </div>
              )}

              {isPubg && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-600/10 p-4 text-xs font-medium text-emerald-300 leading-relaxed">
                  <span className="font-black text-emerald-400 uppercase tracking-wide block mb-1">🆔 Инфо:</span> 
                  Доставка осуществляется строго <span className="text-white font-bold">по Player ID</span>. Вход на игровой аккаунт не требуется. Пожалуйста, внимательно сверяйте ваш ID и никнейм перед оплатой!
                </div>
              )}

              {isStumble && (
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-600/10 p-4 text-xs font-medium text-cyan-300 leading-relaxed">
                  <span className="font-black text-cyan-400 uppercase tracking-wide block mb-1">🎮 Инфо:</span> 
                  Пополнение осуществляется по <span className="text-white font-bold">игровому никнейму</span>. Пожалуйста, укажите точный ник (учитывая регистр букв).
                </div>
              )}

              {(isFcMobile || (game as any).notice) && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs font-medium text-amber-300 leading-relaxed">
                  <span className="font-black text-amber-400 uppercase tracking-wide block mb-1">⚠️ ВАЖНО:</span> 
                  {(game as any).notice || "Когда на вашу электронную почту придет код подтверждения (2FA), передайте его в службу поддержки для завершения пополнения FC Mobile!"}
                </div>
              )}
            </div>

            {/* СПИСОК ПАКЕТОВ */}
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 px-1">
                2. Выберите пополнение
              </h2>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-custom">
                {displayProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="animate-pack-card flex flex-col gap-4 rounded-2xl border border-zinc-900 bg-zinc-900/20 p-4 backdrop-blur-md transition-all duration-300 hover:border-violet-500/40 hover:bg-zinc-900/40 sm:flex-row sm:items-center sm:justify-between sm:p-5 group"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className="space-y-1">
                      <h3 className="text-base font-black tracking-tight text-zinc-100 group-hover:text-white transition-colors duration-200 sm:text-lg">
                        {product.name}
                      </h3>
                      <p className="text-sm font-extrabold text-violet-400 font-mono">
                        {product.priceDisplay}
                      </p>
                    </div>

                    <button
                      onClick={() => handleBuyClick(product)}
                      className={`w-full rounded-xl px-6 py-3 text-center text-xs font-black tracking-wide text-white shadow-md transition-all duration-300 sm:w-auto select-none ${
                        isAllFieldsFilled
                          ? "bg-gradient-to-r from-violet-600 to-violet-500 shadow-violet-950/30 hover:from-violet-500 hover:to-fuchsia-600 hover:shadow-[0_0_20px_rgba(124,58,237,0.25)] active:scale-98"
                          : "bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-pointer hover:border-zinc-700 active:scale-95"
                      }`}
                    >
                      Купить
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}