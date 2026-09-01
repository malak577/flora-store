export type Availability = "instant" | "preorder";
export type ProductBadge = "bestseller" | "new";

export interface ProductVariant {
  /** Custom label, e.g. "50ml" */
  label: string;
  price: number;
  salePrice?: number;
  /** Optional image shown when this size is selected */
  image?: string;
}

export interface Product {
  id: string;
  brand: string;
  brandId?: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  usage?: { en: string; ar: string };
  ingredients?: { en: string; ar: string };
  category?: { en: string; ar: string };
  stock?: number;
  size?: string;
  sortOrder?: number;

  benefits: { en: string[]; ar: string[] };
  price: number; // EGP
  salePrice?: number; // EGP, optional
  image: string;
  /** Extra gallery images (the main `image` stays the cover) */
  images?: string[];
  /** Up to 3 custom size options */
  variants?: ProductVariant[];
  availability: Availability;
  rating?: number;      // 0-5
  reviewCount?: number; // total reviews
  badge?: ProductBadge; // extra badge besides Sale
  bestSeller?: boolean; // for Best Sellers section
}


export interface CartItem {
  productId: string;
  quantity: number;
}

export interface StoreSettings {
  whatsapp: string;
  vodafoneCash: string;
  instagram: string;
  tiktok: string;
  
}

export type OrderStatus = "pending" | "confirmed" | "cancelled";

export interface OrderCustomer {
  name: string;
  phone: string;
  altPhone: string;
  governorate: string;
  address: string;
}

export interface OrderLine {
  productId: string;
  nameEn: string;
  nameAr: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  createdAt: number;
  status: OrderStatus;
  customer: OrderCustomer;
  items: OrderLine[];
  subtotal: number;
  deposit: number;
}
