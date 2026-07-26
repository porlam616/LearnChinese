-- Corrected order: drop the old constraints FIRST, so the relabeling
-- updates aren't blocked by the constraint they're trying to fix.

alter table chinese_review_events
  drop constraint if exists chinese_review_events_mode_check;
alter table chinese_review_sessions
  drop constraint if exists chinese_review_sessions_mode_check;

update chinese_review_events set mode = 'reading' where mode = 'reveal';
update chinese_review_events set mode = 'writing' where mode = 'type';

update chinese_review_sessions set mode = 'reading' where mode = 'reveal';
update chinese_review_sessions set mode = 'writing' where mode = 'type';
-- 'mixed' rows in chinese_review_sessions need no change

-- Now re-add the new constraints, safe since all rows already match:
alter table chinese_review_sessions
  add constraint chinese_review_sessions_mode_check
  check (mode in ('reading','writing','mixed'));

alter table chinese_review_events
  add constraint chinese_review_events_mode_check
  check (mode in ('reading','writing'));
