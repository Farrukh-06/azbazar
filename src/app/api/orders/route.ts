import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { COMMISSION_RATE, generateOrderNumber } from '@/lib/supabase';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sellerId = searchParams.get('sellerId');
  const orderNumber = searchParams.get('orderNumber');

  if (orderNumber) {
    const { data: order } = await supabaseAdmin.from('orders').select('*').eq('order_number', orderNumber).single();
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const { data: items } = await supabaseAdmin.from('order_items').select('*').eq('order_id', order.id);
    return NextResponse.json({ ...order, items });
  }

  if (sellerId) {
    const { data } = await supabaseAdmin
      .from('order_items')
      .select('*, orders(*)')
      .eq('seller_id', parseInt(sellerId))
      .order('created_at', { ascending: false });
    return NextResponse.json(data || []);
  }

  // Admin: all orders
  const { data } = await supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customerName, customerEmail, customerPhone, shippingAddress, city, paymentMethod, notes, items, customerId } = body;

  const subtotal = items.reduce((sum: number, i: any) => sum + i.product.price * i.quantity, 0);
  const shippingCost = subtotal >= 100 ? 0 : 5;
  const commission = parseFloat((subtotal * COMMISSION_RATE).toFixed(2));
  const total = subtotal + shippingCost;
  const orderNumber = generateOrderNumber();

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_id: customerId || null,
      customer_name: customerName,
      customer_email: customerEmail || null,
      customer_phone: customerPhone,
      shipping_address: shippingAddress,
      city,
      payment_method: paymentMethod,
      notes: notes || null,
      subtotal: subtotal.toFixed(2),
      shipping_cost: shippingCost.toFixed(2),
      commission: commission.toFixed(2),
      total: total.toFixed(2),
    })
    .select()
    .single();

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });

  const orderItems = items.map(({ product, quantity }: any) => {
    const itemTotal = product.price * quantity;
    const itemCommission = parseFloat((itemTotal * COMMISSION_RATE).toFixed(2));
    return {
      order_id: order.id,
      product_id: product.id,
      seller_id: product.seller_id,
      product_name: product.name,
      product_image: product.images?.[0] || null,
      quantity,
      unit_price: product.price,
      total_price: itemTotal,
      commission: itemCommission,
      seller_earnings: parseFloat((itemTotal - itemCommission).toFixed(2)),
    };
  });

  await supabaseAdmin.from('order_items').insert(orderItems);

  for (const { product, quantity } of items) {
    await supabaseAdmin.from('products').update({
      sold_count: product.sold_count + quantity,
      stock: Math.max(0, product.stock - quantity),
    }).eq('id', product.id);
  }

  return NextResponse.json({ orderNumber, total });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status } = body;
  await supabaseAdmin.from('orders').update({ status }).eq('id', id);
  await supabaseAdmin.from('order_items').update({ status }).eq('order_id', id);
  return NextResponse.json({ success: true });
}
