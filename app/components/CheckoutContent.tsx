"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { paymentDetails } from "../data/payments";
import { EXCHANGE_RATE_UZS_PER_RUB } from "../data/games";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const game = searchParams.get("game") ?? "Товар";
  const product = searchParams.get("product") ?? "";
  const price = searchParams.get("price") ?? "";
  const priceRub = parseFloat(searchParams.get("priceRub") ?? "0");
  const playerInfoRaw = searchParams.get("playerInfo") ?? "{}";

  let playerInfo: Record<string, string> = {};
  try {
    playerInfo = JSON.parse(playerInfoRaw);
  } catch {
    playerInfo = {};
  }

  const sumAmount = Math.round(priceRub * EXCHANGE_RATE_UZS_PER_RUB);

  // УНИКАЛЬНЫЙ "ХВОСТИК" — добавляем 1-99 сум к сумме, чтобы автоматика
  // могла точно сопоставить платёж с конкретным заказом.
  // useMemo — чтобы хвостик не пересчитывался при каждом ре-рендере страницы.
  const uniqueTail = useMemo(() => Math.floor(Math.random() * 99) + 1, []);
  const paymentAmount = sumAmount + uniqueTail;
  const paymentAmountFormatted = `${paymentAmount.toLocaleString("ru-RU")} сум`;

  const [cardCopied, setCardCopied] = useState(false);
  const [sumCopied, setSumCopied] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCopyCard() {
    navigator.clipboard.writeText(paymentDetails.cardNumber.replace(/\s/g, ""));
    setCardCopied(true);
    setTimeout(() => setCardCopied(false), 2000);
  }

  function handleCopySum() {
    navigator.clipboard.writeText(String(paymentAmount));
    setSumCopied(true);
    setTimeout(() => setSumCopied(false), 2000);
  }

  async function handleSubmit() {
    if (!receipt || !user) return;

    setLoading(true);
    setError(null);

    try {
      const fileExt = receipt.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, receipt);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("receipts")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase.from("orders").insert({
        game,
        product,
        price_usd: priceRub, // храним рублёвую цену в существующей колонке
        price_sum: sumAmount,
        payment_amount: paymentAmount, // уникальная сумма для авто-сопоставления
        receipt_url: publicUrlData.publicUrl,
        player_info: JSON.stringify(playerInfo),
        user_id: user.id,
      });

      if (insertError) throw insertError;

      // Отправляем уведомление в Telegram (в фоне, не блокируя UI —
      // если уведомление не дойдёт, заказ всё равно уже создан).
      fetch("/api/notify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game,
          product,
          paymentAmount,
          playerInfo,
        }),
      }).catch((err) => console.error("Notify error:", err));

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(
        "Не получилось отправить заявку. Попробуйте ещё раз или напишите в поддержку."
      );
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-violet-500" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
        <div className="max-w-sm w-full rounded-[32px] border border-zinc-900 bg-zinc-900/30 backdrop-blur-xl p-8 text-center shadow-2xl shadow-black/50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20 text-3xl">
            🔒
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100 mt-5">
            Нужно войти
          </h1>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            Чтобы оформить заказ на <span className="text-violet-400 font-bold">{product || "товар"}</span>, сначала войдите в аккаунт или зарегистрируйтесь — это займёт минуту.
          </p>

          <button
            onClick={() =>
              router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`)
            }
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-950/30 transition-all duration-300 hover:scale-[1.01] active:scale-98"
          >
            Войти / Зарегистрироваться
          </button>

          <button
            onClick={() => router.back()}
            className="mt-3 w-full rounded-xl border border-zinc-800 py-3 text-xs font-semibold text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
          >
            Вернуться назад
          </button>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white select-none">
        <div className="max-w-md w-full rounded-[32px] border border-zinc-900 bg-zinc-900/30 backdrop-blur-xl p-8 text-center shadow-2xl shadow-black/50 animate-fade-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-3xl shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            ✅
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100 mt-5">Заявка принята!</h1>
          <p className="mt-3 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Мы проверим оплату и отправим <span className="text-violet-400 font-bold">{product}</span> на ваш аккаунт в течение
            нескольких минут. Спасибо за покупку!
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 md:py-16 selection:bg-violet-500/30 relative z-10">
      <div className="mx-auto max-w-xl space-y-4">
        
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-zinc-100 px-1">
          Оплата заказа
        </h1>

        {/* СВОДКА ЗАКАЗА */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 backdrop-blur-md p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">{game}</span>
          <p className="mt-0.5 text-xl font-black tracking-tight text-zinc-100">{product}</p>
          <p className="mt-2 text-2xl font-black text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text tracking-tight">{price}</p>

          {Object.keys(playerInfo).length > 0 && (
            <div className="mt-4 space-y-1.5 border-t border-zinc-900/60 pt-4">
              {Object.entries(playerInfo).map(([label, value]) => (
                <p key={label} className="text-xs text-zinc-400 flex items-center justify-between font-medium">
                  <span className="text-zinc-500">{label}:</span>
                  <span className="font-mono bg-zinc-950/50 border border-zinc-900/80 px-2 py-0.5 rounded text-zinc-200 font-bold">
                    {value}
                  </span>
                </p>
              ))}
            </div>
          )}
        </div>

        {/* СУММА К ПЕРЕВОДУ */}
        <div className="rounded-2xl border border-violet-500/20 bg-violet-600/10 backdrop-blur-md p-5 shadow-[0_0_30px_rgba(124,58,237,0.05)] relative overflow-hidden">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-violet-400/80">
            К переводу ровно
          </h2>

          <p className="mt-1.5 text-3xl font-black tracking-tight text-white font-mono">
            {paymentAmountFormatted}
          </p>

          <button
            onClick={handleCopySum}
            className={`mt-4 w-full rounded-xl py-3 text-xs font-black transition-all duration-300 border active:scale-98 ${
              sumCopied 
                ? "bg-emerald-600/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                : "border-violet-500/30 bg-violet-600/20 text-violet-300 hover:bg-violet-600 hover:text-white hover:shadow-lg hover:shadow-violet-600/20"
            }`}
          >
            {sumCopied ? "Скопировано ✓" : "Скопировать сумму"}
          </button>

          <p className="mt-3 text-[11px] text-zinc-500 font-medium leading-relaxed">
            Важно: переводите <span className="text-violet-300 font-bold">ровно эту сумму, до сума</span> — благодаря ей система автоматически найдёт и подтвердит именно ваш платёж, без ожидания модератора.
          </p>
        </div>

        {/* РЕКВИЗИТЫ КАРТЫ */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 backdrop-blur-md p-5 shadow-sm">
          <h2 className="mb-3.5 text-sm font-black uppercase tracking-widest text-zinc-400">Переведите на карту</h2>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 relative overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              {paymentDetails.bank}
            </p>

            <p className="mt-2 text-xl font-mono font-black tracking-wider text-zinc-100 select-all">
              {paymentDetails.cardNumber}
            </p>

            <p className="mt-1 text-xs font-semibold text-zinc-400">
              {paymentDetails.cardHolder}
            </p>

            <button
              onClick={handleCopyCard}
              className={`mt-4 w-full rounded-xl py-2.5 text-xs font-bold transition-all duration-300 border active:scale-98 ${
                cardCopied
                  ? "bg-emerald-600/10 border-emerald-500/30 text-emerald-400"
                  : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              {cardCopied ? "Скопировано ✓" : "Скопировать номер карты"}
            </button>
          </div>
        </div>

        {/* ЗАГРУЗКА ЧЕКА */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 backdrop-blur-md p-5 shadow-sm">
          <h2 className="mb-3.5 text-sm font-black uppercase tracking-widest text-zinc-400">Прикрепите чек</h2>

          <label className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all duration-300 select-none ${
            receipt 
              ? "border-violet-500/40 bg-violet-500/5" 
              : "border-zinc-800 bg-zinc-950/20 hover:border-violet-500/30 hover:bg-zinc-900/20"
          }`}>
            <span className={`text-2xl transition-transform duration-300 ${receipt ? 'scale-110' : 'group-hover:scale-110'}`}>
              {receipt ? "📄" : "📎"}
            </span>
            <span className={`mt-2 text-xs max-w-xs truncate font-medium ${receipt ? "text-violet-400 font-bold" : "text-zinc-500"}`}>
              {receipt ? receipt.name : "Нажмите, чтобы выбрать скриншот чека"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {/* СИСТЕМНЫЕ ОШИБКИ */}
        {error && (
          <p className="rounded-xl bg-red-950/30 border border-red-500/20 p-3.5 text-center text-xs font-semibold text-red-400 animate-pulse">
            {error}
          </p>
        )}

        {/* ГЛАВНАЯ КНОПКА ОТПРАВКИ */}
        <div className="pt-2">
          <button
            onClick={handleSubmit}
            disabled={!receipt || loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 py-4 text-sm font-black text-white shadow-lg shadow-violet-950/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-violet-600/10 active:scale-98 disabled:scale-100 disabled:cursor-not-allowed disabled:from-zinc-900 disabled:to-zinc-900 disabled:border-zinc-800 disabled:border disabled:text-zinc-600 disabled:shadow-none"
          >
            {loading ? "Отправка..." : "Я оплатил"}
          </button>

          {!receipt && !loading && (
            <p className="mt-2.5 text-center text-[11px] font-semibold text-zinc-600 tracking-wide animate-pulse">
              Пожалуйста, сначала прикрепите чек, чтобы активировать отправку заявки
            </p>
          )}
        </div>

      </div>
    </main>
  );
}