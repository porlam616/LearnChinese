-- ============================================================
-- LearnChinese Supabase schema (v2)
-- Mirrors LearnFrench's structure, adapted for:
--   - character -> pinyin/meaning vocab (level + category as filters,
--     no topic/module table)
--   - SPLIT reading/writing Leitner tracking, same as
--     french_vocab_cards' box_reading / box_writing
--   - CKY-mandatory flag (star) carried from the source word list
--   - No practice-size restriction: /api/cards returns everything
--     matching the filters, unpaginated
-- ============================================================

-- 1. Vocab cards ------------------------------------------------
create table if not exists chinese_vocab_cards (
  id            bigint generated always as identity primary key,
  word          text not null,               -- 詞語 (Chinese characters)
  pinyin        text not null,                -- toneless-checkable, tone marks stored here
  meaning_en    text not null,                -- 簡單英文翻譯
  level         text not null                 -- L1 - L5
                  check (level in ('L1','L2','L3','L4','L5')),
  category      text not null,                -- 分類, e.g. 動作/心理/物品...
  cky_mandatory boolean not null default false, -- ⭐ in the source list
  created_at    timestamptz not null default now()
);

create index if not exists idx_chinese_vocab_cards_level
  on chinese_vocab_cards (level);
create index if not exists idx_chinese_vocab_cards_category
  on chinese_vocab_cards (category);
create index if not exists idx_chinese_vocab_cards_mandatory
  on chinese_vocab_cards (cky_mandatory);

-- 2. Per-card progress, split reading vs writing -----------------
-- Single learner (Theo) via PIN auth, so no separate users table.
-- "reading" = 閱讀 mode (see character, reveal pinyin/meaning)
-- "writing" = 拼寫 mode (hear/see cue, type pinyin)
create table if not exists chinese_card_progress (
  id                    bigint generated always as identity primary key,
  card_id               bigint not null references chinese_vocab_cards(id) on delete cascade,
  box_reading           int not null default 1 check (box_reading between 1 and 5),
  next_review_reading   timestamptz not null default now(),
  box_writing           int not null default 1 check (box_writing between 1 and 5),
  next_review_writing   timestamptz not null default now(),
  times_correct         int not null default 0,
  times_incorrect       int not null default 0,
  last_reviewed_at      timestamptz,
  updated_at            timestamptz not null default now(),
  unique (card_id)
);

create index if not exists idx_chinese_card_progress_next_reading
  on chinese_card_progress (next_review_reading);
create index if not exists idx_chinese_card_progress_next_writing
  on chinese_card_progress (next_review_writing);

-- 3. Session log (optional but useful for stats) -------------------
create table if not exists chinese_review_sessions (
  id            bigint generated always as identity primary key,
  started_at    timestamptz not null default now(),
  ended_at      timestamptz,
  mode          text not null check (mode in ('reading','writing','mixed')),
  cards_seen    int not null default 0,
  cards_correct int not null default 0
);

create table if not exists chinese_review_events (
  id            bigint generated always as identity primary key,
  session_id    bigint references chinese_review_sessions(id) on delete cascade,
  card_id       bigint not null references chinese_vocab_cards(id) on delete cascade,
  mode          text not null check (mode in ('reading','writing')),
  was_correct   boolean,
  typed_answer  text,                 -- what Theo typed, 'writing' mode only
  box_before    int,
  box_after     int,
  created_at    timestamptz not null default now()
);

-- 4. Auto-update updated_at on progress rows -----------------------
create or replace function chinese_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_chinese_card_progress_touch on chinese_card_progress;
create trigger trg_chinese_card_progress_touch
  before update on chinese_card_progress
  for each row execute function chinese_touch_updated_at();

-- 5. Seed helper: ensure every vocab card has a progress row -------
-- Run this once after loading chinese_vocab_cards from the CSV.
insert into chinese_card_progress (card_id)
select id from chinese_vocab_cards
on conflict (card_id) do nothing;

-- 6. This app is single-family and PIN-gated at the app layer,
--    so RLS is left off (matches how the live project was fixed).
alter table chinese_vocab_cards disable row level security;
alter table chinese_card_progress disable row level security;
alter table chinese_review_sessions disable row level security;
alter table chinese_review_events disable row level security;
