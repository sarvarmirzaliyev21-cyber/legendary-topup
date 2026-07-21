export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-900 bg-zinc-950/40 backdrop-blur-md px-4 py-10 text-zinc-400 sm:px-6 relative z-10 select-none">
      <div className="mx-auto max-w-7xl">
        <h2 className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-xl font-bold text-transparent">
          LegendaryTopUp
        </h2>
        <p className="mt-2 max-w-xs text-sm text-zinc-500">
          Быстрое и безопасное пополнение игр и сервисов.
        </p>
      </div>

      <p className="mx-auto mt-10 max-w-7xl border-t border-zinc-900/40 pt-6 text-center text-xs text-zinc-600 font-medium">
        © {new Date().getFullYear()} LegendaryTopUp. Все права защищены.
      </p>
    </footer>
  );
}