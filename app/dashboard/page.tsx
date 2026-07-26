'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProgressBar from '@/components/ProgressBar';
import ResetButton from '@/components/ResetButton';
import type { LevelSummary } from '@/lib/types';

const LEVEL_LABELS: Record<string, string> = {
  L1: 'L1 基礎',
  L2: 'L2 初階',
  L3: 'L3 中階',
  L4: 'L4 中高階',
  L5: 'L5 進階',
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<LevelSummary[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/progress-summary');
    const data = await res.json();
    setSummary(data.summary ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount
    void load();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 py-10 px-4">
      <div className="max-w-md mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">中文詞彙學習</h1>

        <Link
          href="/practice"
          className="bg-black text-white rounded-lg py-3 text-center font-medium"
        >
          開始練習
        </Link>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-neutral-500">各難度進度</h2>
          {loading && <p className="text-neutral-400 text-sm">載入中…</p>}
          {!loading &&
            summary.map((s) => (
              <div key={s.level} className="bg-white rounded-xl border p-4">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-medium">{LEVEL_LABELS[s.level] ?? s.level}</span>
                  <span className="text-xs text-neutral-400">{s.total} 個詞語</span>
                </div>
                <div className="flex gap-4">
                  <ProgressBar label="閱讀" value={s.reading_mastery_pct} />
                  <ProgressBar label="拼寫" value={s.writing_mastery_pct} />
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  已練習：閱讀 {s.reading_reviewed} 個 · 拼寫 {s.writing_reviewed} 個
                </p>
              </div>
            ))}
        </section>

        <ResetButton onReset={load} />
      </div>
    </main>
  );
}
