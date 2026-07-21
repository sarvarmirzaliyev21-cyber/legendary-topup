"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();

  const tabs = [
    { label: "Заказы", href: "/admin" },
    { label: "Поддержка", href: "/admin/support" },
  ];

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
      <Link
        href="/"
        className="flex items-center gap-1.5 text-sm font-semibold text-zinc-400 transition hover:text-violet-400"
      >
        ← На сайт
      </Link>

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
              pathname === tab.href
                ? "border-violet-500 bg-violet-600"
                : "border-zinc-700 hover:bg-zinc-900"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}