# Handoff: Daily Machine Check (PCG · WHA)

## Overview
แดชบอร์ดผลตรวจเครื่องจักรประจำวันของทีมช่าง 2 คลัง (Domestic 12 เครื่อง / Export 10 เครื่อง) ตรวจวันละ 2 พลัด (เข้า / ดึก)
ผลตรวจมาจาก Microsoft Forms มี 2 มุมมอง: **ภาพรวมวันนี้** และ **ประวัติย้อนหลัง** (7/14/30 วัน)

## About the Design Files
ไฟล์ใน `design/` เป็น **ต้นแบบดีไซน์ HTML** ใช้ดูหน้าตาและพฤติกรรม ไม่ใช่โค้ด production
งานคือสร้างใหม่ในโปรเจกต์จริง แนะนำ **Vite + React (หรือ HTML/JS ล้วน) เป็น static site บน GitHub Pages** เพื่อให้ตรงกับระบบอื่นของ PCG
เปิด `design/Daily Machine Check.dc.html` ในเบราว์เซอร์ได้โดยตรง (ต้องมี support.js / image-slot.js อยู่โฟลเดอร์เดียวกัน)

## Fidelity
**High-fidelity** สี ตัวอักษร ระยะ มุมโค้ง เงา เป็นค่าจริง ให้ทำตามให้ใกล้เคียงที่สุด
หมายเหตุ: หน้านี้ใช้สไตล์ "Portal" (โค้ง ไล่สี เงา) ตามที่ผู้ใช้เลือก ไม่ใช่ Modernist

## Screens / Views

