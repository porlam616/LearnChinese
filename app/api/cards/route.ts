import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { PracticeMode } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get('level'); // 'L1'..'L5' or null for all
  const category = searchParams.get('category'); // null for all
  const mandatoryOnly = searchParams.get('mandatoryOnly') === 'true';
  const dueOnly = searchParams.get('dueOnly') === 'true';
  const mode = (searchParams.get('mode') as PracticeMode) ?? 'reading';

  let query = supabase
    .from('chinese_vocab_cards')
    .select(
      `id, word, pinyin, meaning_en, level, category, cky_mandatory,
       chinese_card_progress ( id, box_reading, next_review_reading,
                               box_writing, next_review_writing,
                               times_correct, times_incorrect,
                               last_reviewed_at, updated_at )`
    );

  if (level) query = query.eq('level', level);
  if (category) query = query.eq('category', category);
  if (mandatoryOnly) query = query.eq('cky_mandatory', true);

  // No artificial cap: fetch every matching row. Supabase's default page
  // size is 1000, so explicitly widen the range to cover the full list
  // (3,132 words currently).
  const { data, error } = await query.range(0, 9999);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  interface RawRow {
    id: number;
    word: string;
    pinyin: string;
    meaning_en: string;
    level: string;
    category: string;
    cky_mandatory: boolean;
    chinese_card_progress: unknown;
  }

  let cards = ((data ?? []) as RawRow[]).map((row) => ({
    ...row,
    progress: Array.isArray(row.chinese_card_progress)
      ? row.chinese_card_progress[0]
      : row.chinese_card_progress,
  }));

  const boxField = mode === 'writing' ? 'box_writing' : 'box_reading';
  const dueField = mode === 'writing' ? 'next_review_writing' : 'next_review_reading';

  interface Progress {
    box_reading: number;
    next_review_reading: string;
    box_writing: number;
    next_review_writing: string;
  }

  const getProgress = (c: (typeof cards)[number]) => c.progress as Progress | undefined;

  if (dueOnly) {
    const now = Date.now();
    cards = cards.filter(
      (c) => new Date(getProgress(c)?.[dueField] ?? 0).getTime() <= now
    );
  }

  // Prioritize lower boxes (less-known words) first
  cards.sort(
    (a, b) => (getProgress(a)?.[boxField] ?? 1) - (getProgress(b)?.[boxField] ?? 1)
  );

  return NextResponse.json({ cards });
}
