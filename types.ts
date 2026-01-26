
// Fix: Added missing brand names
export type Brand = "Samsung" | "Xiaomi" | "Apple" | "Oppo" | "Vivo" | "Realme" | "Infinix" | "Asus" | "Poco" | "Itel" | "Tecno" | "Redmagic" | "Honor" | "Motorola" | "Huawei" | "Iqoo";
export type ReleaseStatus = "Tersedia" | "Pre-Order" | "Segera Rilis";

export interface Smartphone {
  id: string;
  brand: Brand;
  model_name: string;
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
  categories: ArticleCategory[]; // Updated to array
  status: 'DRAFT' | 'PUBLISHED';
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
