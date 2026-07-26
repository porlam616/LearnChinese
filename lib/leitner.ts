// Leitner-style spaced repetition, mirroring the mechanic used in LearnFrench.
// 5 boxes; correct answers advance a card, incorrect answers send it back to box 1.
// Review interval grows with the box number.

const BOX_INTERVALS_HOURS: Record<number, number> = {
  1: 0,       // immediately available again
  2: 24,      // 1 day
  3: 24 * 3,  // 3 days
  4: 24 * 7,  // 1 week
  5: 24 * 21, // 3 weeks
};

export interface LeitnerUpdate {
  leitner_box: number;
  next_review_at: string; // ISO string
}

export function nextBoxState(currentBox: number, wasCorrect: boolean): LeitnerUpdate {
  const nextBox = wasCorrect ? Math.min(currentBox + 1, 5) : 1;
  const hours = BOX_INTERVALS_HOURS[nextBox];
  const nextReview = new Date(Date.now() + hours * 60 * 60 * 1000);
  return {
    leitner_box: nextBox,
    next_review_at: nextReview.toISOString(),
  };
}
