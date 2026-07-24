"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
  const [promoClaimed, setPromoClaimed] = useState(false);
  const [promoLoading, setPromoLoading] = useState<string | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // Проверяем при загрузке страницы, не разобрали ли уже акцию (для любой из игр)
  useEffect(() => {
    fetch("/api/claim-promo")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) setPromoClaimed(!!data.claimed);
      })
      .catch(() => {});
  }, []);

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

  // ТОВАРЫ И ЦЕНЫ (в рублях)
  const displayProducts = isBrawlStars
    ? [
        { name: "30 Gems", price: 1, priceDisplay: "1 ₽", promo: true },
        { name: "80 Gems", price: 443, priceDisplay: "443 ₽" },
        { name: "170 Gems", price: 887, priceDisplay: "887 ₽" },
        { name: "360 Gems", price: 1835, priceDisplay: "1835 ₽" },
        { name: "950 Gems", price: 4415, priceDisplay: "4415 ₽" },
        { name: "2000 Gems", price: 8699, priceDisplay: "8699 ₽" },
        { name: "4000 Gems", price: 17399, priceDisplay: "17399 ₽" },
        { name: "6000 Gems", price: 26099, priceDisplay: "26099 ₽" },
      ]
    : isPubg
    ? [
        { name: "60 UC 🪙", price: 1, priceDisplay: "1 ₽", promo: true },
        { name: "300 + 25 UC 🪙", price: 479, priceDisplay: "479 ₽" },
        { name: "600 + 60 UC 🪙", price: 1031, priceDisplay: "1031 ₽" },
        { name: "1500 + 300 UC 🪙", price: 2567, priceDisplay: "2567 ₽" },
        { name: "3000 + 850 UC 🪙", price: 5135, priceDisplay: "5135 ₽" },
        { name: "6000 + 2100 UC 🪙", price: 10259, priceDisplay: "10259 ₽" },
        { name: "Elite Pass LVL1-100 👑", price: 1187, priceDisplay: "1187 ₽" },
        { name: "Elite Pass Plus LVL1-100 ➕", price: 2951, priceDisplay: "2951 ₽" },
        { name: "Elite Pass LVL1-50 🎫", price: 588, priceDisplay: "588 ₽" },
      ]
    : isFcMobile
    ? [
        { name: "100 FC Points", price: 1, priceDisplay: "1 ₽", promo: true },
        { name: "520 FC Points", price: 433, priceDisplay: "433 ₽" },
        { name: "1070 FC Points", price: 899, priceDisplay: "899 ₽" },
        { name: "2200 FC Points", price: 1775, priceDisplay: "1775 ₽" },
        { name: "5750 FC Points", price: 4463, priceDisplay: "4463 ₽" },
        { name: "12000 FC Points", price: 8903, priceDisplay: "8903 ₽" },
      ]
    : isFortnite
    ? [
        { name: "800 V-Bucks", price: 517, priceDisplay: "517 ₽" },
        { name: "2400 V-Bucks", price: 1295, priceDisplay: "1295 ₽" },
        { name: "4500 V-Bucks", price: 2087, priceDisplay: "2087 ₽" },
        { name: "12500 V-Bucks", price: 5207, priceDisplay: "5207 ₽" },
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

  function goToCheckout(product: any) {
    const url = `/checkout?game=${encodeURIComponent(
      game?.name || ""
    )}&product=${encodeURIComponent(
      product.name
    )}&price=${encodeURIComponent(
      product.priceDisplay
    )}&priceRub=${product.price}&playerInfo=${encodeURIComponent(
      buildPlayerInfo()
    )}`;

    router.push(url);
  }

  async function handleBuyClick(product: any) {
    if (!isAllFieldsFilled) {
      setShowError(true);
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }

    // Обычный товар — сразу на checkout, без обращения к промо-API
    if (!product.promo) {
      goToCheckout(product);
      return;
    }

    // Промо-товар (1 ₽) — сначала пытаемся "занять" акцию на сервере
    setPromoMessage(null);
    setPromoLoading(product.name);

    try {
      const res = await fetch("/api/claim-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json().catch(() => null);

      if (res.status === 409 || data?.claimed) {
        setPromoClaimed(true);
        setPromoMessage("Извините, этот товар за 1 ₽ уже забрали 😔");
        return;
      }

      if (!data?.ok) {
        setPromoMessage("Не получилось оформить акцию, попробуйте ещё раз.");
        return;
      }

      // Успешно заняли акцию — идём оформлять заказ
      goToCheckout(product);
    } catch {
      setPromoMessage("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setPromoLoading(null);
    }
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
          
          {/* ЛЕВАЯ КОЛОНКА (картинка) */}
          <div className="static lg:sticky lg:top-24">
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[32px] border border-zinc-900 bg-zinc-900/10">
              <Image
                src={game.image}
                alt={game.name}
                fill
                priority
                unoptimized
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover pointer-events-none"
              />
            </div>
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

            {/* ФОРМА */}
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

              {promoMessage && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300">
                  {promoMessage}
                </p>
              )}

              <div className="space-y-3">
                {displayProducts.map((product: any) => {
                  const isPromoTaken = product.promo && promoClaimed;
                  const isThisLoading = promoLoading === product.name;

                  return (
                    <div
                      key={product.name}
                      className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${
                        product.promo && !isPromoTaken
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-zinc-900 bg-zinc-900/20"
                      }`}
                    >
                      <div className="space-y-1">
                        <h3 className="text-base font-black tracking-tight text-zinc-100 sm:text-lg flex items-center gap-2">
                          {product.name}
                          {product.promo && !isPromoTaken && (
                            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-black text-emerald-300">
                              АКЦИЯ
                            </span>
                          )}
                        </h3>
                        <p className={`text-sm font-extrabold font-mono ${
                          product.promo && !isPromoTaken ? "text-emerald-400" : "text-violet-400"
                        }`}>
                          {isPromoTaken ? "Раскуплено" : product.priceDisplay}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={isPromoTaken || isThisLoading}
                        onClick={() => handleBuyClick(product)}
                        className={`touch-manipulation w-full rounded-xl px-6 py-3 text-center text-xs font-black tracking-wide text-white transition-all duration-300 sm:w-auto ${
                          isPromoTaken
                            ? "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
                            : isAllFieldsFilled
                            ? "bg-violet-600 hover:bg-violet-500 active:scale-95"
                            : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                        }`}
                      >
                        {isPromoTaken
                          ? "Раскуплено 🔥"
                          : isThisLoading
                          ? "Проверяем..."
                          : "Купить"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
