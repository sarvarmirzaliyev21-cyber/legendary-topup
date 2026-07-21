import { Suspense } from "react";
import CheckoutContent from "../components/CheckoutContent";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 text-white">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-violet-500" />
          <p className="text-sm text-zinc-400">Загрузка...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}