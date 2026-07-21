export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-transparent px-4 py-20 text-white sm:px-6 sm:py-28">
      <div className="relative mx-auto max-w-6xl text-center">
        
        {/* Бейдж "Онлайн" */}
        <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300 backdrop-blur sm:text-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Онлайн — заказы обрабатываются моментально
        </div>

        <h2 className="animate-fade-in text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl">
          Legendary
          <span className="bg-gradient-to-r from-violet-400 via-violet-500 to-blue-400 bg-clip-text text-transparent ml-2 md:ml-4">
            TopUp
          </span>
        </h2>

        <p className="animate-fade-in mx-auto mt-6 max-w-2xl text-base text-zinc-400 sm:text-xl">
          Быстрое пополнение любимых игр.
          <br />
          Игровая валюта за несколько минут.
        </p>

        <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-3">
          {/* Карточка: Быстро */}
          <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-[0_10px_30px_rgba(124,58,237,0.1)]">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-violet-500/0 transition-all duration-300 group-hover:from-violet-500/10 group-hover:to-transparent" />
            <div className="relative">
              <span className="text-2xl block transition-transform duration-300 group-hover:scale-110">⚡</span>
              <p className="mt-3 font-semibold">Быстро</p>
              <p className="mt-1 text-sm text-zinc-400">Моментальная обработка заказов</p>
            </div>
          </div>

          {/* Карточка: Безопасно */}
          <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-[0_10px_30px_rgba(124,58,237,0.1)]">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-violet-500/0 transition-all duration-300 group-hover:from-violet-500/10 group-hover:to-transparent" />
            <div className="relative">
              <span className="text-2xl block transition-transform duration-300 group-hover:scale-110">🔒</span>
              <p className="mt-3 font-semibold">Безопасно</p>
              <p className="mt-1 text-sm text-zinc-400">Защита ваших данных</p>
            </div>
          </div>

          {/* Карточка: Выгодно */}
          <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-[0_10px_30px_rgba(124,58,237,0.1)]">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-violet-500/0 transition-all duration-300 group-hover:from-violet-500/10 group-hover:to-transparent" />
            <div className="relative">
              <span className="text-2xl block transition-transform duration-300 group-hover:scale-110">💎</span>
              <p className="mt-3 font-semibold">Выгодно</p>
              <p className="mt-1 text-sm text-zinc-400">Лучшие цены</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}