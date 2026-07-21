// ============================================================
// Конфигурация цен
// ============================================================
export const EXCHANGE_RATE_UZS_PER_USD = 12100;
export const MARKUP = 0.15; // Стандартная наценка 15% для остальных игр

// Расчёт стандартной цены (15%) из сумов
function toUsd(priceInSum: number) {
  const base = priceInSum / EXCHANGE_RATE_UZS_PER_USD;
  const withMarkup = base * (1 + MARKUP);
  return Math.round(withMarkup * 100) / 100;
}

export function formatPrice(amountUsd: number) {
  return `$${amountUsd.toFixed(2)}`;
}

function product(name: string, priceInSum: number) {
  const price = toUsd(priceInSum);
  return { name, price, priceDisplay: formatPrice(price) };
}

// Отдельная функция для прямого указания фиксированных цен в $
function productFixed(name: string, priceUsd: number) {
  return { name, price: priceUsd, priceDisplay: formatPrice(priceUsd) };
}

// ============================================================
// Данные игр
// ============================================================
export const games = [
  {
    name: "PUBG Mobile",
    slug: "pubg-mobile",
    image: "/games/pubg.jpg",
    fields: [
      { label: "Player ID", placeholder: "Введите ваш числовой Player ID" },
      { label: "Игровой никнейм", placeholder: "Введите ваш ник в игре" },
    ],
    products: [
      productFixed("60 UC 🪙", 2.05),
      productFixed("300 + 25 UC 🪙", 10.84),
      productFixed("600 + 60 UC 🪙", 18.25),
      productFixed("1500 + 300 UC 🪙", 42.20),
      productFixed("3000 + 850 UC 🪙", 84.35),
      productFixed("6000 + 2100 UC 🪙", 168.50),
      productFixed("Elite Pass LVL1-100 👑", 20.99),
      productFixed("Elite Pass Plus LVL1-100 ➕", 48.50),
      productFixed("Elite Pass LVL1-50 🎫", 13.25),
      productFixed("First Purchase Pack 🎁", 2.05),
      productFixed("Mythic Emblem Pack 💎", 10.85),
      productFixed("Upgradable Firearm Materials Pack 📦", 6.25),
      productFixed("Weekly Deal Pack 1 📅", 2.05),
      productFixed("Weekly Deal Pack 2 📅", 6.35),
      productFixed("Weekly Mythic Emblem Value Pack 🌟", 6.35),
      productFixed("Prime (1 месяц) 💎", 2.05),
      productFixed("Prime (3 месяца) 💎", 6.25),
      productFixed("Prime (6 месяцев) 💎", 12.95),
      productFixed("Prime (12 месяцев) 💎", 20.50),
      productFixed("Prime Plus (1 Month) ⭐", 17.25),
      productFixed("Prime Plus (3 Months) ⭐", 47.50),
      productFixed("Prime Plus (6 Months) ⭐", 94.99),
      productFixed("Prime Plus (12 Months) ⭐", 189.99),
    ],
  },

  {
    name: "Brawl Stars",
    slug: "brawl-stars",
    image: "/games/br.jpg",
    fields: [
      { label: "Supercell ID (Email)", placeholder: "Введите вашу почту от Supercell ID" },
    ],
    products: [
      productFixed("30 Gems", 2.28),
      productFixed("80 Gems", 5.70),
      productFixed("170 Gems", 10.84),
      productFixed("360 Gems", 21.67),
      productFixed("950 Gems", 56.98),
      productFixed("2000 Gems", 112.13),
      productFixed("4000 Gems", 224.09),
      productFixed("6000 Gems", 336.24),
    ],
  },

  {
    name: "Black Russia",
    slug: "black-russia",
    image: "/games/blackrussia.jpg",
    fields: [
      { label: "Никнейм", placeholder: "Введите ваш ник" },
      { label: "Сервер", placeholder: "Введите сервер" },
    ],
    products: [
      product("100 BC", 80000),
      product("250 BC", 200000),
      product("500 BC", 400000),
      product("1000 BC", 800000),
    ],
  },

  {
    name: "Mobile Legends",
    slug: "mobile-legends",
    image: "/games/mlbb.jpg",
    fields: [
      { label: "ID игрока", placeholder: "Введите ID" },
      { label: "Server ID", placeholder: "Введите Server ID" },
    ],
    products: [
      product("86 Diamonds", 50000),
      product("257 Diamonds", 130000),
      product("706 Diamonds", 320000),
      product("2195 Diamonds", 900000),
    ],
  },

  {
    name: "Standoff 2",
    slug: "standoff-2",
    image: "/games/standoff.jpg",
    fields: [{ label: "ID игрока", placeholder: "Введите ID Standoff 2" }],
    products: [
      product("100 Gold", 30000),
      product("500 Gold", 110000),
      product("1000 Gold", 220000),
      product("3000 Gold", 600000),
    ],
  },

  {
    name: "Free Fire",
    slug: "free-fire",
    image: "/games/freefire.jpg",
    fields: [{ label: "UID", placeholder: "Введите UID Free Fire" }],
    products: [
      product("100 Diamonds", 30000),
      product("310 Diamonds", 80000),
      product("520 Diamonds", 130000),
      product("1060 Diamonds", 250000),
    ],
  },

  {
    name: "Genshin Impact",
    slug: "genshin-impact",
    image: "/games/genshin.jpg",
    fields: [
      { label: "UID", placeholder: "Введите UID" },
      { label: "Сервер", placeholder: "Asia / Europe / America" },
    ],
    products: [
      product("300 Genesis Crystals", 110000),
      product("980 Genesis Crystals", 330000),
      product("1980 Genesis Crystals", 650000),
      product("3280 Genesis Crystals", 1050000),
    ],
  },

  {
    name: "FC Mobile",
    slug: "fc-mobile",
    image: "/games/fcmobile.jpg",
    notice: "⚠️ После оплаты, когда вам на электронную почту придёт код подтверждения (2FA), передайте его в службу поддержки для завершения пополнения!",
    fields: [
      { label: "Почта (Gmail / EA Account)", placeholder: "example@gmail.com" },
    ],
    products: [
      productFixed("100 FC Points", 1.29),
      productFixed("520 FC Points", 5.99),
      productFixed("1070 FC Points", 11.99),
      productFixed("2200 FC Points", 22.99),
      productFixed("5750 FC Points", 54.99),
      productFixed("12000 FC Points", 109.99),
    ],
  },

  {
    name: "Fortnite",
    slug: "fortnite",
    image: "/games/fortnite.jpg",
    fields: [{ label: "Epic Games ID", placeholder: "Введите Epic Games ID" }],
    products: [
      productFixed("800 V-Bucks", 5.99),
      productFixed("2400 V-Bucks", 14.99),
      productFixed("4500 V-Bucks", 23.99),
      productFixed("12500 V-Bucks", 59.99),
      productFixed("25000 V-Bucks (12500*2)", 114.99),
      productFixed("37500 V-Bucks (12500*3)", 169.99),
      productFixed("75000 V-Bucks (12500*6)", 329.99),
    ],
  },

  {
    name: "Telegram Premium",
    slug: "telegram-premium",
    image: "/games/telegram.jpg",
    fields: [{ label: "Telegram Username", placeholder: "@username" }],
    products: [
      product("3 месяца", 650000),
      product("6 месяцев", 1200000),
      product("12 месяцев", 2300000),
    ],
  },

  {
    name: "Stumble Guys",
    slug: "stumble-guys",
    image: "/games/stumble.jpg",
    fields: [{ label: "Игровой никнейм", placeholder: "Введите ваш ник в Stumble Guys" }],
    products: [
      product("250 Gems", 30000),
      product("800 Gems", 80000),
      product("1600 Gems", 150000),
      product("5000 Gems", 400000),
    ],
  },
];