// ตรวจคุณภาพข้อมูล Robot ทุกเช้า (1 พ.ย. 2569 · ผู้ใช้สั่ง "ทำชั้นที่ 3")
// อ่าน robot.csv จาก Dropbox (ไฟล์ที่ Flow "Sync Robot Load" เขียน) + robot_entries จาก Supabase (anon key สาธารณะในหน้าเว็บ)
// กฎเดียวกับป้ายเตือนบน robot-dashboard.html:
//  ① ข้อมูลไม่อัปเดตเกิน 2 วัน ② ตู้น้อยกว่าแผน ③ ตู้ยังไม่กรอกเวลา (เก่ากว่าเมื่อวาน)
//  ④ เลขสายส่งอยู่ในช่วงของวันข้างเคียง (วันที่โหลดอาจลงผิด) ⑤ แถวซ้ำใน Excel
// พบข้อ ①②④ = job แดง → GitHub ส่งอีเมลแจ้งเจ้าของ repo · ข้อ ③⑤ = เตือนใน Job summary อย่างเดียว
import fs from "node:fs";

const CSV = process.env.ROBOT_CSV || "https://www.dropbox.com/scl/fi/tackqddg35xdt41rs4r5x/robot.csv?rlkey=ikqlvz6gfujzyo5ik07ni680b&dl=1";
const PAGE = "https://sttonnn.github.io/pcg-logistics/robot-dashboard.html";
const SB = "https://mgnshovnibcmiptoxdfe.supabase.co";

