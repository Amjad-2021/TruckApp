// ─── App-wide constants ────────────────────────────────────────────────────────

export const PLATFORM_FEE_PERCENT = 3; // 3% commission taken by TruckLink

export const TRUCK_TYPES = [
  { id: 'flatbed',      ar: 'مسطح',          en: 'Flatbed',       icon: '🚛' },
  { id: 'refrigerated', ar: 'مبرد',           en: 'Refrigerated',  icon: '❄️' },
  { id: 'tanker',       ar: 'صهريج',          en: 'Tanker',        icon: '🛢️' },
  { id: 'container',    ar: 'حاويات',         en: 'Container',     icon: '📦' },
  { id: 'curtainsider', ar: 'ستائر جانبية',   en: 'Curtainsider',  icon: '🚚' },
  { id: 'tipper',       ar: 'قلاب',           en: 'Tipper/Dump',   icon: '🪣' },
];

export const CARGO_TYPES = [
  { en: 'General Goods',        ar: 'بضائع عامة'         },
  { en: 'Food & Beverages',     ar: 'أغذية ومشروبات'     },
  { en: 'Machinery & Equipment',ar: 'آلات ومعدات'        },
  { en: 'Building Materials',   ar: 'مواد بناء'          },
  { en: 'Chemicals',            ar: 'مواد كيميائية'      },
  { en: 'Livestock',            ar: 'مواشي'              },
  { en: 'Furniture',            ar: 'أثاث'               },
  { en: 'Electronics',          ar: 'إلكترونيات'         },
  { en: 'Clothing & Textiles',  ar: 'ملابس ومنسوجات'     },
  { en: 'Other',                ar: 'أخرى'               },
];

// Saudi Arabia major cities
export const CITIES = [
  { id: 'riyadh',   ar: 'الرياض',          en: 'Riyadh',     lat: 24.7136, lng: 46.6753 },
  { id: 'jeddah',   ar: 'جدة',             en: 'Jeddah',     lat: 21.4858, lng: 39.1925 },
  { id: 'dammam',   ar: 'الدمام',          en: 'Dammam',     lat: 26.4207, lng: 50.0888 },
  { id: 'makkah',   ar: 'مكة المكرمة',     en: 'Makkah',     lat: 21.3891, lng: 39.8579 },
  { id: 'madinah',  ar: 'المدينة المنورة', en: 'Madinah',    lat: 24.5247, lng: 39.5692 },
  { id: 'taif',     ar: 'الطائف',          en: 'Taif',       lat: 21.2703, lng: 40.4158 },
  { id: 'tabuk',    ar: 'تبوك',            en: 'Tabuk',      lat: 28.3838, lng: 36.5550 },
  { id: 'abha',     ar: 'أبها',            en: 'Abha',       lat: 18.2164, lng: 42.5053 },
  { id: 'khobar',   ar: 'الخبر',           en: 'Al Khobar',  lat: 26.2172, lng: 50.1971 },
  { id: 'buraidah', ar: 'بريدة',           en: 'Buraidah',   lat: 26.3260, lng: 43.9750 },
  { id: 'sakaka',   ar: 'سكاكا',           en: 'Sakaka',     lat: 29.9697, lng: 40.2064 },
  { id: 'hail',     ar: 'حائل',            en: 'Hail',       lat: 27.5219, lng: 41.7057 },
  { id: 'jizan',    ar: 'جازان',           en: 'Jizan',      lat: 16.8892, lng: 42.5511 },
  { id: 'najran',   ar: 'نجران',           en: 'Najran',     lat: 17.4920, lng: 44.1277 },
  { id: 'yanbu',    ar: 'ينبع',            en: 'Yanbu',      lat: 24.0895, lng: 38.0618 },
];

export const LOAD_STATUS = {
  OPEN:       'open',       // waiting for driver
  NEGOTIATING:'negotiating',// price negotiation in progress
  CONFIRMED:  'confirmed',  // deal confirmed, awaiting pickup
  IN_TRANSIT: 'in_transit', // truck on the road
  DELIVERED:  'delivered',  // completed
  CANCELLED:  'cancelled',
};

export const COLORS = {
  primary:    '#8B5E3C',   // warm chestnut brown  — headers, buttons, tabs
  secondary:  '#C49A45',   // golden amber          — badges, accents
  success:    '#5A8A5A',   // muted sage green      — confirmed / delivered
  danger:     '#C0392B',   // warm red              — errors, cancel
  warning:    '#D4A843',   // golden yellow         — warnings
  bg:         '#FBF7F0',   // warm cream            — screen backgrounds
  card:       '#FFFFFF',   // white                 — cards
  text:       '#3D2410',   // deep warm brown       — body text
  subtext:    '#8B7255',   // mid warm brown        — secondary labels
  border:     '#E8DDD0',   // sand beige            — dividers & outlines
  mapOverlay: 'rgba(139,94,60,0.15)',  // warm brown map tint
};
