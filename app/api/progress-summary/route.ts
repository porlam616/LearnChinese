import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionUserId } from '@/lib/session';
import type { Level, LevelSummary } from '@/lib/types';

const LEVELS: Level[] = ['L1', 'L2', 'L3', 'L4', 'L5'];

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('chinese_vocab_cards')
    .select(
      `level, chinese_card_progress!inner ( box_reading, box_writing, times_correct, times_incorrect, user_id )`
    )
    .eq('chinese_card_progress.user_id', userId)
    .range(0, 9999);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  interface Progress {
    box_reading: number;
    box_writing: number;
    times_correct: number;
    times_incorrect: number;
  }
  interface Row {
    level: Level;
    chinese_card_progress: Progress | Progress[] | null;
  }

  const rows = (data ?? []) as Row[];

  const summary: LevelSummary[] = LEVELS.map((level) => {
    const levelRows = rows.filter((r) => r.level === level);
    const total = levelRows.length;

    let readingSum = 0;
    let writingSum = 0;
    let readingReviewed = 0;
    let writingReviewed = 0;

    for (const r of levelRows) {
      const p = Array.isArray(r.chinese_card_progress)
        ? r.chinese_card_progress[0]
        : r.chinese_card_progress;
      const boxReading = p?.box_reading ?? 1;
      const boxWriting = p?.box_writing ?? 1;
      readingSum += boxReading;
      writingSum += boxWriting;
      if (boxReading > 1) readingReviewed += 1;
      if (boxWriting > 1) writingReviewed += 1;
    }

    const readingPct = total > 0 ? ((readingSum / total - 1) / 4) * 100 : 0;
    const writingPct = total > 0 ? ((writingSum / total - 1) / 4) * 100 : 0;

    return {
      level,
      total,
      reading_mastery_pct: Math.round(readingPct * 10) / 10,
      writing_mastery_pct: Math.round(writingPct * 10) / 10,
      reading_reviewed: readingReviewed,
      writing_reviewed: writingReviewed,
    };
  });

  return NextResponse.json({ summary });
}
