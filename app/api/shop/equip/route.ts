import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionUserId } from '@/lib/session';

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { item_id, equip } = await req.json();

  if (typeof item_id !== 'number' || typeof equip !== 'boolean') {
    return NextResponse.json({ error: 'item_id and equip required' }, { status: 400 });
  }

  const { data: owned, error: ownedError } = await supabase
    .from('chinese_owned_items')
    .select('id, item_id, chinese_shop_items ( category )')
    .eq('item_id', item_id)
    .eq('user_id', userId)
    .single();

  if (ownedError || !owned) {
    return NextResponse.json({ error: 'Item not owned' }, { status: 404 });
  }

  if (equip) {
    const category = Array.isArray(owned.chinese_shop_items)
      ? owned.chinese_shop_items[0]?.category
      : (owned.chinese_shop_items as { category: string } | null)?.category;

    const { data: sameCategoryItems } = await supabase
      .from('chinese_shop_items')
      .select('id')
      .eq('category', category);

    const idsInCategory = (sameCategoryItems ?? []).map((i) => i.id);

    if (idsInCategory.length > 0) {
      await supabase
        .from('chinese_owned_items')
        .update({ equipped: false })
        .in('item_id', idsInCategory)
        .eq('user_id', userId);
    }
  }

  const { error: updateError } = await supabase
    .from('chinese_owned_items')
    .update({ equipped: equip })
    .eq('item_id', item_id)
    .eq('user_id', userId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
