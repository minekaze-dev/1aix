
import { Brand, City, Category, ThreadCategory, Smartphone } from './types';

export const BRANDS: Brand[] = [
  "Samsung", "Xiaomi", "Apple", "Oppo", "Vivo", "Realme", "Infinix", "Poco", "Tecno", "Itel", "Asus", "Redmagic", "Honor", "Motorola", "Huawei", "Iqoo"
];

export const CITIES: (City | 'All')[] = ["All", "Jakarta", "Bogor", "Depok", "Tangerang", "Bekasi"];
export const CATEGORIES: (Category | 'All')[] = ["All", "Transport", "Wisata", "Belanja", "Kuliner", "Umum"];
export const THREAD_CATEGORIES: (ThreadCategory | 'All')[] = ["All", "Umum", "Kuliner", "Transportasi", "Lowongan Kerja", "Hiburan"];

export const QUICK_SUGGESTIONS = [
  { text: "Berapa harganya?" },
  { text: "Apakah ready stok?" },
  { text: "Speknya apa saja?" },
  { text: "Terima kasih infonya!" }
];

export const PRICE_RANGES = [
  { label: "< 2 Juta", min: 0, max: 2000000 },
  { label: "2 - 5 Juta", min: 2000000, max: 5000000 },
  { label: "5 - 10 Juta", min: 5000000, max: 10000000 },
  { label: "> 10 Juta", min: 10000000, max: 999999999 },
];

export const NEWS_UPDATES = [
  "REGION INDONESIA TERSEDIA UNTUK XIAOMI 13T",
  "SAMSUNG GALAXY A55 5G MULAI TERIMA SECURITY PATCH MEI 2024",
  "OPPO RENO 11 SERIES UPDATE COLOROS 14 STABIL DI INDONESIA",
  "POCO F6 PRO LOLOS TKDN DENGAN SKOR 36.5%"
];

export const TOP_BRANDS = [
  { name: "SAMSUNG", share: "29.8%", trend: "up" },
  { name: "OPPO", share: "17.4%", trend: "up" },
  { name: "IPHONE", share: "14.2%", trend: "up" },
  { name: "XIAOMI", share: "13.5%", trend: "up" },
  { name: "VIVO", share: "11.2%", trend: "up" },
  { name: "REALME", share: "7.9%", trend: "up" },
  { name: "INFINIX", share: "3.2%", trend: "up" },
  { name: "LAINNYA", share: "2.8%", trend: "up" },
];

export const DUMMY_SMARTPHONES: Smartphone[] = [
  {
    id: "dummy-s24u",
    brand: "Samsung",
    model_name: "Galaxy S24 Ultra",
    release_status: "Tersedia",
    launch_date_indo: "2024-01-18",
    tkdn_score: 35.5,
    chipset: "Snapdragon 8 Gen 3 for Galaxy",
    ram_storage: "12GB / 256GB",
    price_srp: 21999000,
    image_url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=400",
    official_store_link: "https://www.samsung.com/id/smartphones/galaxy-s24-ultra/",
    model_code: "SM-S928B",
    dimensions_weight: "162.3 x 79 x 8.6 mm / 232 g",
    material: "Titanium frame, Gorilla Glass Armor (depan/belakang)",
    colors: "Titanium Black, Titanium Gray, Titanium Violet, Titanium Yellow, Titanium Blue, Titanium Green, Titanium Orange",
    network: "GSM / HSPA / LTE / 5G",
    wifi: "Wi-Fi 802.11 a/b/g/n/ac/6e/7, tri-band, Wi-Fi Direct",
    display_type: "6.8\" Dynamic LTPO AMOLED 2X, 120Hz, HDR10+, 2600 nits",
    os: "Android 14, One UI 6.1",
    cpu: "Octa-core (1x3.39GHz Cortex-X4 & 3x3.1GHz Cortex-A720 & 2x2.9GHz Cortex-A720 & 2x2.2GHz Cortex-A520)",
    gpu: "Adreno 750 (1 GHz)",
    camera_main: "200MP (wide) + 50MP (periscope tele) + 10MP (tele) + 12MP (ultrawide)",
    camera_video_main: "8K@24/30fps, 4K@30/60/120fps, 1080p@30/60/240fps, HDR10+, gyro-EIS",
    camera_selfie: "12MP Dual Pixel PDAF",
    camera_video_selfie: "4K@30/60fps, 1080p@30fps",
    battery_capacity: "5000 mAh Li-Ion",
    charging: "45W wired, 15W wireless, 4.5W reverse wireless",
    sensors: "Fingerprint (under display, ultrasonic), accelerometer, gyro, proximity, compass, barometer",
    usb_type: "USB Type-C 3.2, OTG, DisplayPort 1.2",
    audio: "Stereo speakers, tuned by AKG, 32-bit/384kHz audio",
    features_extra: "NFC, Bluetooth 5.3, IP68 (Water/Dust Resistant), S-Pen Support, Samsung DeX"
  },
  {
    id: "dummy-a07",
    brand: "Samsung",
    model_name: "Galaxy A07",
    release_status: "Tersedia",
    launch_date_indo: "2024-06-12",
    tkdn_score: 36.1,
    chipset: "MediaTek Helio G85",
    ram_storage: "4GB / 64GB",
    price_srp: 1499000,
    image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=400",
    official_store_link: "https://www.samsung.com/id/smartphones/galaxy-a/",
    model_code: "SM-A075F",
    os: "Android 13",
    battery_capacity: "5000 mAh",
    charging: "15W wired"
  },
  {
    id: "dummy-zfold6",
    brand: "Samsung",
    model_name: "Galaxy Z Fold 6",
    release_status: "Segera Rilis",
    launch_date_indo: "2024-07-31",
    tkdn_score: 35.0,
    chipset: "Snapdragon 8 Gen 3",
    ram_storage: "12GB / 512GB",
    price_srp: 26499000,
    image_url: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=400",
    official_store_link: "https://www.samsung.com/id/smartphones/galaxy-z-fold6/",
    model_code: "SM-F956B",
    display_type: "7.6\" Foldable Dynamic AMOLED 2X",
    os: "Android 14"
  },
  {
    id: "dummy-m17",
    brand: "Samsung",
    model_name: "Galaxy M17",
    release_status: "Tersedia",
    launch_date_indo: "2024-05-20",
    tkdn_score: 38.2,
    chipset: "Snapdragon 6 Gen 1",
    ram_storage: "8GB / 256GB",
    price_srp: 3299000,
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400",
    official_store_link: "https://www.samsung.com/id/smartphones/galaxy-m/",
    model_code: "SM-M176B",
    os: "Android 14",
    battery_capacity: "6000 mAh"
  }
];
