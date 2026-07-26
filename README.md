# LearnChinese (中文詞彙學習)

Chinese vocabulary practice app for Theo, built on the same architecture as
LearnFrench: Next.js + Supabase + PIN login + Leitner-style spaced repetition,
with separate reading/writing progress tracking. UI is entirely in Traditional
Chinese.

## Setup — existing project (you already imported the word list)

If you already ran the original `schema.sql` and `import_vocab.sql`, **don't**
re-run `schema.sql` — it would try to recreate tables that already exist with
the old single-track progress columns. Instead:

1. Open Supabase's **SQL Editor**
2. Run `migration_v2_reading_writing.sql` — this adds the new split
   reading/writing progress columns, backfills them from your existing
   progress, drops the old columns, and keeps RLS disabled. Your 3,132
   imported words and existing progress are preserved.

## Setup — brand new project

1. Run `schema.sql` in the Supabase SQL Editor (creates all tables, RLS off).
2. Run `import_vocab.sql` to load the 3,132-word list and seed progress rows.

## Env vars

Copy `.env.local.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `APP_PIN` (your PIN, digits only — up to 6)

```bash
npm install
npm run dev
```

Deploy to Vercel as usual — set the same three env vars there.

## How it works

- **Login** (`/login`): PIN screen, session cookie via `proxy.ts` guards
  every other route.
- **Dashboard** (`/dashboard`): per-level (L1–L5) progress bars, one for
  閱讀 (reading) and one for 拼寫 (writing) mastery, plus a reset-all-progress
  button with a confirmation step.
- **Practice** (`/practice`):
  - **閱讀 (reading) mode**: character shown → click 顯示答案 to reveal
    pinyin + meaning → self-rate 知道 / 不知道.
  - **拼寫 (writing) mode**: character shown → type the pinyin → checked
    **toneless** (`lib/pinyin.ts` strips tone marks before comparing) →
    correct toned pinyin always shown after.
  - Filters: 難度 (level L1–L5), 分類 (category, 21 values), ⭐ CKY-mandatory
    toggle, and a "只顯示待複習" (due-only) toggle — uncheck it to freely
    practice the entire matching set with no size limit.
- **Spaced repetition** (`lib/leitner.ts`): 5-box Leitner system, tracked
  **separately** for reading and writing per card (`box_reading` /
  `box_writing`, each with its own `next_review_*` date). Correct → advances
  a box with a longer wait before it resurfaces; incorrect → back to box 1.

## Structure

- `lib/supabase.ts` — Supabase client
- `lib/types.ts` — shared types (includes `LevelSummary` for the dashboard)
- `lib/pinyin.ts` — toneless pinyin comparison
- `lib/leitner.ts` — spaced-repetition box logic (direction-agnostic)
- `app/api/cards` — fetch cards, filtered by level/category/mandatory/mode,
  no pagination cap
- `app/api/progress` — record a review result for reading or writing,
  update that direction's Leitner box
- `app/api/progress-summary` — per-level reading/writing mastery %, for
  the dashboard
- `app/api/reset-progress` — wipes all progress back to box 1
- `app/api/login` — PIN check, sets session cookie
- `components/PracticeSession.tsx` — the practice UI (both modes)
- `components/ProgressBar.tsx`, `components/ResetButton.tsx` — dashboard bits
- `schema.sql` — fresh-install schema
- `migration_v2_reading_writing.sql` — migration for an already-seeded DB
- `import_vocab.sql` — the 3,132-word seed data as SQL inserts
