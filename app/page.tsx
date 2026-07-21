import GameCard from "./components/GameCard";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ReviewsSection from "./components/ReviewsSection";
import OwnerBanner from "./components/OwnerBanner";
import { games } from "./data/games";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-zinc-950 text-white flex flex-col selection:bg-violet-500/30 overflow-x-hidden">
      
      {/* ИНЖЕКТ CSS-АНИМАЦИЙ ДВИЖЕНИЯ ФОНА И КАРТОЧЕК */}
      <style>{`
        @keyframes float-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(70px, -40px) scale(1.1); }
          66% { transform: translate(-40px, 60px) scale(0.95); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-80px, 50px) scale(1.15); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          40% { transform: translate(50px, 80px) scale(0.9); }
        }
        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-card-fade {
          animation: cardFadeIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
      `}</style>

      {/* УЛЬТРА-ПЛАВНЫЙ ЛЕТАЮЩИЙ НЕОНОВЫЙ ФОН */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-zinc-950">
        <div 
          className="absolute left-[-5%] top-[-5%] h-[700px] w-[700px] rounded-full bg-violet-600/30 blur-[150px] mix-blend-screen" 
          style={{ animation: 'float-1 22s infinite linear' }}
        />
        <div 
          className="absolute right-[-5%] top-[25%] h-[600px] w-[600px] rounded-full bg-blue-500/25 blur-[140px] mix-blend-screen" 
          style={{ animation: 'float-2 28s infinite linear' }}
        />
        <div 
          className="absolute left-[10%] bottom-[-10%] h-[650px] w-[650px] rounded-full bg-fuchsia-500/25 blur-[150px] mix-blend-screen" 
          style={{ animation: 'float-3 25s infinite linear' }}
        />
      </div>

      {/* КОНТЕНТ САЙТА */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <OwnerBanner />
        
        {/* Компонент главного экрана (вся верстка с кнопкой теперь живет внутри него, либо управляется им) */}
        <Hero />

        {/* Секция Игр */}
        <section
          id="games"
          className="mx-auto max-w-7xl w-full px-4 pb-16 sm:px-6 sm:pb-24 scroll-mt-24"
        >
          <h3 className="mb-8 text-2xl font-black tracking-tight sm:text-3xl text-zinc-100">
            Популярные игры
          </h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
            {games.map((game, index) => (
              <div 
                key={game.slug}
                className="animate-card-fade"
                style={{ animationDelay: `${index * 50}ms` }} // Карточки вылетают по очереди
              >
                <GameCard
                  name={game.name}
                  image={game.image}
                  price={game.products[0]?.priceDisplay ?? ""}
                  popular={false}
                  slug={game.slug}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Секция Отзывов */}
        <div id="reviews" className="scroll-mt-24">
          <ReviewsSection />
        </div>

        <Footer />
      </div>
    </main>
  );
}