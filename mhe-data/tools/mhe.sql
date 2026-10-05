-- PCG Overall MHE Data · ตารางเก็บการแก้ไข / อัปโหลดบนเว็บ (1 แถว = รถ 1 คัน)
-- id = "SN:<Serial>" หรือ key ที่สร้างจากหน่วยงาน|UL|คลัง|รุ่น|วันที่สัญญา · rec = ข้อมูลรถทั้งคัน (ทับค่าจากไฟล์ที่ฝังในหน้าเว็บ)
-- removed = true → ซ่อนรถคันนั้น (กด "ลบรถคันนี้")
create table if not exists public.mhe_vehicles (
  id         text primary key,
  rec        jsonb,
  removed    boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.mhe_vehicles enable row level security;
create policy "mhe_vehicles read"   on public.mhe_vehicles for select using (true);
create policy "mhe_vehicles insert" on public.mhe_vehicles for insert with check (true);
create policy "mhe_vehicles update" on public.mhe_vehicles for update using (true) with check (true);
create policy "mhe_vehicles delete" on public.mhe_vehicles for delete using (true);
