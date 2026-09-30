# Backend & Automation — Daily Machine Check

## ข้อจำกัดของบริษัท (ห้ามฝ่าฝืน)
- ไม่มี Office Script และ HTTP connector (Premium) ใน Power Automate
- License Power Automate: List rows เพดาน 5,000 แถว
- เว็บเผยแพร่ Public ผ่าน GitHub Pages → ในโค้ดมีได้แค่ Supabase **anon key** ต้องเปิด RLS ทุกตาราง
- ลิงก์ Dropbox ในโค้ดมองเห็นได้ทุกคน

## Pipeline (ใช้แบบเดียวกับ Robot)
```
Microsoft Forms ──(Power Automate: standard connectors)──▶ Excel "MachineCheck" table
        └──▶ Dropbox /machine-check.csv (30 วันล่าสุด) ──▶ Dashboard (fetch ทุก 60 วิ)
GitHub Actions (cron) ──▶ อ่าน CSV ──▶ ตรวจความผิดปกติ ──▶ upsert Supabase + สรุปผล
```

### Flow A: "MC Form → Excel" (trigger ทุกครั้งที่ส่งฟอร์ม)
1. Microsoft Forms – When a new response is submitted
2. Microsoft Forms – Get response details
3. Excel Online – Add a row into a table (Table `MachineCheck`)
   คอลัมน์: `date` (Serial Number), `site` (DOM|EXP), `shift` (day|night), `machine_key`, `status` (ok|bad), `fault`, `inspector`, `submitted_at`
   แนะนำให้ฟอร์ม 1 คำตอบ = 1 พลัด 1 คลัง แล้วใช้ Apply to each เพิ่มแถวรายเครื่อง

### Flow B: "MC Excel → CSV" (Recurrence ทุก 15 นาที)
List rows (Serial Number, Pagination On, Threshold 5000) → Filter array 30 วัน → Create CSV table → Dropbox Update file `machine-check.csv`
สูตรกรอง (ตรวจชื่อฟังก์ชันแล้ว):
`@greaterOrEquals(float(concat('0', item()?['date'])), sub(div(sub(ticks(utcNow()), ticks('1899-12-30T00:00:00Z')), 864000000000), 30))`

## รูปแบบ CSV
`date,site,shift,machine_key,status,fault,inspector,submitted_at` (ดู sample/)
- date: serial Excel หรือ YYYY-MM-DD (dashboard ต้องรองรับทั้งคู่)
- ถ้ามีหลายแถวของ key+date+shift เดียวกัน ใช้แถวที่ submitted_at ล่าสุด
- ไม่มีแถว = "ยังไม่ตรวจ"

## Supabase
ดู `supabase/schema.sql` — ตาราง `machine_checks` (ผลตรวจ) และ `machine_daily_audit` (ผลตรวจความผิดปกติรายวันของโชยุ)
Dashboard อ่านจาก Supabase เป็นหลัก ถ้าล้มเหลวให้ fallback ไป CSV บน Dropbox

## งานอัตโนมัติ (GitHub Actions)
`.github/workflows/machine-sync.yml` cron `*/30 * * * *` + `workflow_dispatch`
สคริปต์ `scripts/sync-machine.mjs`:
1. ดาวน์โหลด CSV จาก Dropbox (`DROPBOX_CSV_URL`, ใช้ ?dl=1)
2. แปลง + ตรวจ: key ไม่อยู่ใน EQUIP, site/shift/status ผิดค่า, แถวซ้ำ, วันที่ในอนาคต, วันล่าสุดเก่ากว่าเมื่อวาน, จำนวนแถวใน Excel ใกล้ 4,500
3. upsert ลง `machine_checks` (on conflict date,site,shift,machine_key)
4. เขียนผลลง `machine_daily_audit` เป็น ปกติ / ต้องดู / ต้องแก้
Secrets ใน GitHub (ไม่อยู่ในโค้ด): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DROPBOX_CSV_URL`
> service_role key ใช้ได้เฉพาะใน GitHub Actions secrets เท่านั้น ห้ามอยู่ในไฟล์เว็บ

## การเผยแพร่
build → `publish-site/machine-check.html` แล้วเปลี่ยนการ์ดใน PCG Project Portal จาก Coming Soon เป็นลิงก์ + ป้าย LIVE
