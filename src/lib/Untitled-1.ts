import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: number; name: string; slug: string; icon: string | null;
  description: string | null; image_url: string | null;
};

export type Seller = {
  id: number; user_id: string; shop_name: string; description: string | null;
  logo_url: string | null; phone: string | null; email: string | null;
  address: string | null; location: string; status: string;
  rating: number; total_sales: number; commission_rate: number; created_at: string;
};

export type Product = {
  id: number; seller_id: number; category_id: number | null; name: string;
  slug: string; description: string | null; short_description: string | null;
  price: number; compare_price: number | null; stock: number;
  images: string[]; status: string; featured: boolean; rating: number;
  review_count: number; sold_count: number; tags: string[]; badge: string | null;
  created_at: string; seller_name?: string; seller_logo?: string;
  seller_status?: string; category_name?: string; category_slug?: string;
};

export type Order = {
  id: number; order_number: string; customer_name: string;
  customer_phone: string; shipping_address: string; city: string;
  status: string; payment_method: string; subtotal: number;
  shipping_cost: number; commission: number; total: number; created_at: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: number; order_id: number; product_name: string; product_image: string | null;
  quantity: number; unit_price: number; total_price: number;
  commission: number; seller_earnings: number; status: string;
};

export const COMMISSION_RATE = 0.15;

export const getCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*').order('id');
  if (error) throw error;
  return (data || []) as Category[];
};

export const getSellers = async () => {
  const { data, error } = await supabase.from('sellers').select('*').eq('status', 'approved');
  if (error) throw error;
  return (data || []) as Seller[];
};

export const getProducts = async (filters?: {
  category?: string; search?: string; featured?: boolean;
  sellerId?: number; limit?: number;
}) => {
  let query = supabase.from('products_full').select('*')
    .eq('status', 'active');
  if (filters?.category) query = query.eq('category_slug', filters.category);
  if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
  if (filters?.featured) query = query.eq('featured', true);
  if (filters?.sellerId) query = query.eq('seller_id', filters.sellerId);
  if (filters?.limit) query = query.limit(filters.limit);
  query = query.order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Product[];
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  const { data } = await supabase.from('products_full').select('*').eq('slug', slug).single();
  return data as Product | null;
};

export const generateOrderNumber = () =>
  'AZ' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();

export const createOrder = async (orderData: {
  customerName: string; customerEmail?: string; customerPhone: string;
  shippingAddress: string; city: string; paymentMethod: string;
  notes?: string; items: Array<{ product: Product; quantity: number }>;
  customerId?: string;
}) => {
  const subtotal = orderData.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shippingCost = subtotal >= 100 ? 0 : 5;
  const commission = parseFloat((subtotal * COMMISSION_RATE).toFixed(2));
  const total = subtotal + shippingCost;
  const orderNumber = generateOrderNumber();

  const { data: order, error: orderError } = await supabase
    .from('orders').insert({
      order_number: orderNumber,
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail || null,
      customer_phone: orderData.customerPhone,
      shipping_address: orderData.shippingAddress,
      city: orderData.city,
      payment_method: orderData.paymentMethod,
      notes: orderData.notes || null,
      subtotal: subtotal.toFixed(2),
      shipping_cost: shippingCost.toFixed(2),
      commission: commission.toFixed(2),
      total: total.toFixed(2),
    }).select().single();

  if (orderError) throw orderError;

  const items = orderData.items.map(({ product, quantity }) => {
    const itemTotal = product.price * quantity;
    const itemCommission = parseFloat((itemTotal * COMMISSION_RATE).toFixed(2));
    return {
      order_id: order.id, product_id: product.id, seller_id: product.seller_id,
      product_name: product.name, product_image: product.images?.[0] || null,
      quantity, unit_price: product.price, total_price: itemTotal,
      commission: itemCommission, seller_earnings: parseFloat((itemTotal - itemCommission).toFixed(2)),
    };
  });

  await supabase.from('order_items').insert(items);

  return { orderNumber, total };
};