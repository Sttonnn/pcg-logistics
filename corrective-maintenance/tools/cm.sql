-- CM Dashboard (สรุปรวมแจ้งซ่อม): เชื่อมข้อมูลทุกเครื่อง (14 ต.ค. 2569)
-- รันครั้งเดียวใน Supabase (โปรเจกต์เดียวกับ PM) → SQL Editor → New query → วางทั้งหมด → Run
create table if not exists cm_work_orders (id text primary key, rec jsonb not null, updated_at timestamptz default now());
create table if not exists cm_upload_log  (id text primary key, rec jsonb not null, updated_at timestamptz default now());

alter table cm_work_orders enable row level security;
alter table cm_upload_log  enable row level security;

-- หน้าเว็บไม่มี login: anon อ่าน/เพิ่ม/แก้ได้ (ไม่ให้ลบ) แบบเดียวกับ PM
do $$ declare t text; begin
  foreach t in array array['cm_work_orders','cm_upload_log'] loop
    execute format('drop policy if exists "%s anon read" on %I', t, t);
    execute format('drop policy if exists "%s anon insert" on %I', t, t);
    execute format('drop policy if exists "%s anon update" on %I', t, t);
    execute format('create policy "%s anon read" on %I for select to anon using (true)', t, t);
    execute format('create policy "%s anon insert" on %I for insert to anon with check (true)', t, t);
    execute format('create policy "%s anon update" on %I for update to anon using (true) with check (true)', t, t);
  end loop;
end $$;
