export type Availability = "instant" | "preorder";

export interface Product {
  id: string;
  brand: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  benefits: { en: string[]; ar: string[] };
  price: number; // EGP
  salePrice?: number; // EGP, optional
  image: string;
  availability: Availability;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface StoreSettings {
  whatsapp: string; // e.g. 201234567890 (no +)
  vodafoneCash: string; // e.g. 01234567890
  adminPassword: string;
}
