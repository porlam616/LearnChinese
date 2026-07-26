import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionUserId } from '@/lib/session';

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const now = new Date().toISOString();

  const { error } = await supabase
    .from('chinese_card_progress')
    .update({
      box_reading: 1,
      next_review_reading: now,
      box_writing: 1,
      next_review_writing: now,
      times_correct: 0,
      times_incorrect: 0,
      last_reviewed_at: null,
    })
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Coins are derived from times_correct, which just got zeroed above.
  // Clear this user's owned items too, otherwise their balance would go negative.
  const { error: shopError } = await supabase
    .from('chinese_owned_items')
    .delete()
    .eq('user_id', userId);

  if (shopError) {
    return NextResponse.json({ ok: false, error: shopError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
