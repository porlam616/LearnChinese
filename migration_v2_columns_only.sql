-- Run this now. It's the column-adding part of the migration that got
-- rolled back earlier (Supabase's SQL Editor runs a pasted script as one
-- transaction, so when the mode-constraint step failed, everything before
-- it -- including these column adds -- was undone too).
-- The mode-constraint fix has already been applied separately, so this
-- script does NOT touch chinese_review_events / chinese_review_sessions.

-- 1. Add the new reading/writing columns -------------------------
alter table chinese_card_progress
  add column if not exists box_reading int not null default 1
    check (box_reading between 1 and 5),
  add column if not exists next_review_reading timestamptz not null default now(),
  add column if not exists box_writing int not null default 1
    check (box_writing between 1 and 5),
  add column if not exists next_review_writing timestamptz not null default now(),
  add column if not exists times_correct int not null default 0,
  add column if not exists times_incorrect int not null default 0;

-- 2. Backfill from the old single-track columns -------------------
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_name = 'chinese_card_progress' and column_name = 'leitner_box') then
    update chinese_card_progress
    set box_reading = leitner_box,
        box_writing = leitner_box;
  end if;

  if exists (select 1 from information_schema.columns
             where table_name = 'chinese_card_progress' and column_name = 'next_review_at') then
    update chinese_card_progress
    set next_review_reading = next_review_at,
        next_review_writing = next_review_at;
  end if;

  if exists (select 1 from information_schema.columns
             where table_name = 'chinese_card_progress' and column_name = 'correct_count') then
    update chinese_card_progress set times_correct = correct_count;
  end if;

  if exists (select 1 from information_schema.columns
             where table_name = 'chinese_card_progress' and column_name = 'incorrect_count') then
    update chinese_card_progress set times_incorrect = incorrect_count;
  end if;
end $$;

-- 3. Drop the old single-track columns -----------------------------
alter table chinese_card_progress
  drop column if exists leitner_box,
  drop column if exists next_review_at,
  drop column if exists last_mode,
  drop column if exists correct_streak,
  drop column if exists correct_count,
  drop column if exists incorrect_count;

-- 4. New indexes for the split due-date columns --------------------
create index if not exists idx_chinese_card_progress_next_reading
  on chinese_card_progress (next_review_reading);
create index if not exists idx_chinese_card_progress_next_writing
  on chinese_card_progress (next_review_writing);

drop index if exists idx_chinese_card_progress_next_review;

-- 5. Make sure RLS stays off ---------------------------------------
alter table chinese_vocab_cards disable row level security;
alter table chinese_card_progress disable row level security;
alter table chinese_review_sessions disable row level security;
alter table chinese_review_events disable row level security;
