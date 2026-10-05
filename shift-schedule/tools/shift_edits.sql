-- ตารางเก็บการแก้ไขตารางกะบนเว็บ (Shift Schedule แผนกโครงการ)
create table if not exists public.shift_edits (
  emp_id     text not null,
  work_date  date not null,
  code       text,
  updated_at timestamptz not null default now(),
  primary key (emp_id, work_date)
);
alter table public.shift_edits enable row level security;
create policy "shift_edits read"   on public.shift_edits for select using (true);
create policy "shift_edits insert" on public.shift_edits for insert with check (true);
create policy "shift_edits update" on public.shift_edits for update using (true) with check (true);
create policy "shift_edits delete" on public.shift_edits for delete using (true);
