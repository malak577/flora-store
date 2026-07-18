import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem, Order, OrderStatus, Product, StoreSettings } from "./types";
import { SEED_PRODUCTS } from "./seed";

const LS_PRODUCTS = "flora-products-v1";
const LS_CART = "flora-cart-v1";
const LS_SETTINGS = "flora-settings-v1";
const LS_ADMIN = "flora-admin-v1";
const LS_ORDERS = "flora-orders-v1";

const DEFAULT_SETTINGS: StoreSettings = {
  whatsapp: "201018240350",
  vodafoneCash: "01018240350",
  adminPassword: "flora2026",
};

interface StoreCtx {
  hydrated: boolean;
  products: Product[];
  setProducts: (p: Product[]) => void;
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  cart: CartItem[];
  addToCart: (id: string, qty?: number) => void;
  updateQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  settings: StoreSettings;
  updateSettings: (s: Partial<StoreSettings>) => void;
  isAdmin: boolean;
  loginAdmin: (pw: string) => boolean;
  logoutAdmin: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [products, setProductsState] = useState<Product[]>(SEED_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const p = localStorage.getItem(LS_PRODUCTS);
      if (p) setProductsState(JSON.parse(p));
      const c = localStorage.getItem(LS_CART);
      if (c) setCart(JSON.parse(c));
      const s = localStorage.getItem(LS_SETTINGS);
      if (s) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(s) });
      const a = localStorage.getItem(LS_ADMIN);
      if (a === "1") setIsAdmin(true);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(LS_PRODUCTS, JSON.stringify(products));
  }, [products, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(LS_CART, JSON.stringify(cart));
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
  }, [settings, hydrated]);

  const setProducts = useCallback((p: Product[]) => setProductsState(p), []);
  const addProduct = useCallback((p: Product) => setProductsState((s) => [p, ...s]), []);
  const updateProduct = useCallback(
    (p: Product) => setProductsState((s) => s.map((x) => (x.id === p.id ? p : x))),
    [],
  );
  const deleteProduct = useCallback(
    (id: string) => setProductsState((s) => s.filter((x) => x.id !== id)),
    [],
  );

  const addToCart = useCallback((id: string, qty = 1) => {
    setCart((c) => {
      const ex = c.find((i) => i.productId === id);
      if (ex) return c.map((i) => (i.productId === id ? { ...i, quantity: i.quantity + qty } : i));
      return [...c, { productId: id, quantity: qty }];
    });
  }, []);
  const updateQty = useCallback((id: string, qty: number) => {
    setCart((c) =>
      qty <= 0
        ? c.filter((i) => i.productId !== id)
        : c.map((i) => (i.productId === id ? { ...i, quantity: qty } : i)),
    );
  }, []);
  const removeFromCart = useCallback(
    (id: string) => setCart((c) => c.filter((i) => i.productId !== id)),
    [],
  );
  const clearCart = useCallback(() => setCart([]), []);

  const updateSettings = useCallback(
    (s: Partial<StoreSettings>) => setSettings((prev) => ({ ...prev, ...s })),
    [],
  );

  const loginAdmin = useCallback(
    (pw: string) => {
      if (pw === settings.adminPassword) {
        setIsAdmin(true);
        localStorage.setItem(LS_ADMIN, "1");
        return true;
      }
      return false;
    },
    [settings.adminPassword],
  );
  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
    localStorage.removeItem(LS_ADMIN);
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      products,
      setProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      cart,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      settings,
      updateSettings,
      isAdmin,
      loginAdmin,
      logoutAdmin,
    }),
    [
      hydrated,
      products,
      setProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      cart,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      settings,
      updateSettings,
      isAdmin,
      loginAdmin,
      logoutAdmin,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}

export function priceOf(p: Product): number {
  return p.salePrice ?? p.price;
}
