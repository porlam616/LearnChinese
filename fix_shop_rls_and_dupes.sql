-- 1. Disable RLS on the shop tables (same fix as before)
alter table chinese_shop_items disable row level security;
alter table chinese_owned_items disable row level security;

-- 2. Remove duplicate items (seed script was run 3x -> 150 rows for 50 items)
-- Keeps the lowest id per (name_zh, category) pair, deletes the rest.
delete from chinese_shop_items a
using chinese_shop_items b
where a.name_zh = b.name_zh
  and a.category = b.category
  and a.id > b.id;

-- 3. Confirm: should now show 50
select count(*) from chinese_shop_items;
