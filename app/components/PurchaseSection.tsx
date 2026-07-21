"use client";

import { useState } from "react";
import Link from "next/link";

type Field = {
  label: string;
  placeholder: string;
};

type Product = {
  name: string;
  price: number;
  priceDisplay: string;
};

type PurchaseSectionProps = {
  gameName: string;
  fields: Field[];
  products: Product[];
};

export default function PurchaseSection({
  gameName,
  fields,
  products,
}: PurchaseSectionProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);

  function handleFieldChange(label: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [label]: value }));
  }

  function buildPlayerInfo() {
    return fields
      .map((f) => `${f.label}: ${fieldValues[f.label] ?? ""}`)
      .join(", ");
  }

  return (
    <>
      {/* КЛИЕНТСКИЕ СТИЛИ ДЛЯ ИДЕАЛЬНОЙ ПЛАВНОСТИ КНОПКИ */}
      <style>{`
        @keyframes purchaseBtnIn {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-purchase-btn {
          animation: purchaseBtnIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
      `}</style>

      {/* Поля ввода данных */}
      <div className="mt-8 space-y-5 sm:mt-10">
        {fields.map((field) => (
          <div key={field.label}>
            <label className="mb-2 block text-sm font-semibold text-zinc-300 tracking-wide">
              {field.label}
            </label>

            <input
              placeholder={field.placeholder}
              value={fieldValues[field.label] ?? ""}
              onChange={(e) => handleFieldChange(field.label, e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-white outline-none backdrop-blur-md transition-all duration-300 focus:border-violet-500 focus:bg-zinc-900/60 focus:ring-4 focus:ring-violet-500/10 placeholder-zinc-600"
            />
          </div>
        ))}
      </div>

      {/* Выбор товаров */}
      <div className="mt-8 sm:mt-10">
        <h2 className="mb-5 text-xl font-bold sm:text-2xl tracking-tight text-zinc-100">
          Выберите пополнение
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {products.map((product) => {
            const isSelected = selected === product.name;
            return (
              <button
                key={product.name}
                onClick={() => setSelected(product.name)}
                className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 sm:p-5 select-none active:scale-[0.98] ${
                  isSelected
                    ? "border-violet-500 bg-violet-600/10 shadow-[0_0_25px_rgba(124,58,237,0.15)]"
                    : "border-zinc-900 bg-zinc-900/40 hover:border-zinc-700/80 hover:bg-zinc-900/60"
                }`}
              >
                {/* Мягкий градиент на фоне карточки при ховере */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold sm:text-lg text-zinc-200 group-hover:text-white transition-colors">
                      {product.name}
                    </h3>
                    <p className={`mt-1 font-extrabold text-base transition-colors ${isSelected ? "text-violet-400" : "text-zinc-400 group-hover:text-violet-400"}`}>
                      {product.priceDisplay}
                    </p>
                  </div>

                  {/* Стеклянная кастомная галочка */}
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isSelected 
                      ? "border-violet-500 bg-violet-500 text-white scale-100 rotate-0" 
                      : "border-zinc-700 bg-transparent scale-90 opacity-0 group-hover:opacity-40 group-hover:scale-95"
                  }`}>
                    <span className="text-xs font-black">✓</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Кнопка действия "Купить" с ультра-плавным вылетом */}
        {selected && (
          <Link
            href={(() => {
              const product = products.find((p) => p.name === selected)!;
              return `/checkout?game=${encodeURIComponent(
                gameName
              )}&product=${encodeURIComponent(
                product.name
              )}&price=${encodeURIComponent(
                product.priceDisplay
              )}&priceUsd=${product.price}&playerInfo=${encodeURIComponent(
                buildPlayerInfo()
              )}`;
            })()}
            className="animate-purchase-btn mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-500 p-4 text-center text-lg font-bold text-white shadow-xl shadow-violet-950/40 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_15px_35px_rgba(124,58,237,0.3)] active:scale-[0.99] overflow-hidden group relative"
          >
            <span className="relative z-10 flex items-center gap-2">
              Купить за {products.find((p) => p.name === selected)?.priceDisplay}
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>

            {/* Эффект блика при наведении */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-shimmer" />
          </Link>
        )}
      </div>
    </>
  );
}