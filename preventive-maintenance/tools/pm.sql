-- PM Dashboard: เชื่อมข้อมูลทุกเครื่อง (9 ต.ค. 2569)
-- รันครั้งเดียวใน Supabase → SQL Editor → New query → วางทั้งหมด → Run
create table if not exists pm_work_orders   (id text primary key, rec jsonb not null, updated_at timestamptz default now());
create table if not exists pm_fail_followup (id text primary key, rec jsonb not null, updated_at timestamptz default now());
create table if not exists pm_upload_log    (id text primary key, rec jsonb not null, updated_at timestamptz default now());

alter table pm_work_orders   enable row level security;
alter table pm_fail_followup enable row level security;
alter table pm_upload_log    enable row level security;

-- หน้าเว็บไม่มี login: anon อ่าน/เพิ่ม/แก้ได้ (ไม่ให้ลบ)
do $$ declare t text; begin
  foreach t in array array['pm_work_orders','pm_fail_followup','pm_upload_log'] loop
    execute format('drop policy if exists "%s anon read" on %I', t, t);
    execute format('drop policy if exists "%s anon insert" on %I', t, t);
    execute format('drop policy if exists "%s anon update" on %I', t, t);
    execute format('create policy "%s anon read" on %I for select to anon using (true)', t, t);
    execute format('create policy "%s anon insert" on %I for insert to anon with check (true)', t, t);
    execute format('create policy "%s anon update" on %I for update to anon using (true) with check (true)', t, t);
  end loop;
end $$;
