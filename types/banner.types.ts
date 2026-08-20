// lib/types/banner.types.ts

export interface BannerImage {
  url: string;
  alt_text?: string;
  position: number;
}

export interface BannerButton {
  text: string;
  url: string;
  color: string;
  text_color: string;
  position: number;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  background_color: string;
  background_gradient?: string;
  text_color: string;
  images: BannerImage[];
  buttons: BannerButton[];
  target_page: "home" | "categories" | "products";
  is_active: boolean;
  sort_order: number;
  display_from?: Date;
  display_until?: Date;
}

export const GRADIENT_PRESETS = [
  { value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", label: "Purple Dream" },
  { value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", label: "Pink Sunset" },
  { value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", label: "Ocean Blue" },
  { value: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", label: "Mint Fresh" },
  { value: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", label: "Warm Flame" },
  { value: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)", label: "Deep Sea" },
  { value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", label: "Pastel Dream" },
  { value: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)", label: "Rose Quartz" },
  { value: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", label: "Peach" },
  { value: "linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)", label: "Cotton Candy" },
] as const;