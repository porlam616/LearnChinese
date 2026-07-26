'use client';

import { useEffect, useState } from 'react';
import type { CardWithProgress, PracticeMode } from '@/lib/types';

interface Props {
  level: string | null;
  category: string | null;
  mandatoryOnly: boolean;
  dueOnly: boolean;
  mode: PracticeMode;
}

export default function PracticeSession({ level, category, mandatoryOnly, dueOnly, mode }: Props) {
  const [cards, setCards] = useState<CardWithProgress[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [feedback, setFeedback] = useState<null | { correct: boolean; correctPinyin: string }>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ seen: 0, correct: 0 });

  useEffect(() => {
    void loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, category, mandatoryOnly, dueOnly, mode]);

  async function loadCards() {
    setLoading(true);
    const params = new URLSearchParams();
    if (level) params.set('level', level);
    if (category) params.set('category', category);
    if (mandatoryOnly) params.set('mandatoryOnly', 'true');
    if (dueOnly) params.set('dueOnly', 'true');
    params.set('mode', mode);

    const res = await fetch(`/api/cards?${params.toString()}`);
    const data = await res.json();
    setCards(data.cards ?? []);
    setIndex(0);
    setRevealed(false);
    setFeedback(null);
    setLoading(false);
  }

  const current = cards[index];

  async function submitReading(selfRatedCorrect: boolean) {
    if (!current) return;
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_id: current.id, mode: 'reading', selfRatedCorrect }),
    });
    setStats((s) => ({ seen: s.seen + 1, correct: s.correct + (selfRatedCorrect ? 1 : 0) }));
    advance();
  }

  async function submitWriting() {
    if (!current) return;
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_id: current.id, mode: 'writing', typedAnswer }),
    });
    const data = await res.json();
    setFeedback({ correct: data.wasCorrect, correctPinyin: data.correctPinyin });
    setStats((s) => ({ seen: s.seen + 1, correct: s.correct + (data.wasCorrect ? 1 : 0) }));
  }

  function advance() {
    setTypedAnswer('');
    setFeedback(null);
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  if (loading) {
    return <p className="text-center text-neutral-500 py-12">載入詞語中…</p>;
  }

  if (!current) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium mb-2">全部完成了！🎉</p>
        <p className="text-neutral-500">
          本次已複習 {stats.seen} 個，答對 {stats.correct} 個。
        </p>
        <button
          onClick={loadCards}
          className="mt-6 bg-black text-white rounded-lg px-6 py-2"
        >
          重新檢查
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6">
      <div className="flex justify-between text-sm text-neutral-500">
        <span>
          第 {index + 1} 個，共 {cards.length} 個
        </span>
        <span>
          {stats.correct}/{stats.seen} 答對
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-10 flex flex-col items-center gap-4">
        {current.cky_mandatory && (
          <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">
            ⭐ CKY 必修
          </span>
        )}

        {mode === 'reading' && (
          <>
            <p className="text-5xl font-serif">{current.word}</p>
            {revealed && (
              <div className="text-center">
                <p className="text-xl text-neutral-700">{current.pinyin}</p>
                <p className="text-neutral-500">{current.meaning_en}</p>
              </div>
            )}
          </>
        )}

        {mode === 'writing' && (
          <>
            <p className="text-lg text-neutral-500">請輸入這個詞語的拼音</p>
            <p className="text-5xl font-serif">{current.word}</p>
            <p className="text-sm text-neutral-400">（不需要輸入聲調）</p>
          </>
        )}
      </div>

      {mode === 'reading' && !revealed && (
        <button
          onClick={() => setRevealed(true)}
          className="bg-black text-white rounded-lg py-3 font-medium"
        >
          顯示答案
        </button>
      )}

      {mode === 'reading' && revealed && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => submitReading(false)}
            className="border border-red-300 text-red-600 rounded-lg py-3 font-medium"
          >
            不知道
          </button>
          <button
            onClick={() => submitReading(true)}
            className="border border-green-300 text-green-600 rounded-lg py-3 font-medium"
          >
            知道
          </button>
        </div>
      )}

      {mode === 'writing' && !feedback && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitWriting();
          }}
          className="flex flex-col gap-3"
        >
          <input
            autoFocus
            value={typedAnswer}
            onChange={(e) => setTypedAnswer(e.target.value)}
            placeholder="輸入拼音，例如 tong qing"
            className="border rounded-lg px-4 py-3 text-lg"
          />
          <button type="submit" className="bg-black text-white rounded-lg py-3 font-medium">
            檢查
          </button>
        </form>
      )}

      {mode === 'writing' && feedback && (
        <div className="flex flex-col gap-3">
          <div
            className={`rounded-lg p-4 text-center ${
              feedback.correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            <p className="font-medium">{feedback.correct ? '答對了！' : '不太對'}</p>
            <p className="text-sm mt-1">
              正確拼音：<span className="font-semibold">{feedback.correctPinyin}</span>
            </p>
            <p className="text-sm">{current.meaning_en}</p>
          </div>
          <button onClick={advance} className="bg-black text-white rounded-lg py-3 font-medium">
            下一個
          </button>
        </div>
      )}
    </div>
  );
}
