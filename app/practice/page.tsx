'use client';

import { useState } from 'react';
import Link from 'next/link';
import PracticeSession from '@/components/PracticeSession';
import type { PracticeMode } from '@/lib/types';

const LEVELS = ['L1', 'L2', 'L3', 'L4', 'L5'];
const CATEGORIES = [
  '動作', '心理', '物品', '性格', '地點景物', '外貌', '天文氣象', '人生哲理',
  '動物', '四季', '環境保護', '食物', '科技知識', '顏色', '人物', '節日',
  '植物', '活動事件', '時間', '語文概念', '健康',
];

export default function PracticePage() {
  const [mode, setMode] = useState<PracticeMode>('reading');
  const [level, setLevel] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [mandatoryOnly, setMandatoryOnly] = useState(false);
  const [dueOnly, setDueOnly] = useState(true);
  const [started, setStarted] = useState(false);

  if (started) {
    return (
      <main className="min-h-screen bg-neutral-50 py-10 px-4">
        <div className="max-w-md mx-auto mb-4">
          <button
            onClick={() => setStarted(false)}
            className="text-sm text-neutral-500 underline"
          >
            ← 更改設定 / 結束練習
          </button>
        </div>
        <PracticeSession
          level={level}
          category={category}
          mandatoryOnly={mandatoryOnly}
          dueOnly={dueOnly}
          mode={mode}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 py-10 px-4">
      <div className="max-w-md mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">中文詞彙學習</h1>
          <Link href="/dashboard" className="text-sm text-neutral-500 underline">
            進度總覽
          </Link>
        </div>

        <section>
          <h2 className="text-sm font-medium text-neutral-500 mb-2">模式</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode('reading')}
              className={`rounded-lg py-3 border ${
                mode === 'reading' ? 'bg-black text-white' : 'bg-white'
              }`}
            >
              閱讀
            </button>
            <button
              onClick={() => setMode('writing')}
              className={`rounded-lg py-3 border ${
                mode === 'writing' ? 'bg-black text-white' : 'bg-white'
              }`}
            >
              拼寫
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-neutral-500 mb-2">難度</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setLevel(null)}
              className={`rounded-full px-3 py-1 text-sm border ${
                level === null ? 'bg-black text-white' : 'bg-white'
              }`}
            >
              全部
            </button>
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`rounded-full px-3 py-1 text-sm border ${
                  level === l ? 'bg-black text-white' : 'bg-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-neutral-500 mb-2">分類</h2>
          <select
            value={category ?? ''}
            onChange={(e) => setCategory(e.target.value || null)}
            className="border rounded-lg px-3 py-2 w-full"
          >
            <option value="">全部分類</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </section>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={mandatoryOnly}
            onChange={(e) => setMandatoryOnly(e.target.checked)}
          />
          ⭐ 只顯示 CKY 必修詞語
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={dueOnly}
            onChange={(e) => setDueOnly(e.target.checked)}
          />
          只顯示待複習的詞語（取消可練習全部）
        </label>

        <button
          onClick={() => setStarted(true)}
          className="bg-black text-white rounded-lg py-3 font-medium"
        >
          開始練習
        </button>
      </div>
    </main>
  );
}
