-- บันทึกการประชุม Project Weekly (MoM) · 1 แถว = 1 การประชุม (rec = JSON ทั้งการประชุม)
-- ลบ = rec.del = true (หน้าเว็บไม่ลบแถวจริง)
create table if not exists public.mom_meetings (
  id text primary key,
  rec jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.mom_meetings enable row level security;
drop policy if exists "mom read" on public.mom_meetings;
drop policy if exists "mom insert" on public.mom_meetings;
drop policy if exists "mom update" on public.mom_meetings;
create policy "mom read" on public.mom_meetings for select to anon, authenticated using (true);
create policy "mom insert" on public.mom_meetings for insert to anon, authenticated with check (true);
create policy "mom update" on public.mom_meetings for update to anon, authenticated using (true) with check (true);
