import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { nextBoxState } from '@/lib/leitner';
import { isToneMatchIgnoringTones } from '@/lib/pinyin';
import type { PracticeMode } from '@/lib/types';

interface ProgressBody {
  card_id: number;
  mode: PracticeMode;
  // reading mode: Theo self-rates after seeing the answer
  selfRatedCorrect?: boolean;
  // writing mode: Theo typed a pinyin answer, checked toneless server-side
  typedAnswer?: string;
  session_id?: number | null;
}

export async function POST(req: NextRequest) {
  const body: ProgressBody = await req.json();
  const { card_id, mode, selfRatedCorrect, typedAnswer, session_id } = body;

  const { data: card, error: cardError } = await supabase
    .from('chinese_vocab_cards')
    .select('id, pinyin')
    .eq('id', card_id)
    .single();

  if (cardError || !card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  let wasCorrect: boolean;
  if (mode === 'writing') {
    if (typeof typedAnswer !== 'string') {
      return NextResponse.json({ error: 'typedAnswer required for writing mode' }, { status: 400 });
    }
    wasCorrect = isToneMatchIgnoringTones(typedAnswer, card.pinyin);
  } else {
    if (typeof selfRatedCorrect !== 'boolean') {
      return NextResponse.json(
        { error: 'selfRatedCorrect required for reading mode' },
        { status: 400 }
      );
    }
    wasCorrect = selfRatedCorrect;
  }

  const { data: progress, error: progressError } = await supabase
    .from('chinese_card_progress')
    .select('*')
    .eq('card_id', card_id)
    .single();

  if (progressError || !progress) {
    return NextResponse.json({ error: 'Progress row not found' }, { status: 404 });
  }

  const boxField = mode === 'writing' ? 'box_writing' : 'box_reading';
  const dueField = mode === 'writing' ? 'next_review_writing' : 'next_review_reading';
  const currentBox = mode === 'writing' ? progress.box_writing : progress.box_reading;

  const { leitner_box, next_review_at } = nextBoxState(currentBox, wasCorrect);

  const { error: updateError } = await supabase
    .from('chinese_card_progress')
    .update({
      [boxField]: leitner_box,
      [dueField]: next_review_at,
      last_reviewed_at: new Date().toISOString(),
      times_correct: wasCorrect ? progress.times_correct + 1 : progress.times_correct,
      times_incorrect: wasCorrect ? progress.times_incorrect : progress.times_incorrect + 1,
    })
    .eq('card_id', card_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from('chinese_review_events').insert({
    session_id: session_id ?? null,
    card_id,
    mode,
    was_correct: wasCorrect,
    typed_answer: mode === 'writing' ? typedAnswer : null,
    box_before: currentBox,
    box_after: leitner_box,
  });

  return NextResponse.json({
    wasCorrect,
    correctPinyin: card.pinyin,
    leitner_box,
    next_review_at,
  });
}
