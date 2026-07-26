# LearnChinese (中文詞彙學習)

Chinese vocabulary practice app for Theo and Curtis, built on the same
architecture as LearnFrench: Next.js + Supabase + PIN login + Leitner-style
spaced repetition, with separate reading/writing progress tracking, coins,
and a shop. UI is entirely in Traditional Chinese.

## Setup — existing project (you already imported the word list)

If you already ran the original `schema.sql` and `import_vocab.sql`, **don't**
re-run `schema.sql` — it would try to recreate tables that already exist.
Instead run these in order in the Supabase **SQL Editor**:

1. `migration_v2_reading_writing.sql` — splits progress into reading/writing.
2. `migration_v3_shop.sql` — adds the shop/coin tables, then
   `seed_shop_items.sql` — loads the 50-item catalog.
3. `migration_v4_multi_account.sql` — adds multi-account support. **Before
   running**, open the file and replace `THEO_PIN_HERE` with Theo's actual
   current PIN, so his login stays the same. This creates `chinese_users`
   (Theo + Curtis), attaches all of Theo's existing progress/coins/inventory
   to his account, and seeds fresh progress rows for Curtis.

## Setup — brand new project

1. Run `schema.sql`, then `import_vocab.sql` (word list).
2. Run `migration_v3_shop.sql`, then `seed_shop_items.sql` (shop).
3. Run `migration_v4_multi_account.sql` with real PINs filled in (accounts).

## Env vars

Copy `.env.local.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

PINs are no longer set via env var — they live in the `chinese_users` table.

```bash
npm install
npm run dev
```

Deploy to Vercel as usual — set the same two env vars there.

## Adding another account later

```sql
insert into chinese_users (name, pin) values ('NewName', '123456');

insert into chinese_card_progress (card_id, user_id)
select v.id, u.id from chinese_vocab_cards v
cross join chinese_users u where u.name = 'NewName'
on conflict (card_id, user_id) do nothing;
```

## How it works

- **Login** (`/login`): PIN screen. Each PIN maps to a specific account in
  `chinese_users` — the session cookie stores that account's id, and
  `proxy.ts` guards every other route. `/api/me` returns the current
  account's name; the dashboard has a 登出 (logout) link.
- **Dashboard** (`/dashboard`): greets the logged-in account by name, shows
  the character panel, per-level (L1–L5) progress bars for 閱讀 (reading)
  and 拼寫 (writing), and a reset-all-progress button (scoped to that
  account only).
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
  **separately** for reading and writing per card, per account.
- **Coins & shop** (`/shop`): 1 coin per correct answer, derived from
  `times_correct` (no separate ledger). 50 items across 武器/工具/防具/裝飾,
  15–100 coins each. Equip one item per category slot — shown visually on
  the dashboard's character panel (weapon/tool in hand, armor on torso with
  tier-based color, decoration above the head). All scoped per account.

## Structure

- `lib/supabase.ts` — Supabase client
- `lib/session.ts` — reads the logged-in account's id from the session cookie
- `lib/types.ts` — shared types
- `lib/pinyin.ts` — toneless pinyin comparison
- `lib/leitner.ts` — spaced-repetition box logic (direction-agnostic)
- `lib/coins.ts` — derives coin balance from times_correct minus owned items,
  per account
- `lib/itemIcons.ts` — emoji icon per shop item
- `app/api/login`, `app/api/logout`, `app/api/me` — account auth
- `app/api/cards` — fetch cards for the logged-in account, filtered by
  level/category/mandatory/mode, no pagination cap
- `app/api/progress` — record a review result for reading or writing
- `app/api/progress-summary` — per-level reading/writing mastery %
- `app/api/reset-progress` — wipes progress + owned items for that account
- `app/api/shop`, `app/api/shop/buy`, `app/api/shop/equip` — shop catalog,
  purchases, and equip/unequip
- `components/PracticeSession.tsx` — the practice UI (both modes)
- `components/ProgressBar.tsx`, `components/ResetButton.tsx` — dashboard bits
- `components/CharacterPanel.tsx` — equipped-item character display
- `app/shop/page.tsx` — the shop UI
- `schema.sql` — fresh-install schema (v1 tables)
- `migration_v2_reading_writing.sql` — split reading/writing progress
- `migration_v3_shop.sql`, `seed_shop_items.sql` — shop tables + catalog
- `migration_v4_multi_account.sql` — chinese_users + per-account scoping
- `import_vocab.sql` — the 3,132-word seed data as SQL inserts
