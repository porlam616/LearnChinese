-- ============================================================
-- LearnChinese migration v3: coins, shop, character equipment
-- Run this on the existing project (after v2 is already applied).
-- ============================================================

-- 1. Shop items catalog ---------------------------------------------
create table if not exists chinese_shop_items (
  id          bigint generated always as identity primary key,
  name_zh     text not null,
  name_en     text not null,
  category    text not null check (category in ('武器','工具','防具','裝飾')),
  price       int not null check (price > 0),
  created_at  timestamptz not null default now()
);

-- 2. Owned items (single learner, no users table needed) -----------
create table if not exists chinese_owned_items (
  id            bigint generated always as identity primary key,
  item_id       bigint not null references chinese_shop_items(id) on delete cascade,
  equipped      boolean not null default false,
  purchased_at  timestamptz not null default now(),
  unique (item_id)
);

alter table chinese_shop_items disable row level security;
alter table chinese_owned_items disable row level security;

-- Coins are NOT a separate ledger table -- balance is derived:
--   earned = sum(times_correct) across chinese_card_progress
--            (1 coin per correct answer, already tracked)
--   spent  = sum(price) of chinese_shop_items the learner owns
--   balance = earned - spent
-- This keeps "1 coin per correct answer" automatically in sync with
-- existing practice data, no new tracking needed for earning.
