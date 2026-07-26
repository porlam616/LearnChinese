import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCoinBalance } from '@/lib/coins';
import { getSessionUserId } from '@/lib/session';
import type { ItemCategory } from '@/lib/types';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { data: shopItems, error: shopError } = await supabase
    .from('chinese_shop_items')
    .select('id, name_zh, name_en, category, price')
    .order('category')
    .order('price');

  if (shopError) {
    return NextResponse.json({ error: shopError.message }, { status: 500 });
  }

  const { data: ownedItems, error: ownedError } = await supabase
    .from('chinese_owned_items')
    .select('item_id, equipped')
    .eq('user_id', userId);

  if (ownedError) {
    return NextResponse.json({ error: ownedError.message }, { status: 500 });
  }

  const ownedMap = new Map((ownedItems ?? []).map((o) => [o.item_id, o.equipped]));

  interface RawItem {
    id: number;
    name_zh: string;
    name_en: string;
    category: ItemCategory;
    price: number;
  }

  const items = ((shopItems ?? []) as RawItem[]).map((item) => ({
    ...item,
    owned: ownedMap.has(item.id),
    equipped: ownedMap.get(item.id) ?? false,
  }));

  let balance;
  try {
    balance = await getCoinBalance(userId);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  return NextResponse.json({ items, ...balance });
}
