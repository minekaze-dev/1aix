
// Fix: Added missing brand names and interactive types
export type Brand = "Samsung" | "Xiaomi" | "Apple" | "Oppo" | "Vivo" | "Realme" | "Infinix" | "Asus" | "Poco" | "Itel" | "Tecno" | "Redmagic" | "Honor" | "Motorola" | "Huawei" | "Iqoo";
export type ReleaseStatus = "Tersedia" | "Pre-Order" | "Segera Rilis";
export type MarketCategory = "Entry-level" | "Mid-range" | "Flagship";

export interface AdConfig {
  id: string; // 'header', 'article', or 'sidebar'
  image_url: string;
  target_url: string;
  title?: string;
  subtitle?: string;
  updated_at?: string;
}

export interface Smartphone {
  id: string;
  brand: Brand;
  model_name: string;
  market_category?: MarketCategory;
  release_status: ReleaseStatus;
  release_month?: string;
  release_year?: string;
  launch_date_indo: string;
  tkdn_score: number;
  chipset: string;
  ram_storage: string;
  price_srp: number;
  image_url: string;
  official_store_link: string;
  postel_cert?: string;
  model_code?: string;
  prediction_quarter?: "Q1" | "Q2" | "Q3" | "Q4";
  software_update_version?: string;
  // Fix: Added missing order_rank property for sorting and prioritization
  order_rank?: number;
  
  dimensions_weight?: string;
  material?: string;
  colors?: string;
  network?: string;
  wifi?: string;
  display_type?: string;
  os?: string;
  cpu?: string;
  gpu?: string;
  camera_main?: string;
  camera_video_main?: string;
  camera_selfie?: string;
  camera_video_selfie?: string;
  battery_capacity?: string;
  charging?: string;
  sensors?: string;
  usb_type?: string;
  audio?: string;
  features_extra?: string;
  created_at?: string;

  // New Interactive Fields
  likes?: number;
  dislikes?: number;
  // New: Added source property for AdminExtendedMod to track data origin
  source?: 'AI' | 'MANUAL' | 'PUBLISHED_DB';
}

export interface Comment {
  id: string;
  target_id: string; // id artikel atau smartphone
  user_name: string;
  text: string;
  created_at: string;
}

export type ArticleCategory = "REVIEW" | "NEWS" | "LEAK" | "GAMING" | "UPDATE" | "UNBOXING" | "EVENT";

export interface Article {
  id: string;
  title: string;
  cover_image_url: string;
  tags: string;
  permalink: string;
  publish_date: string;
  summary: string;
  content: string;
  categories: ArticleCategory[]; 
  status: 'DRAFT' | 'PUBLISHED' | 'TRASH';
  created_at: string;
  author_name?: string;
  author_id?: string | null; // New: Link to authors table, explicitly nullable
}

export interface Author {
  id: string;
  name: string;
  role: 'ADMIN' | 'AUTHOR';
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string;
  is_blocked?: boolean;
}

export type City = "Jakarta" | "Bogor" | "Depok" | "Tangerang" | "Bekasi";
export type Category = "Transport" | "Wisata" | "Belanja" | "Kuliner" | "Umum";

export interface Guide {
  id: string;
  title: string;
  cities: City[];
  category: Category;
  author: string;
  steps: string[];
  tips?: string[];
  duration: string;
  cost: string;
  views: number;
  user?: boolean;
  status?: 'pending' | 'approved';
}

export type ThreadCategory = "Umum" | "Kuliner" | "Transportasi" | "Lowongan Kerja" | "Hiburan";
export type ThreadStatus = 'trusted' | 'questionable' | 'danger';

export interface Post {
  id: string;
  text: string;
  author: Profile;
  reports?: string[];
  created_at?: string;
}

export interface Thread {
  id: string;
  title: string;
  category: ThreadCategory;
  posts: Post[];
  greenVotes?: string[];
  yellowVotes?: string[];
  redVotes?: string[];
  reports?: string[];
  views?: number;
  created_at?: string;
}

// FIX: TkdnItem interface was moved and updated directly in AdminExtendedMod.tsx
// But for consistency and to avoid re-defining, it's good to have it here too if other parts might use it.
// Re-adding it here with the source property
export interface TkdnItem {
  cert_number: string;
  brand: string;
  codename: string;
  marketing_name: string;
  tkdn_score: number;
  cert_date: string;
  status: 'UPCOMING' | 'RELEASED';
  created_at?: string;
  // New property for UI only, not stored in DB
  id: string; // Used for React keys and local identification, maps to cert_number
  source?: 'AI' | 'MANUAL' | 'PUBLISHED_DB';
  is_visible?: boolean; // New: Added for public visibility control
}
