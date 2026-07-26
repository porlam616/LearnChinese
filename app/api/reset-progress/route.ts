import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
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
    .neq('id', 0); // matches all rows

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
