-- Daily Machine Check schema
create table if not exists public.machine_checks (
  date date not null,
  site text not null check (site in ('DOM','EXP')),
  shift text not null check (shift in ('day','night')),
  machine_key text not null,
  status text not null check (status in ('ok','bad')),
  fault text,
  inspector text,
  submitted_at timestamptz,
  updated_at timestamptz default now(),
  primary key (date, site, shift, machine_key)
);
create table if not exists public.machine_daily_audit (
  run_at timestamptz primary key default now(),
  level text not null check (level in ('ปกติ','ต้องดู','ต้องแก้')),
  findings jsonb not null default '[]'
);
alter table public.machine_checks enable row level security;
alter table public.machine_daily_audit enable row level security;
-- เว็บ (anon) อ่านได้อย่างเดียว; เขียนผ่าน service_role ใน GitHub Actions เท่านั้น
create policy "anon read checks" on public.machine_checks for select to anon using (true);
create policy "anon read audit" on public.machine_daily_audit for select to anon using (true);