const T0 = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
const addD = (d, n) => new Date(Date.parse(d + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);
const Y1 = addD(T0, -1), FROM = addD(T0, -10);
const TH_M = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const thd = d => +d.slice(8, 10) + " " + TH_M[+d.slice(5, 7) - 1];

// ---- robot.csv
const r = await fetch(CSV);
if (!r.ok) { console.error("โหลด robot.csv ไม่ได้: HTTP " + r.status); process.exit(1); }
const text = (await r.text()).replace(/^﻿/, "");
const split = l => { const out = []; let cur = "", q = false;
  for (let i = 0; i < l.length; i++) { const ch = l[i];
    if (ch === '"') { if (q && l[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
    else if (ch === "," && !q) { out.push(cur.trim()); cur = ""; } else cur += ch; }
  out.push(cur.trim()); return out; };
const lines = text.split(/\r?\n/).filter(Boolean);
const head = split(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, ""));
const at = n => head.indexOf(n.toLowerCase().replace(/\s+/g, ""));
const I = { d: at("วันที่โหลด"), c: at("ตู้ที่"), s: at("สายส่ง"), k: at("รหัสอาหาร"), l: at("lot"), q: at("qty"), p: at("จำนวนพาเลท"), w: at("น้ำหนัก"), id: at("ItemInternalId") };
const toIso = v => { const s = parseFloat(v); if (s > 20000) return new Date(Date.UTC(1899, 11, 30) + Math.round(s) * 864e5).toISOString().slice(0, 10);
  const m = String(v || "").match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/); if (m) { let y = +m[3]; if (y > 2400) y -= 543; return y + "-" + String(+m[2]).padStart(2, "0") + "-" + String(+m[1]).padStart(2, "0"); }
  return null; };
const days = {}, seen = new Map();
for (const l of lines.slice(1)) {
  const c = split(l), d = toIso(c[I.d]); if (!d) continue;
  const ship = (c[I.s] || "").trim() || "#" + (c[I.c] || "");
  const rk = [d, ship, c[I.k], c[I.l], c[I.q], c[I.p], c[I.w]].join("|");
  const D = days[d] || (days[d] = {});
  const ct = D[ship] || (D[ship] = { ship, rows: 0, dup: 0, flow: 0 });
  const id = I.id > -1 ? c[I.id] || "" : "";
  if (seen.has(rk)) { if (id && seen.get(rk).has(id)) ct.flow++; else ct.dup++; seen.get(rk).add(id); continue; }
  seen.set(rk, new Set([id])); ct.rows++;
}
const dates = Object.keys(days).sort();
const last = dates[dates.length - 1] || "";
console.log(`robot.csv: ${lines.length - 1} แถว · ${dates[0]} – ${last}`);

// ---- robot_entries (เวลาเริ่ม/เสร็จ + แผน)
// anon key: อ่านจาก robot-dashboard.html ใน repo (Actions checkout มาแล้ว) ถ้าไม่มีค่อยโหลดจากเว็บ
let pg = ""; try { pg = fs.readFileSync(new URL("../robot-dashboard.html", import.meta.url), "utf8"); } catch (e) {}
if (!/eyJhbGciOiJIUzI1NiIs/.test(pg)) { try { pg = await (await fetch(PAGE)).text(); } catch (e) {} }
const key = process.env.SB_KEY || (pg.match(/eyJhbGciOiJIUzI1NiIs[A-Za-z0-9._-]+/) || [])[0];
let E = {};
if (process.env.ENTRIES_JSON) E = JSON.parse(fs.readFileSync(process.env.ENTRIES_JSON, "utf8"));   // ใช้ทดสอบในเครื่อง
else if (key) try {
  const er = await fetch(`${SB}/rest/v1/robot_entries?select=key,start_time,finish_time&load_date=gte.${FROM}`, { headers: { apikey: key, Authorization: "Bearer " + key } });
  if (er.ok) for (const x of await er.json()) E[x.key] = x;
  else console.log("อ่าน robot_entries ไม่ได้: HTTP " + er.status);
} catch (e) { console.log("อ่าน robot_entries ไม่ได้: " + e.message); }
else console.log("หา anon key ในหน้าเว็บไม่เจอ ข้ามกฎที่ต้องใช้เวลา/แผน");

// ---- กฎ
const out = [];
const age = last ? Math.round((Date.parse(T0) - Date.parse(last)) / 864e5) : 99;
if (age > 2) out.push({ lv: 2, tag: "ข้อมูลค้าง", msg: `ข้อมูลล่าสุดคือ ${last ? thd(last) : "-"} ไม่อัปเดตมา ${age} วัน · ตรวจ Flow Sync Robot Load (Run history) และขั้น List rows (Order By วันที่โหลด desc)` });
const DD = dates.filter(d => d >= FROM && d <= T0);
const shipN = s => { const v = parseInt(String(s).replace(/\D/g, ""), 10); return isFinite(v) && v > 1e6 ? v : null; };
const listOf = d => Object.values(days[d] || {});
for (const d of DD) {
  const cs = listOf(d), n = cs.length, p = parseInt((E[d + "#PLAN"] || {}).start_time, 10);
  if (d < T0 && p > 0 && n < p) out.push({ lv: 2, tag: "ตู้ไม่ครบ", msg: `${thd(d)}: แผน ${p} ตู้ แต่ robot.csv มี ${n} ตู้ · ตรวจ Excel ว่ากรอกครบ วันที่ถูก และแถวอยู่ในตาราง` });
  for (const c of cs) {
    if (c.flow + c.dup) out.push({ lv: 1, tag: "ข้อมูลซ้ำ", msg: `สายส่ง ${c.ship} (${thd(d)}) มีแถวเหมือนกันทุกช่องเข้ามาซ้ำ ${c.flow + c.dup} แถว (นับครั้งเดียวแล้ว) · ถ้า Excel ไม่มีแถวซ้ำ = Flow ส่งซ้ำ ตรวจ List rows` });
    const e = E[d + "#S" + c.ship] || {};
    if (key && d < Y1 && !(e.start_time && e.finish_time)) out.push({ lv: 1, tag: "ยังไม่กรอกเวลา", msg: `สายส่ง ${c.ship} (${thd(d)}) ยังไม่มีเวลาเริ่ม/เสร็จบนเว็บ` });
  }
}
const rng = v => v.length ? [Math.min(...v), Math.max(...v)] : null;
const med = v => { v = v.slice().sort((a, b) => a - b); return v.length ? (v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2) : null; };
for (let i = 0; i < DD.length; i++) {
  const ns = listOf(DD[i]).map(c => shipN(c.ship)).filter(x => x != null);
  for (const s of ns) {
    const others = ns.filter(x => x !== s), own = rng(others); if (!own || (s >= own[0] && s <= own[1])) continue;
    for (const j of [i - 1, i + 1]) { if (!DD[j]) continue; const nb = listOf(DD[j]).map(c => shipN(c.ship)).filter(x => x != null), r2 = rng(nb);
      // ข้าม ถ้าหน้างานกรอกเวลาไว้ในวันของตัวเอง และไม่มีเวลาในวันข้างเคียง (ถือว่ายืนยันวันที่แล้ว)
      const tOwn = !!(E[DD[i] + "#S" + s] || {}).start_time, tNb = !!(E[DD[j] + "#S" + s] || {}).start_time;
      if (r2 && s >= r2[0] && s <= r2[1] && Math.abs(s - med(nb)) < Math.abs(s - med(others)) && !(tOwn && !tNb)) { out.push({ lv: 2, tag: "วันที่อาจผิด", msg: `สายส่ง ${s} ลงวันที่ ${thd(DD[i])} แต่เลขอยู่ในช่วงของวันที่ ${thd(DD[j])} · ตรวจวันที่โหลดใน Excel` }); break; } }
  }
}
out.sort((a, b) => b.lv - a.lv);

// ---- รายงาน
const perDay = DD.map(d => `| ${thd(d)} | ${listOf(d).length} | ${(E[d + "#PLAN"] || {}).start_time || "-"} |`).join("\n");
const md = `## ตรวจข้อมูล Robot · ${thd(T0)} ${+T0.slice(0, 4) + 543}\n\n` +
  (out.length ? out.map(o => `- ${o.lv > 1 ? "🔴" : "🟡"} **${o.tag}** ${o.msg}`).join("\n") : "✅ ข้อมูลปกติ ไม่พบปัญหา") +
  `\n\n| วันที่ | ตู้ใน robot.csv | แผน (ตู้) |\n|---|---|---|\n${perDay}\n`;
console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
if (out.some(o => o.lv > 1)) { console.error("⚠ พบปัญหาที่ต้องแก้ — ดูรายละเอียดใน Job summary"); process.exit(1); }
