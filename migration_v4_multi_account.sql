-- ============================================================
-- LearnChinese migration v4: multi-account support
-- Moves from a single shared APP_PIN to a chinese_users table,
-- with per-user progress, coins, and shop inventory.
-- ============================================================

-- >>> BEFORE RUNNING: replace THEO_PIN_HERE below with Theo's actual
-- >>> current PIN (the APP_PIN value from your .env.local), so his
-- >>> login stays the same. <<<

-- 1. Users table -----------------------------------------------------
create table if not exists chinese_users (
  id          bigint generated always as identity primary key,
  name        text not null,
  pin         text not null unique,
  created_at  timestamptz not null default now()
);

alter table chinese_users disable row level security;

insert into chinese_users (name, pin) values ('Theo', 'THEO_PIN_HERE');
insert into chinese_users (name, pin) values ('Curtis', '224466');

-- 2. Add user_id to the per-user tables -------------------------------
alter table chinese_card_progress
  add column if not exists user_id bigint references chinese_users(id);
alter table chinese_owned_items
  add column if not exists user_id bigint references chinese_users(id);
alter table chinese_review_sessions
  add column if not exists user_id bigint references chinese_users(id);
alter table chinese_review_events
  add column if not exists user_id bigint references chinese_users(id);

-- 3. Attach all EXISTING progress/inventory rows to Theo's account -----
update chinese_card_progress
set user_id = (select id from chinese_users where name = 'Theo')
where user_id is null;

update chinese_owned_items
set user_id = (select id from chinese_users where name = 'Theo')
where user_id is null;

update chinese_review_sessions
set user_id = (select id from chinese_users where name = 'Theo')
where user_id is null;

update chinese_review_events
set user_id = (select id from chinese_users where name = 'Theo')
where user_id is null;

-- 4. Replace the single-column unique constraints with (x, user_id) ----
alter table chinese_card_progress
  drop constraint if exists chinese_card_progress_card_id_key;
alter table chinese_card_progress
  add constraint chinese_card_progress_card_id_user_id_key unique (card_id, user_id);

alter table chinese_owned_items
  drop constraint if exists chinese_owned_items_item_id_key;
alter table chinese_owned_items
  add constraint chinese_owned_items_item_id_user_id_key unique (item_id, user_id);

-- 5. Make user_id required going forward -------------------------------
alter table chinese_card_progress alter column user_id set not null;
alter table chinese_owned_items alter column user_id set not null;

-- 6. Seed a fresh progress row for every card, for Curtis --------------
insert into chinese_card_progress (card_id, user_id)
select v.id, u.id
from chinese_vocab_cards v
cross join chinese_users u
where u.name = 'Curtis'
on conflict (card_id, user_id) do nothing;
