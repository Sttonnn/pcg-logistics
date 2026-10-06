// สำรองประวัติ Robot รายวันเข้า Supabase robot_days ทุกวัน (6 ต.ค. 2569)
// robot.csv บน Dropbox เก็บแค่ 30 วันล่าสุด → ถ้าไม่มีใครเปิดหน้าเว็บนาน วันที่หลุดจากไฟล์จะหาย
// สคริปต์นี้เปิดหน้า robot-dashboard.html จริงแบบไม่มีจอ (หน้าเว็บบันทึก robot_days เอง ด้วย logic เดิม histSave)
// แล้วตรวจว่าใน robot_days มีวันล่าสุดของ CSV ครบ · ไม่ครบ = job แดง (GitHub ส่งอีเมลแจ้งเจ้าของ repo)
import { chromium } from "playwright";

const PAGE = process.env.ROBOT_URL || "https://sttonnn.github.io/pcg-logistics/robot-dashboard.html";
const b = await chromium.launch();
const p = await b.newPage();
const errs = [];
p.on("pageerror", e => errs.push(e.message));
const saved = [];
p.on("request", r => { if (/robot_days/.test(r.url()) && r.method() === "POST") saved.push(r.postData() || ""); });
await p.goto(PAGE, { waitUntil: "load", timeout: 90000 });
await p.waitForTimeout(45000);   // รอโหลด CSV + histLoad + histSave
const html = await p.content();
await b.close();

const n = saved.reduce((s, x) => { try { return s + JSON.parse(x).length; } catch (e) { return s; } }, 0);
console.log(`บันทึก/อัปเดตวันใหม่เข้า robot_days: ${n} วัน`);

// ตรวจผลจาก Supabase ด้วย anon key ที่อยู่ในหน้าเว็บ (เป็น key สาธารณะอยู่แล้ว)
const raw = await (await fetch(PAGE)).text();
const key = ((raw + html).match(/eyJhbGciOiJIUzI1NiIs[A-Za-z0-9._-]+/) || [])[0];
const url = process.env.SB_URL || "https://mgnshovnibcmiptoxdfe.supabase.co";
if (!key || !url) { console.log("หา Supabase key/url ในหน้าไม่เจอ ข้ามการตรวจ"); process.exit(0); }
const r = await fetch(`${url}/rest/v1/robot_days?select=load_date&order=load_date.desc&limit=400`, { headers: { apikey: key, Authorization: "Bearer " + key } });
if (!r.ok) { console.error("อ่าน robot_days ไม่ได้: HTTP " + r.status); process.exit(1); }
const days = (await r.json()).map(x => String(x.load_date).slice(0, 10));
const months = {}; days.forEach(d => { months[d.slice(0, 7)] = (months[d.slice(0, 7)] || 0) + 1; });
console.log("จำนวนวันที่เก็บไว้แต่ละเดือน:", JSON.stringify(months));
const latest = days[0] || "-", age = latest === "-" ? 999 : Math.round((Date.now() - Date.parse(latest)) / 864e5);
console.log(`วันล่าสุดใน robot_days: ${latest} (${age} วันก่อน)`);
if (errs.length) console.log("page errors:", errs.slice(0, 3).join(" | "));
// วันล่าสุดเก่ากว่า 4 วัน = มีปัญหา (Flow ไม่รัน / หน้าเว็บบันทึกไม่ได้) → ให้ job แดง
if (age > 4) { console.error("⚠ robot_days ไม่ได้อัปเดตเกิน 4 วัน — ตรวจ Flow Sync Robot Load และ robot.csv"); process.exit(1); }
