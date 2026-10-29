// Product Catalog Data for Ethio-Mercato VIP Platform
const PRODUCTS_DATA = [
  {
    id: 1,
    vip_level: 1,
    name: "Rolex Submariner VIP1",
    amharic_name: "ሮሌክስ ሳብማሪነር ቪአይፒ 1",
    price: 700,
    daily_income: 42,
    period_days: 90,
    total_return: 3780,
    image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80",
    badge: "Most Popular",
    color: "from-blue-600 to-indigo-700",
    description: "Ideal starter VIP tier for quick daily profit accumulation in Ethiopian Birr."
  },
  {
    id: 2,
    vip_level: 2,
    name: "Rolex Datejust VIP2",
    amharic_name: "ሮሌክስ ዴትጀስት ቪአይፒ 2",
    price: 2000,
    daily_income: 130,
    period_days: 90,
    total_return: 11700,
    image_url: "https://images.unsplash.com/photo-1547996160-71dfabbce5d7?w=600&auto=format&fit=crop&q=80",
    badge: "Hot 🔥",
    color: "from-emerald-600 to-teal-800",
    description: "Classic luxury model offering steady 6.5% daily cashback revenue for 90 days."
  },
  {
    id: 3,
    vip_level: 3,
    name: "Rolex Daytona VIP3",
    amharic_name: "ሮሌክስ ዴይቶና ቪአይፒ 3",
    price: 5000,
    daily_income: 350,
    period_days: 90,
    total_return: 31500,
    image_url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80",
    badge: "High Yield",
    color: "from-amber-500 to-yellow-700",
    description: "High-yield investment package yielding 350 ETB direct cash payout every single day."
  },
  {
    id: 4,
    vip_level: 4,
    name: "Rolex GMT-Master VIP4",
    amharic_name: "ሮሌክስ ጂኤምቲ-ማስተር ቪአይፒ 4",
    price: 10000,
    daily_income: 750,
    period_days: 90,
    total_return: 67500,
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    badge: "Super Return",
    color: "from-purple-600 to-pink-700",
    description: "Exceptional returns tailored for serious investors with high daily payouts."
  },
  {
    id: 5,
    vip_level: 5,
    name: "Rolex Sky-Dweller VIP5",
    amharic_name: "ሮሌክስ ስካይ-ድዌለር ቪአይፒ 5",
    price: 20000,
    daily_income: 1600,
    period_days: 90,
    total_return: 144000,
    image_url: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=600&auto=format&fit=crop&q=80",
    badge: "VIP Elite",
    color: "from-rose-600 to-red-800",
    description: "Premium investment package unlocking premier support and maximum daily yield."
  },
  {
    id: 6,
    vip_level: 6,
    name: "Rolex Day-Date Gold VIP6",
    amharic_name: "ሮሌክስ ጎልድ ፕሬዝደንት ቪአይፒ 6",
    price: 50000,
    daily_income: 4250,
    period_days: 90,
    total_return: 382500,
    image_url: "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=600&auto=format&fit=crop&q=80",
    badge: "Ultimate Crown",
    color: "from-amber-600 to-orange-800",
    description: "Top-tier flagship package providing 4,250 ETB every 24 hours into your wallet."
  }
];

// Preset deposit amounts for Screen 7 & 8
const DEPOSIT_PRESETS = [700, 1000, 2000, 5000, 10000, 20000, 50000];

// Official payment accounts (Screen 9)
const OFFICIAL_PAYMENT_GATEWAYS = {
  telebirr: {
    id: "telebirr",
    title: "Telebirr (ቴሌብር)",
    name: "Shibabew",
    account: "0943257056",
    account_label: "Phone Number (ስልክ ቁጥር)",
    color: "#0072bc",
    badge_bg: "bg-blue-50 text-blue-700 border-blue-200",
    icon_svg: `<svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>`,
    instructions: "Transfer the exact amount to the Telebirr phone number above. Take a full screenshot of the completed transfer SMS or app receipt."
  },
  cbe: {
    id: "cbe",
    title: "Commercial Bank of Ethiopia (CBE / ንግድ ባንክ)",
    name: "Alehegn",
    account: "1000331894994",
    account_label: "Account Number (የሂሳብ ቁጥር)",
    color: "#6b1480",
    badge_bg: "bg-purple-50 text-purple-700 border-purple-200",
    icon_svg: `<svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24"><path d="M4 10h3v7H4zM10.5 10h3v7h-3zM2 22h19v-3H2v3zm15-12h3v7h-3zm-5-9L2 6v2h19V6l-9.5-5z"/></svg>`,
    instructions: "Send via CBE Birr or CBE Mobile Banking to the account above. Upload the transaction slip screenshot."
  },
  abyssinia: {
    id: "abyssinia",
    title: "Bank of Abyssinia (አቢሲኒያ ባንክ)",
    name: "Alehegn",
    account: "157312097",
    account_label: "Account Number (የሂሳብ ቁጥር)",
    color: "#f59e0b",
    badge_bg: "bg-amber-50 text-amber-800 border-amber-200",
    icon_svg: `<svg class="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 24 24"><path d="M11.5 1L2 6v2h19V6m-5 4h3v7h-3M4 10h3v7H4m6.5-7h3v7h-3M2 22h19v-3H2v3z"/></svg>`,
    instructions: "Transfer to Bank of Abyssinia using BoA mobile app. Ensure the name shows Alehegn before transferring."
  }
};

