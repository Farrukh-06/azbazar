'use client';

export interface SellerAccount {
  id: string;
  name: string;
  storeName: string;
  phone: string;
  email: string;
  category: string;
  location: string;
  trendyolLink?: string;
  approved: boolean;
  createdAt: string;
  password: string; // simple plain text for demo
}

export interface SellerProduct {
  id: string;
  sellerId: string;
  sellerName: string;
  nameAz: string;
  price: number;
  oldPrice?: number;
  category: string;
  stock: number;
  image: string;
  descriptionAz: string;
  badge?: string;
  active: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  subtotal: number;
  commission: number;
  sellerReceives: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
  sellerId: string;
  sellerName: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  sellerId: string;
  sellerName: string;
}

// ---------- helpers ----------
function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------- Sellers ----------
export const getSellers = (): SellerAccount[] => load('az_sellers', []);
export const saveSellers = (s: SellerAccount[]) => save('az_sellers', s);

export const registerSeller = (data: Omit<SellerAccount, 'id' | 'approved' | 'createdAt'>): SellerAccount => {
  const sellers = getSellers();
  const seller: SellerAccount = { ...data, id: `s_${Date.now()}`, approved: false, createdAt: new Date().toISOString() };
  saveSellers([...sellers, seller]);
  return seller;
};

export const approveSeller = (id: string) => {
  const sellers = getSellers().map(s => s.id === id ? { ...s, approved: true } : s);
  saveSellers(sellers);
};

export const rejectSeller = (id: string) => {
  saveSellers(getSellers().filter(s => s.id !== id));
};

export const loginSeller = (email: string, password: string): SellerAccount | null => {
  return getSellers().find(s => s.email === email && s.password === password) ?? null;
};

// ---------- Seller Products ----------
export const getSellerProducts = (sellerId?: string): SellerProduct[] => {
  const all = load<SellerProduct[]>('az_seller_products', []);
  return sellerId ? all.filter(p => p.sellerId === sellerId) : all;
};

export const saveSellerProducts = (prods: SellerProduct[]) => save('az_seller_products', prods);

export const addSellerProduct = (data: Omit<SellerProduct, 'id' | 'createdAt'>): SellerProduct => {
  const all = getSellerProducts();
  const prod: SellerProduct = { ...data, id: `sp_${Date.now()}`, createdAt: new Date().toISOString() };
  saveSellerProducts([...all, prod]);
  return prod;
};

export const updateSellerProduct = (id: string, data: Partial<SellerProduct>) => {
  saveSellerProducts(getSellerProducts().map(p => p.id === id ? { ...p, ...data } : p));
};

export const deleteSellerProduct = (id: string) => {
  saveSellerProducts(getSellerProducts().filter(p => p.id !== id));
};

// ---------- Orders ----------
export const getOrders = (sellerId?: string): Order[] => {
  const all = load<Order[]>('az_orders', []);
  return sellerId ? all.filter(o => o.sellerId === sellerId) : all;
};

export const saveOrder = (order: Order) => {
  const all = load<Order[]>('az_orders', []);
  save('az_orders', [...all, order]);
};

export const updateOrderStatus = (id: string, status: Order['status']) => {
  const all = load<Order[]>('az_orders', []);
  save('az_orders', all.map(o => o.id === id ? { ...o, status } : o));
};

// ---------- Session ----------
export const getSession = (): { type: 'seller' | 'admin'; id?: string } | null =>
  load('az_session', null);

export const setSession = (session: { type: 'seller' | 'admin'; id?: string } | null) =>
  save('az_session', session);

export const COMMISSION_RATE = 0.15;
