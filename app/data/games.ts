// ============================================================
// Конфигурация цен (в рублях)
// ============================================================
// Курс для конвертации ₽ → сум при оплате картой (обнови при изменении курса)
export const EXCHANGE_RATE_UZS_PER_RUB = 157;

function product(name: string, priceRub: number) {
  return { name, price: priceRub, priceDisplay: `${priceRub} ₽` };
}

// ============================================================
// Данные игр
// ============================================================
export const games = [
  {
    name: "PUBG Mobile",
    slug: "pubg-mobile",
    image: "/games/pubg.jpg",
    price: "96 ₽",
    popular: true,
    fields: [{ label: "PUBG ID", placeholder: "Введите PUBG ID" }],
    products: [
      { ...product("60 UC", 1), promo: true },
      product("300 + 25 UC", 479),
      product("600 + 60 UC", 1031),
      product("1500 + 300 UC", 2567),
    ],
  },

  {
    name: "Brawl Stars",
    slug: "brawl-stars",
    image: "/games/br.jpg",
    price: "176 ₽",
    popular: false,
    fields: [{ label: "Player Tag", placeholder: "Введите #тег игрока" }],
    products: [
      { ...product("30 Gems", 1), promo: true },
      product("80 Gems", 443),
      product("170 Gems", 887),
      product("360 Gems", 1835),
    ],
  },

  {
    name: "Black Russia",
    slug: "black-russia",
    image: "/games/blackrussia.jpg",
    price: "584 ₽",
    popular: false,
    fields: [
      { label: "Никнейм", placeholder: "Введите ваш ник" },
      { label: "Сервер", placeholder: "Введите сервер" },
    ],
    products: [
      { ...product("100 BC", 1), promo: true },
      product("250 BC", 1462),
      product("500 BC", 2924),
      product("1000 BC", 5847),
    ],
  },

  {
    name: "Mobile Legends",
    slug: "mobile-legends",
    image: "/games/mlbb.jpg",
    price: "136 ₽",
    popular: true,
    fields: [
      { label: "ID игрока", placeholder: "Введите ID" },
      { label: "Server ID", placeholder: "Введите Server ID" },
    ],
    products: [
      { ...product("86 Diamonds", 1), promo: true },
      product("257 Diamonds", 384),
      product("706 Diamonds", 1055),
      product("2195 Diamonds", 3191),
    ],
  },

  {
    name: "Standoff 2",
    slug: "standoff-2",
    image: "/games/standoff.jpg",
    price: "219 ₽",
    popular: false,
    fields: [{ label: "ID игрока", placeholder: "Введите ID Standoff 2" }],
    products: [
      { ...product("100 Gold", 1), promo: true },
      product("500 Gold", 804),
      product("1000 Gold", 1608),
      product("3000 Gold", 4385),
    ],
  },

  {
    name: "Free Fire",
    slug: "free-fire",
    image: "/games/freefire.jpg",
    price: "86 ₽",
    popular: false,
    fields: [{ label: "UID", placeholder: "Введите UID Free Fire" }],
    products: [
      { ...product("100 Diamonds", 1), promo: true },
      product("310 Diamonds", 278),
      product("520 Diamonds", 450),
      product("1060 Diamonds", 911),
    ],
  },

  {
    name: "Genshin Impact",
    slug: "genshin-impact",
    image: "/games/genshin.jpg",
    price: "511 ₽",
    popular: true,
    fields: [
      { label: "UID", placeholder: "Введите UID" },
      { label: "Сервер", placeholder: "Asia / Europe / America" },
    ],
    products: [
      product("300 Genesis Crystals", 511),
      product("980 Genesis Crystals", 1584),
      product("1980 Genesis Crystals", 3180),
      product("3280 Genesis Crystals", 5346),
    ],
  },

  {
    name: "FC Mobile",
    slug: "fc-mobile",
    image: "/games/fcmobile.jpg",
    price: "91 ₽",
    popular: false,
    fields: [{ label: "UID", placeholder: "Введите UID" }],
    products: [
      { ...product("100 FC Points", 1), promo: true },
      product("520 FC Points", 433),
      product("1070 FC Points", 899),
      product("2200 FC Points", 1775),
      product("5750 FC Points", 4463),
      product("12000 FC Points", 8903),
    ],
  },

  {
    name: "Fortnite",
    slug: "fortnite",
    image: "/games/fortnite.jpg",
    price: "517 ₽",
    popular: false,
    fields: [{ label: "Epic Games ID", placeholder: "Введите Epic Games ID" }],
    products: [
      product("800 V-Bucks", 517),
      product("2400 V-Bucks", 1295),
      product("4500 V-Bucks", 2087),
      product("12500 V-Bucks", 5207),
    ],
  },

  {
    name: "Telegram Premium",
    slug: "telegram-premium",
    image: "/games/telegram.jpg",
    price: "1379 ₽",
    popular: false,
    fields: [{ label: "Telegram Username", placeholder: "@username" }],
    products: [
      product("3 месяца", 1379),
      product("6 месяцев", 1835),
      product("12 месяцев", 3323),
    ],
  },

  {
    name: "Stumble Guys",
    slug: "stumble-guys",
    image: "/games/stumble.jpg",
    price: "72 ₽",
    popular: false,
    fields: [{ label: "ID игрока", placeholder: "Введите ID" }],
    products: [
      { ...product("250 Gems", 1), promo: true },
      product("800 Gems", 199),
      product("1600 Gems", 307),
      product("5000 Gems", 731),
    ],
  },
];