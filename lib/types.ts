export type Level = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export type PracticeMode = 'reading' | 'writing';

export interface VocabCard {
  id: number;
  word: string;
  pinyin: string;
  meaning_en: string;
  level: Level;
  category: string;
  cky_mandatory: boolean;
}

export interface CardProgress {
  id: number;
  card_id: number;
  box_reading: number;   // 1-5
  next_review_reading: string;
  box_writing: number;   // 1-5
  next_review_writing: string;
  times_correct: number;
  times_incorrect: number;
  last_reviewed_at: string | null;
  updated_at: string;
}

export interface CardWithProgress extends VocabCard {
  progress: CardProgress;
}

export interface LevelSummary {
  level: Level;
  total: number;
  reading_mastery_pct: number;
  writing_mastery_pct: number;
  reading_reviewed: number;
  writing_reviewed: number;
}