### Header (hero)
- พื้น `linear-gradient(150deg,#101b2d,#16283c 50%,#10333a)` มุมล่างโค้ง 36px (มือถือ 26px) เงา `0 18px 40px rgba(16,27,45,.28)` มีวงแสง radial สีฟ้า #2676f6 / เขียวน้ำทะเล #1ac8c4
- แถวบน: ปุ่ม "หน้าหลัก" (pill, ลิงก์ index.html) · ไอคอน 48px พื้นขาวโค้ง 14px · kicker "PCG · WHA · ทีมช่าง" 12px/600 uppercase · H1 "Daily Machine Check" Archivo 30px/900 (มือถือ 26px) · ช่องเลือกวันที่ (input date)
- ตัวเลือกคลัง: segmented 2 ปุ่ม (Domestic Warehouse / Export Warehouse) แสดงจำนวนเครื่อง + pill "ปกติ" (#d8f5e9/#0a6b4d) หรือ "เสีย N" (#ffe3dc/#a8250f); ปุ่มที่เลือกพื้นขาว ตัวอักษร #16213a
- แถบสถิติ grid `1.3fr 1fr 1fr 1fr` gap 14px (มือถือ 2 คอลัมน์, gauge เต็มแถว)
  - Gauge วงแหวน r=44 stroke 11 สี #39d99a (ถ้ามีเสีย #ffb13d) + "ความพร้อมใช้งาน" ready/total
  - อุปกรณ์ทั้งหมด: gradient #1a5fe4→#0f3fa4
  - ปกติ: #13a878→#0a7353
  - เสีย / ต้องซ่อม: #f0553a→#b8260f (ถ้าไม่มีเสีย #4a5877→#333f5a)
  - การ์ดโค้ง 22px ตัวเลข Archivo 40px/900

### แท็บมุมมอง
pill ขาวโค้ง 18px: "ภาพรวมวันนี้" / "ประวัติย้อนหลัง" แท็บที่เลือก gradient #1a5fe4→#0f3fa4 ตัวขาว

### มุมมอง: ภาพรวมวันนี้
- **แถบเตือน** (เมื่อมีเครื่องเสีย): พื้น #fff1ee→#ffe3dc ขอบ #ffc4b8 โค้ง 20px · "ต้องดูแล N เครื่อง" + รายชื่อ "ชื่อ (พลัดเข้า, พลัดดึก)" · ปุ่ม "ดูเฉพาะที่เสีย" #c9301a (hover #a8250f)
- หัวข้อ "รายการอุปกรณ์" + ชิปชื่อคลัง · ตัวกรอง "ทั้งหมด N" / "เสีย N"
- **เช็กลิสต์อุปกรณ์** (ไม่มีรูป) กล่องขาวโค้ง 22px เงาการ์ด · หัวตาราง: อุปกรณ์ / พลัดเข้า (ดวงอาทิตย์) / พลัดดึก (พระจันทร์) พื้น #f5f7fb
  - แต่ละแถว grid `1fr 150px 150px`: เลขลำดับ · ไอคอน 36px ไล่สีตามประเภท · ชื่อ 15.5px/700 + ประเภท 11px uppercase · ชิปสถานะ 2 พลัด
  - ชิปสถานะ pill มีเครื่องหมาย ✓ ปกติ #e3f6ee/#0a6b4d · ✕ เสีย #ffe3dc/#a8250f · นาฬิกา ยังไม่ตรวจ #eef1f6/#5a6784
  - แถวที่เสีย: ขอบซ้าย 4px #f0553a พื้น #fff6f3
  - ≤760px: ซ่อนหัวตาราง ชื่ออยู่บรรทัดบน ชิป 2 พลัดเรียงคู่ด้านล่างพร้อมคำว่า "พลัดเข้า/พลัดดึก"
- ว่าง (กรองเสียแต่ไม่มี): "ไม่มีอุปกรณ์ที่เสียในวันนี้"

### มุมมอง: ประวัติย้อนหลัง
- ตัวเลือกช่วง 7/14/30 วัน · ตัวกรอง "ทุกวัน" / "เฉพาะวันที่มีเสีย"
- การ์ดสรุป 3 ใบ: ความพร้อมเฉลี่ย (%) · พลัดที่พบเสีย (ครั้ง) · เสียบ่อยที่สุด (ชื่อ + "เสีย X วัน จาก N วัน")
- **Heatmap** รายเครื่อง × รายวัน (เก่า→ใหม่ ซ้ายไปขวา) คอลัมน์ชื่อ sticky 212px · ช่อง 34px (30 วัน = 24px) สูง 24px โค้ง 7px
  - ปกติ #bfead6 · เสีย 1 พลัด #ffb466 · เสียทั้งวัน #e8432a · วันปัจจุบันมีกรอบ inset ฟ้า
  - ชื่อย่อ: "Conveyor Manual"→"Conv. Manual", "Conveyor Semi"→"Conv. Semi"; จุดหน้าชื่อแดงถ้าเคยเสียในช่วง
  - เลื่อนแนวนอนได้บนมือถือ
- **บันทึกรายวัน** แบบไทม์ไลน์: กล่องวันที่ 58px (วันนี้ไล่สีฟ้า) + การ์ดขอบซ้าย 4px (เขียว #39c28b / แดง #f0553a) · "ปกติทุกเครื่อง" หรือ "พบเครื่องเสีย N เครื่อง" · pill "พร้อมใช้ x/y" · รายการเครื่องเสียพร้อมป้ายพลัด

## รายการอุปกรณ์ (key = SITE-ลำดับ)
**DOM (Domestic Warehouse)**: 01 Robot Cleaning (Cleaning) · 02 Drone (Inventory) · 03 Pallet Magazine (Pallet) · 04 Tele Conveyor (Conveyor) · 05 Compress Machine (Compactor) · 06–07 Pallet Wrapping No.1–2 (Wrapping) · 08–12 Conveyor Manual No.1–5 (Conveyor)
**EXP (Export Warehouse)**: 01 Robot (Palletizing) · 02 Tele Conveyor (Conveyor) · 03 Air Compressor (Compressor) · 04 Conveyor Semi ป.33 · 05 Conveyor Semi ป.31 (Conveyor) · 06–08 Shuttle Car No.1–3 (Shuttle) · 09 Conveyor Manual ป.28 · 10 Conveyor Manual ป.26 (Conveyor)

## สีตามประเภท (gradient c1 → c2, 155deg)
Conveyor #2f7cf6→#1a4fc4 · Inventory #6b5cf6→#4331c2 · Cleaning #16b3c9→#0b7f95 · Wrapping #b04ae8→#7a24b8 · Pallet #15b58a→#0a7a5c · Compactor #f39a1d→#c96a07 · Shuttle #f2653a→#c33f16 · Palletizing #e8457a→#b21f52 · Compressor #1ba5e0→#0a6fa8
ไอคอนเป็น Lucide (path อยู่ในค่าคงที่ `IC` ของไฟล์ดีไซน์)

## Interactions & Behavior
- เปลี่ยนคลัง → รีเซ็ตตัวกรองเป็น "ทั้งหมด"
- เปลี่ยนวันที่ → คำนวณทุกอย่างใหม่ (มุมมองวันนี้ = วันที่เลือก, ประวัติ = ย้อนจากวันที่เลือก)
- เครื่องนับว่า "เสีย" ถ้าพลัดใดพลัดหนึ่งเป็น bad
- ความพร้อม % = (เครื่องไม่เสีย / ทั้งหมด) · ความพร้อมเฉลี่ย = ค่าเฉลี่ยรายวันในช่วง
- ถ้าพลัดยังไม่มีคำตอบใน Forms → "ยังไม่ตรวจ" (ไม่นับเป็นเสีย)
- responsive: ไม่มี horizontal overflow ที่ 375px (ยกเว้น heatmap ที่ตั้งใจให้เลื่อน)

## State
`site` (DOM|EXP) · `view` (today|log) · `filter` (all|bad) · `range` (7|14|30) · `logFilter` (all|bad) · `date` (YYYY-MM-DD)
ข้อมูลตอนนี้เป็นตัวอย่างสุ่ม (ฟังก์ชัน `resultFor`) ต้องแทนด้วยข้อมูลจริงตาม `BACKEND.md`

## Design Tokens
- ตัวอักษร: IBM Plex Sans Thai (400–700) เนื้อหา · Archivo (500–900) หัวข้อ/ตัวเลข
- พื้นหน้า #eef2f8 · ตัวอักษรหลัก #16213a · รอง #5a6784 · #2a3b5f · ชิป #dde6f5
- โค้ง: 999 (pill) · 22 (การ์ด) · 20 · 18 · 16 · 14 · 11 · 7
- เงาการ์ด `0 10px 26px rgba(22,33,58,.1)` · เงาเล็ก `0 4px 14px rgba(22,33,58,.08)`
- breakpoints: 760px, 420px

## Assets
- `design/assets/icon-machine.png` ไอคอนหัวหน้า
- หน้าภาพรวมวันนี้เป็นเช็กลิสต์ ไม่ใช้รูปเครื่อง (ผู้ใช้สั่งเอาออก 29 ก.ย.)

## Files
- `design/Daily Machine Check.dc.html` ต้นแบบทั้ง 2 มุมมอง (ค่าคงที่ EQUIP / COL / IC / ST อยู่ใน script ท้ายไฟล์)
- `BACKEND.md` สถาปัตยกรรมข้อมูลและงานอัตโนมัติ
- `CLAUDE.md` คำสั่งสำหรับ Claude Code (เอเจนต์ โชยุ)
- `supabase/schema.sql` ตารางและ RLS
- `sample/machine-check.csv` ตัวอย่างรูปแบบ CSV
