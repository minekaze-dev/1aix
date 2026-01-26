
// Fix: Added City, Category, and ThreadCategory to imports.
import { Brand, City, Category, ThreadCategory } from './types';

// Fix: Added "Iqoo" to the BRANDS list to ensure all supported brands are represented.
export const BRANDS: Brand[] = [
  "Samsung", "Xiaomi", "Apple", "Oppo", "Vivo", "Realme", "Infinix", "Poco", "Tecno", "Itel", "Asus", "Redmagic", "Honor", "Motorola", "Huawei", "Iqoo"
];

// Fix: Exported missing filter and suggestion constants used in ExplorerTab, ForumTab, and ForumThreadModal.
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
  { name: "SAMSUNG", share: "38.2%", trend: "up" },
  { name: "OPPO", share: "18.4%", trend: "up" },
  { name: "IPHONE", share: "14.1%", trend: "up" },
  { name: "XIAOMI", share: "11.5%", trend: "up" },
  { name: "VIVO", share: "9.8%", trend: "up" },
  { name: "REALME", share: "4.2%", trend: "up" },
  { name: "INFINIX", share: "2.1%", trend: "up" },
  { name: "LAINNYA", share: "1.7%", trend: "up" },
];
