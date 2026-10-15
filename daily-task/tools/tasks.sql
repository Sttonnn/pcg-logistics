-- Daily Task Dashboard: เก็บงานให้ทุกเครื่องเห็นตรงกัน (15 ต.ค. 2569)
-- รันครั้งเดียวใน Supabase โปรเจกต์ mgnshovnibcmiptoxdfe (โปรเจกต์เดียวกับ PM / แจ้งซ่อม) → SQL Editor → New query → วางทั้งหมด → Run
create table if not exists daily_tasks (id text primary key, rec jsonb not null, updated_at timestamptz default now());
alter table daily_tasks enable row level security;
-- หน้าเว็บไม่มี login: anon อ่าน/เพิ่ม/แก้ได้ (ไม่ให้ลบ · ลบบนเว็บ = ตั้ง rec.del = true)
drop policy if exists "daily_tasks anon read" on daily_tasks;
drop policy if exists "daily_tasks anon insert" on daily_tasks;
drop policy if exists "daily_tasks anon update" on daily_tasks;
create policy "daily_tasks anon read" on daily_tasks for select to anon using (true);
create policy "daily_tasks anon insert" on daily_tasks for insert to anon with check (true);
create policy "daily_tasks anon update" on daily_tasks for update to anon using (true) with check (true);
