"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

type Review = {
  id: string;
  user_email: string;
  rating: number;
  text: string;
  created_at: string;
};

// Функция для маскировки мата
function censorText(text: string): string {
  const badWords = /хуй|пизд|ебл|еба|бля|сука|мудак|гондон|залуп|шлюх|простит/gi;
  return text.replace(badWords, (match) => {
    return match[0] + "*".repeat(match.length - 1);
  });
}

function Stars({
  value,
  onChange,
  colorClass = "text-violet-400",
}: {
  value: number;
  onChange?: (n: number) => void;
  colorClass?: string;
}) {
  const starButtons = [];
  for (let n = 1; n <= 5; n++) {
    starButtons.push(
      <button
        key={n}
        type="button"
        disabled={!onChange}
        onClick={() => onChange?.(n)}
        className={`text-xl transition-transform duration-200 leading-none ${
          n <= value ? colorClass : "text-zinc-700 hover:text-zinc-500"
        } ${onChange ? "cursor-pointer hover:scale-110" : ""}`}
      >
        ★
      </button>
    );
  }

  return <div className="flex gap-1">{starButtons}</div>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ReviewSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md p-5">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-2xl bg-zinc-800/80" />
        <div className="flex-1 space-y-3 py-1">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 rounded-lg bg-zinc-800/80" />
            <div className="h-3 w-16 rounded-lg bg-zinc-800/80" />
          </div>
          <div className="h-4 w-20 rounded-lg bg-zinc-800/80" />
          <div className="space-y-2 pt-1">
            <div className="h-3 rounded-lg bg-zinc-800/80" />
            <div className="h-3 w-5/6 rounded-lg bg-zinc-800/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsSection() {
  const { user, loading: authLoading } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);
  
  const [canLeaveReview, setCanLeaveReview] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<{ [key: number]: number }>({
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  });

  const [showToast, setShowToast] = useState(false);

  async function checkReviewStatus() {
    if (!user) {
      setCheckingStatus(false);
      return;
    }

    const { count: ordersCount } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { count: reviewsCount } = await supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const totalOrders = ordersCount || 0;
    const totalReviews = reviewsCount || 0;

    setCanLeaveReview(totalOrders > totalReviews);
    setCheckingStatus(false);
  }

  useEffect(() => {
    if (user) {
      checkReviewStatus();
    } else {
      setCheckingStatus(false);
    }
  }, [user]);

  async function loadReviews() {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      const fetchedReviews = data as Review[];
      setReviews(fetchedReviews);
      
      if (fetchedReviews.length > 0) {
        const total = fetchedReviews.reduce((sum, r) => sum + r.rating, 0);
        setAverageRating(Number((total / fetchedReviews.length).toFixed(1)));

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        fetchedReviews.forEach((r) => {
          if (r.rating >= 1 && r.rating <= 5) {
            distribution[r.rating as 1 | 2 | 3 | 4 | 5] += 1;
          }
        });
        setRatingDistribution(distribution);
      }
    }
    setLoadingReviews(false);
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Поставьте оценку от 1 до 5 звёзд");
      return;
    }
    if (!text.trim()) {
      setError("Напишите текст отзыва");
      return;
    }
    if (!user) return;

    setSubmitting(true);
    const cleanText = censorText(text.trim());

    const { error: insertError } = await supabase.from("reviews").insert({
      user_id: user.id,
      user_email: user.email,
      rating,
      text: cleanText,
    });

    setSubmitting(false);
    if (insertError) {
      setError("Не получилось отправить отзыв. Попробуйте ещё раз.");
      return;
    }

    setRating(0);
    setText("");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
    
    await checkReviewStatus(); 
    loadReviews();
  }

  const distributionRows = [];
  for (let stars = 5; stars >= 1; stars--) {
    const count = ratingDistribution[stars] || 0;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    distributionRows.push(
      <div key={stars} className="flex items-center gap-3 text-xs">
        <span className="w-3 text-right font-bold text-zinc-400">{stars}</span>
        <span className="text-violet-400">★</span>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-950/60 border border-zinc-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="w-8 text-right font-mono text-[11px] text-zinc-500">
          {Math.round(percentage)}%
        </span>
      </div>
    );
  }

  return (
    <section id="reviews" className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 select-none">
      
      {/* КАСКАДНЫЙ ВЫЛЕТ КАРТОЧЕК */}
      <style>{`
        @keyframes reviewIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-review-card {
          animation: reviewIn 0.4s cubic-bezier(0.215, 0.61, 0.355, 1) both;
        }
      `}</style>

      {/* ТОСТ УСПЕШНОЙ ОТПРАВКИ */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-xs font-black text-white shadow-2xl shadow-violet-950/80 border border-white/10 animate-bounce">
          <span>✓</span> Отзыв успешно опубликован!
        </div>
      )}

      <div className="mb-8 border-b border-zinc-900 pb-5">
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl text-zinc-100">Отзывы клиентов</h2>
        <p className="mt-1 text-xs text-zinc-500 font-medium">Реальные мнения покупателей нашего сервиса</p>
      </div>

      {/* СТАТИСТИКА РЕЙТИНГА (СТЕКЛО) */}
      {!loadingReviews && reviews.length > 0 && (
        <div className="mb-10 grid grid-cols-1 gap-6 rounded-3xl border border-zinc-900 bg-zinc-900/30 backdrop-blur-md p-6 sm:grid-cols-3 shadow-sm">
          <div className="flex flex-col items-center justify-center text-center sm:border-r sm:border-zinc-900">
            <span className="text-5xl font-black tracking-tight text-white font-mono">{averageRating}</span>
            <div className="my-2">
              <Stars value={Math.round(averageRating)} />
            </div>
            <span className="text-xs text-zinc-500 font-medium">
              На основе {reviews.length} отзывов
            </span>
          </div>
          <div className="col-span-2 flex flex-col justify-center space-y-2.5">
            {distributionRows}
          </div>
        </div>
      )}

      {/* ФОРМА ДОБАВЛЕНИЯ ОТЗЫВА */}
      <div className="mb-10 rounded-3xl border border-zinc-900 bg-zinc-900/30 backdrop-blur-md p-5 sm:p-7 shadow-sm">
        {authLoading || checkingStatus ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-28 rounded-lg bg-zinc-800/80" />
            <div className="h-12 w-full rounded-xl bg-zinc-800/80" />
          </div>
        ) : user && canLeaveReview ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">Ваша оценка</label>
              <Stars value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">Текст отзыва</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="Расскажите о своём опыте покупки..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 placeholder-zinc-700 font-medium resize-none"
              />
            </div>
            {error && <p className="rounded-xl bg-red-950/30 border border-red-500/20 p-3.5 text-center text-xs font-semibold text-red-400 animate-pulse">{error}</p>}
            <button 
              type="submit" 
              disabled={submitting} 
              className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-3.5 text-xs font-black text-white shadow-lg shadow-violet-950/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-violet-600/10 active:scale-98 disabled:opacity-50"
            >
              {submitting ? "Публикация..." : "Опубликовать отзыв"}
            </button>
          </form>
        ) : user ? (
          <div className="text-center py-4 space-y-1">
            <p className="text-xs font-bold text-zinc-300">Вы уже оставили отзыв на свой последний заказ</p>
            <p className="text-[11px] text-zinc-500">Для каждого купленного товара можно оставить по одному отзыву.</p>
          </div>
        ) : (
          <div className="text-center py-4 text-xs font-medium text-zinc-400">
            <Link href="/login" className="text-violet-400 font-bold hover:underline">Войдите в аккаунт</Link>, чтобы оставить отзыв после покупки
          </div>
        )}
      </div>

      {/* ЛЕНТА ОТЗЫВОВ */}
      {loadingReviews ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ReviewSkeleton />
          <ReviewSkeleton />
          <ReviewSkeleton />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-3xl border border-zinc-900 bg-zinc-900/10 p-12 text-center text-xs text-zinc-500 font-medium">
          Пока нет отзывов — станьте первым покупателем, оставившим мнение!
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, visibleCount).map((review, index) => (
              <div 
                key={review.id} 
                className="animate-review-card rounded-3xl border border-zinc-900 bg-zinc-900/30 backdrop-blur-md p-5 transition-all duration-300 hover:border-violet-500/30 hover:bg-zinc-900/50 flex flex-col justify-between"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 font-black uppercase text-white shadow-md shadow-violet-950/20 text-xs">
                      {review.user_email?.[0] || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-zinc-200 text-xs truncate">{review.user_email?.split("@")[0] || "Пользователь"}</span>
                        <span className="text-[10px] font-semibold text-zinc-600 shrink-0">{formatDate(review.created_at)}</span>
                      </div>
                      <div className="mt-0.5"><Stars value={review.rating} /></div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium break-words pt-1">{review.text}</p>
                </div>
              </div>
            ))}
          </div>

          {visibleCount < reviews.length && (
            <div className="mt-8 text-center">
              <button 
                onClick={() => setVisibleCount((prev) => prev + 6)} 
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-6 py-3 text-xs font-black text-zinc-300 transition-all duration-300 hover:border-violet-500/40 hover:bg-zinc-900 hover:text-white active:scale-95 shadow-sm"
              >
                Показать ещё отзывы
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}