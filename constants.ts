
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
  "SISTEM DATABASE 1AIX TELAH AKTIF SEPENUHNYA",
  "PEMANTAUAN TKDN SMARTPHONE TERBARU 2026",
  "SELURUH HARGA SRP BERSUMBER DARI STORE RESMI",
  "KOMUNITAS 1AIX: DISKUSI GADGET SECARA LIVE"
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

export const DUMMY_SMARTPHONES: Smartphone[] = [];
