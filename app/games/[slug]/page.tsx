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
        { label: "Supercell ID (Email)", placeholder: "Введите вашу почту от Supercell ID" },
      ]
    : isPubg
    ? [
        { label: "Player ID", placeholder: "Введите ваш числовой Player ID" },
        { label: "Игровой никнейм", placeholder: "Введите ваш ник в игре для проверки" },
      ]
    : isFcMobile
    ? [
        { label: "Почта (Gmail / EA Account)", placeholder: "example@gmail.com" },
      ]
    : isStumble
    ? [
        { label: "Игровой никнейм", placeholder: "Введите ваш точный ник в Stumble Guys" },
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
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }

    const url = `/checkout?game=${encodeURIComponent(
      game?.name || ""
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
    <main className="min-h-[100dvh] bg-zinc-950 text-white selection:bg-violet-500/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-16">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 transition-colors hover:text-zinc-300"
          >
            ← Назад к витрине игр
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-start">
          
          {/* ЛЕВАЯ КОЛОНКА (картинка). Вот тут был баг! Заменили sticky top-24 на lg:sticky */}
          <div className="static lg:sticky lg:top-24">
            <img
              src={game.image}
              alt={game.name}
              className="w-full rounded-[32px] border border-zinc-900 bg-zinc-900/10 object-cover aspect-[4/3] lg:aspect-auto pointer-events-none"
            />
          </div>

          {/* ПРАВАЯ КОЛОНКА */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 border border-violet-500/30 px-3.5 py-1.5 text-xs font-black text-violet-300">
                ⚡ Моментальное пополнение
              </span>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl text-zinc-100">
                {game.name}
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 max-w-xl">
                Официальное и безопасное пополнение вашего аккаунта {game.name}. Укажите ваши данные ниже.
              </p>
            </div>

            {/* ФОРМА (убрали багованный блюр для мобилок) */}
            <div className={`space-y-5 rounded-2xl border bg-zinc-900/90 lg:bg-zinc-900/30 lg:backdrop-blur-md p-5 sm:p-6 transition-all duration-300 ${
              showError ? "border-red-500/40" : "border-zinc-900"
            }`}>
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  1. Данные аккаунта
                </h2>
              </div>

              {displayFields.map((field, i) => {
                const inputId = `input-mobile-${i}`;
                return (
                  <div key={field.label} className="space-y-2">
                    <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wider text-zinc-400 px-0.5">
                      {field.label}
                    </label>
                    <input
                      id={inputId}
                      type="text"
                      placeholder={field.placeholder}
                      value={fieldValues[field.label] ?? ""}
                      onChange={(e) => handleFieldChange(field.label, e.target.value)}
                      className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-200 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 touch-manipulation"
                    />
                  </div>
                );
              })}
            </div>

            {/* ПАКЕТЫ */}
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 px-1">
                2. Выберите пополнение
              </h2>

              <div className="space-y-3">
                {displayProducts.map((product) => (
                  <div key={product.name} className="flex flex-col gap-4 rounded-2xl border border-zinc-900 bg-zinc-900/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="space-y-1">
                      <h3 className="text-base font-black tracking-tight text-zinc-100 sm:text-lg">
                        {product.name}
                      </h3>
                      <p className="text-sm font-extrabold text-violet-400 font-mono">
                        {product.priceDisplay}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBuyClick(product)}
                      className={`touch-manipulation w-full rounded-xl px-6 py-3 text-center text-xs font-black tracking-wide text-white transition-all duration-300 sm:w-auto ${
                        isAllFieldsFilled
                          ? "bg-violet-600 hover:bg-violet-500 active:scale-95"
                          : "bg-zinc-900 text-zinc-500 border border-zinc-800"
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