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
