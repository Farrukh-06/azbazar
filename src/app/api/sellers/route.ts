import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const all = searchParams.get('all'); // admin only

  if (userId) {
    const { data } = await supabaseAdmin.from('sellers').select('*').eq('user_id', userId).single();
    return NextResponse.json(data || null);
  }

  if (all) {
    const { data } = await supabaseAdmin.from('sellers').select('*').order('created_at', { ascending: false });
    return NextResponse.json(data || []);
  }

  const { data } = await supabaseAdmin.from('sellers').select('*').eq('status', 'approved');
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabaseAdmin.from('sellers').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;
  const { error } = await supabaseAdmin.from('sellers').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
