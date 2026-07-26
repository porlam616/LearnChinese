import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCoinBalance } from '@/lib/coins';
import { getSessionUserId } from '@/lib/session';

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { item_id } = await req.json();

  if (typeof item_id !== 'number') {
    return NextResponse.json({ error: 'item_id required' }, { status: 400 });
  }

  const { data: item, error: itemError } = await supabase
    .from('chinese_shop_items')
    .select('id, price')
    .eq('id', item_id)
    .single();

  if (itemError || !item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from('chinese_owned_items')
    .select('id')
    .eq('item_id', item_id)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Already owned' }, { status: 400 });
  }

  let balance;
  try {
    balance = await getCoinBalance(userId);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  if (balance.balance < item.price) {
    return NextResponse.json({ error: '金幣不足' }, { status: 400 });
  }

  const { error: insertError } = await supabase
    .from('chinese_owned_items')
    .insert({ item_id, equipped: false, user_id: userId });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const newBalance = await getCoinBalance(userId);
  return NextResponse.json({ ok: true, ...newBalance });
}
