import { supabase } from './supabase';

export interface CoinBalance {
  earned: number;
  spent: number;
  balance: number;
}

// 1 coin per correct answer, already tracked via times_correct on every
// card's progress row (reading + writing both count). Coins spent are
// derived from the price of everything currently owned. No separate
// ledger table needed -- this stays automatically in sync with practice.
// Everything is scoped to a single user's account.
export async function getCoinBalance(userId: number): Promise<CoinBalance> {
  const { data: progressRows, error: progressError } = await supabase
    .from('chinese_card_progress')
    .select('times_correct')
    .eq('user_id', userId)
    .range(0, 9999);

  if (progressError) throw new Error(progressError.message);

  const earned = (progressRows ?? []).reduce(
    (sum, r: { times_correct: number }) => sum + r.times_correct,
    0
  );

  const { data: ownedRows, error: ownedError } = await supabase
    .from('chinese_owned_items')
    .select('item_id, chinese_shop_items ( price )')
    .eq('user_id', userId);

  if (ownedError) throw new Error(ownedError.message);

  interface OwnedRow {
    item_id: number;
    chinese_shop_items: { price: number } | { price: number }[] | null;
  }

  const spent = ((ownedRows ?? []) as OwnedRow[]).reduce((sum, r) => {
    const item = Array.isArray(r.chinese_shop_items)
      ? r.chinese_shop_items[0]
      : r.chinese_shop_items;
    return sum + (item?.price ?? 0);
  }, 0);

  return { earned, spent, balance: earned - spent };
}
