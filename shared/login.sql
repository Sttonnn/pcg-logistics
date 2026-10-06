-- PCG · ระบบ Login (6 ต.ค. 2569) · รันใน Supabase SQL Editor หลัง merge หน้าเว็บแล้ว
-- ผล: ตาราง mhe_vehicles / shift_edits / warehouses อ่าน-เขียนได้เฉพาะผู้ที่ Login แล้ว (anon อ่าน/เขียนไม่ได้)
-- ไม่แตะตารางของ Robot (robot_entries, robot_days) และตารางอื่น

-- 1) ลบ policy เดิมทั้งหมดของ 3 ตารางนี้
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies
           where schemaname = 'public' and tablename in ('mhe_vehicles', 'shift_edits', 'warehouses')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- 2) เปิด RLS + ให้สิทธิ์เฉพาะ authenticated
alter table public.mhe_vehicles enable row level security;
alter table public.shift_edits  enable row level security;
alter table public.warehouses   enable row level security;

create policy "login read"   on public.mhe_vehicles for select to authenticated using (true);
create policy "login write"  on public.mhe_vehicles for all    to authenticated using (true) with check (true);
create policy "login read"   on public.shift_edits  for select to authenticated using (true);
create policy "login write"  on public.shift_edits  for all    to authenticated using (true) with check (true);
create policy "login read"   on public.warehouses   for select to authenticated using (true);
create policy "login write"  on public.warehouses   for all    to authenticated using (true) with check (true);

-- ตรวจผล: ควรเห็น 6 แถว
select tablename, policyname, roles, cmd from pg_policies
where schemaname = 'public' and tablename in ('mhe_vehicles', 'shift_edits', 'warehouses') order by 1, 2;
