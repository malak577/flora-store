import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";

type Dict = Record<string, { en: string; ar: string }>;

const DICT: Dict = {
  brand_name: { en: "Flora Store", ar: "فلورا ستور" },
  nav_home: { en: "Home", ar: "الرئيسية" },
  nav_shop: { en: "Shop", ar: "المتجر" },
  nav_cart: { en: "Cart", ar: "السلة" },
  nav_admin: { en: "Admin", ar: "الإدارة" },
  hero_title: { en: "Radiant Skin, Effortlessly", ar: "بشرة مشرقة بكل بساطة" },
  hero_sub: {
    en: "Authentic skincare from the world's most trusted brands, delivered across Egypt.",
    ar: "منتجات عناية أصلية من أشهر الماركات العالمية، توصيل لجميع أنحاء مصر.",
  },
  shop_now: { en: "Shop Now", ar: "تسوق الآن" },
  brands: { en: "Brands", ar: "الماركات" },
  all_brands: { en: "All Brands", ar: "كل الماركات" },
  products: { en: "Products", ar: "المنتجات" },
  benefits: { en: "Product Benefits", ar: "الفوائد" },
  add_to_cart: { en: "Add to Cart", ar: "أضف للسلة" },
  buy_now: { en: "Buy Now", ar: "اشترِ الآن" },
  instant_ship: { en: "Instant Shipping", ar: "شحن فوري" },
  preorder: { en: "Pre-Order: Arrives in 15-20 days", ar: "طلب مسبق: يصل خلال ١٥-٢٠ يوم" },
  sale: { en: "SALE", ar: "خصم" },
  cart_empty: { en: "Your cart is empty.", ar: "سلتك فارغة." },
  subtotal: { en: "Subtotal", ar: "الإجمالي" },
  total: { en: "Total", ar: "المجموع" },
  checkout: { en: "Checkout", ar: "إتمام الطلب" },
  continue_shopping: { en: "Continue Shopping", ar: "متابعة التسوق" },
  full_name: { en: "Full Name", ar: "الاسم بالكامل" },
  phone: { en: "Phone Number", ar: "رقم الهاتف" },
  address: { en: "Shipping Address", ar: "عنوان الشحن" },
  city: { en: "City / Governorate", ar: "المدينة / المحافظة" },
  deposit_notice: {
    en: "To confirm your order, please transfer a 50% deposit via Vodafone Cash to our number and send the transfer screenshot.",
    ar: "لتأكيد طلبك، من فضلك حوّل ٥٠٪ من قيمة الطلب على فودافون كاش وأرسل صورة إيصال التحويل.",
  },
  deposit_50: { en: "50% Deposit Required", ar: "المطلوب دفع ٥٠٪ مقدم" },
  confirm_order: { en: "Confirm Order via WhatsApp", ar: "تأكيد الطلب عبر واتساب" },
  quantity: { en: "Quantity", ar: "الكمية" },
  remove: { en: "Remove", ar: "حذف" },
  filter_brand: { en: "Filter by brand", ar: "تصفية حسب الماركة" },
  admin_login: { en: "Admin Login", ar: "دخول الإدارة" },
  admin_password: { en: "Admin Password", ar: "كلمة مرور الإدارة" },
  login: { en: "Login", ar: "دخول" },
  logout: { en: "Logout", ar: "خروج" },
  add_product: { en: "Add Product", ar: "إضافة منتج" },
  edit: { en: "Edit", ar: "تعديل" },
  delete: { en: "Delete", ar: "حذف" },
  save: { en: "Save", ar: "حفظ" },
  cancel: { en: "Cancel", ar: "إلغاء" },
  price: { en: "Price (EGP)", ar: "السعر (ج.م)" },
  sale_price: { en: "Sale Price (EGP, optional)", ar: "سعر الخصم (ج.م، اختياري)" },
  image_url: { en: "Image URL", ar: "رابط الصورة" },
  description: { en: "Description", ar: "الوصف" },
  benefits_field: { en: "Benefits (one per line)", ar: "الفوائد (كل فائدة في سطر)" },
  availability: { en: "Availability", ar: "التوفر" },
  brand_field: { en: "Brand", ar: "الماركة" },
  name_en: { en: "Name (English)", ar: "الاسم (إنجليزي)" },
  name_ar: { en: "Name (Arabic)", ar: "الاسم (عربي)" },
  desc_en: { en: "Description (English)", ar: "الوصف (إنجليزي)" },
  desc_ar: { en: "Description (Arabic)", ar: "الوصف (عربي)" },
  benefits_en: { en: "Benefits English (one per line)", ar: "الفوائد إنجليزي (كل فائدة في سطر)" },
  benefits_ar: { en: "Benefits Arabic (one per line)", ar: "الفوائد عربي (كل فائدة في سطر)" },
  settings: { en: "Store Settings", ar: "إعدادات المتجر" },
  wa_number: { en: "WhatsApp number (international, no +)", ar: "رقم واتساب (دولي، بدون +)" },
  vf_number: { en: "Vodafone Cash number", ar: "رقم فودافون كاش" },
  order_details: { en: "Order Details", ar: "تفاصيل الطلب" },
  wrong_password: { en: "Wrong password", ar: "كلمة مرور خاطئة" },
  footer_tagline: {
    en: "Authentic skincare • Delivered across Egypt",
    ar: "منتجات أصلية • توصيل لجميع محافظات مصر",
  },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof DICT) => string;
  dir: "ltr" | "rtl";
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("flora-lang")) as Lang | null;
    if (saved === "en" || saved === "ar") setLangState(saved);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("flora-lang", l);
  };

  const t = (key: keyof typeof DICT) => DICT[key]?.[lang] ?? String(key);
  const dir = lang === "ar" ? "rtl" : "ltr";

  return <Ctx.Provider value={{ lang, setLang, t, dir }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n must be used inside I18nProvider");
  return c;
}

export function formatEGP(n: number, lang: Lang) {
  const rounded = Math.round(n);
  if (lang === "ar") return `${rounded.toLocaleString("ar-EG")} ج.م`;
  return `${rounded.toLocaleString("en-US")} EGP`;
}
