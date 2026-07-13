import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Service role client bypasses RLS — only used server-side
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const featured = searchParams.get('featured');
  const sellerId = searchParams.get('sellerId');
  const limit = searchParams.get('limit');

  let query = supabaseAdmin
    .from('products_full')
    .select('*')
    .eq('status', 'active')
    .eq('seller_status', 'approved');

  if (category) query = query.eq('category_slug', category);
  if (search) query = query.ilike('name', `%${search}%`);
  if (featured === 'true') query = query.eq('featured', true);
  if (sellerId) query = query.eq('seller_id', parseInt(sellerId));
  if (limit) query = query.limit(parseInt(limit));

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabaseAdmin.from('products').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
