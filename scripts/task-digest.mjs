// สรุปงานประจำเช้า (daily_tasks · anon key อ่านอย่างเดียว) → GITHUB_STEP_SUMMARY + อีเมล (Gmail SMTP ผ่าน curl) ถ้ามี secrets
import { writeFileSync, appendFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const SBU = "https://mgnshovnibcmiptoxdfe.supabase.co/rest/v1/daily_tasks?select=rec&id=not.like.FILE:*", SBK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nbnNob3ZuaWJjbWlwdG94ZGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzNzI1NDIsImV4cCI6MjEwNDk0ODU0Mn0.UoPu-i6ODMEgyuqoO6oKHf0JIqFKpWkSpBkOKrpITwQ";
const URL = "https://sttonnn.github.io/pcg-logistics/daily-task/task-dashboard.html#mg";
const TODAY = new Date(Date.now() + 7 * 36e5).toISOString().slice(0, 10);
const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const fmt = d => { if (!d) return "–"; const [y, m, dd] = d.split("-"); return +dd + "/" + +m + "/" + String(+y + 543).slice(2); };
const BOARD = { ton: "ตั๋น", mink: "Mink" };
const r = await fetch(SBU, { headers: { apikey: SBK, Authorization: "Bearer " + SBK } });
if (!r.ok) { console.error("อ่าน daily_tasks ไม่ได้", r.status); process.exit(1); }
const A = (await r.json()).map(x => x.rec).filter(t => t && t.title && !t.del && !t.snap && !t.file);
const par = new Set(A.map(t => t.parent).filter(Boolean));
const L = A.filter(t => !par.has(t.id) && !t.cancel && (t.prog || 0) < 100);
const risk = t => { if (!t.start || !t.target || t.target <= t.start || TODAY < t.start || TODAY > t.target) return false; const e = days(t.start, TODAY) / days(t.start, t.target); return e >= 0.5 && (t.prog || 0) < e * 60; };
const lastUpd = t => [t.created, t.rv, ...(t.hist || []).map(h => h.at), ...(t.tchg || []).map(c => c.at)].filter(Boolean).sort().pop() || t.u || "";
const G = {
  "Delay ยังไม่ใส่เหตุผล": L.filter(t => t.target && TODAY > t.target && !t.why),
  "ติดปัญหา · ต้องการความช่วยเหลือ": L.filter(t => t.block),
  "Delay (มีเหตุผลแล้ว)": L.filter(t => t.target && TODAY > t.target && t.why),
  "เสี่ยงล่าช้า": L.filter(risk),
  "ครบกำหนดใน 7 วัน": L.filter(t => t.target && t.target >= TODAY && days(TODAY, t.target) <= 7),
  "ไม่อัปเดตเกิน 7 วัน": L.filter(t => !(t.start && TODAY < t.start) && lastUpd(t) && days(lastUpd(t).slice(0, 10), TODAY) > 7),
};
const line = t => `- ${t.title} · ${t.owner || "ไม่ระบุ"} (${BOARD[t.bd || "ton"] || t.bd}) · Target ${fmt(t.target)} · ${t.prog || 0}%${t.target && TODAY > t.target ? " · ช้า " + days(t.target, TODAY) + " วัน" : ""}${t.why ? " · เหตุผล: " + t.why : ""}${t.block ? " · ติด: " + t.block : ""}`;
let md = `# สรุปงานแผนกโครงการ · ${fmt(TODAY)}\n\nงานค้างทั้งหมด ${L.length} งาน\n\n`;
for (const [k, v] of Object.entries(G)) md += `## ${k} (${v.length})\n${v.length ? v.slice(0, 15).map(line).join("\n") + (v.length > 15 ? `\n- …อีก ${v.length - 15} งาน` : "") : "- ไม่มี ✓"}\n\n`;
md += `เปิดหน้าผู้จัดการ: ${URL}\n`;
console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
const { GMAIL_USER: U, GMAIL_APP_PASSWORD: P, DIGEST_TO: TO } = process.env;
if (!U || !P || !TO) { console.log("ยังไม่ได้ตั้ง secrets GMAIL_USER / GMAIL_APP_PASSWORD / DIGEST_TO → ไม่ส่งอีเมล"); process.exit(0); }
const n1 = G["Delay ยังไม่ใส่เหตุผล"].length, n2 = G["ติดปัญหา · ต้องการความช่วยเหลือ"].length;
const subj = `[งานโครงการ] ${fmt(TODAY)} · Delay ไม่มีเหตุผล ${n1} · ติดปัญหา ${n2} · ค้าง ${L.length}`;
const b64 = s => Buffer.from(s, "utf8").toString("base64");
const to = TO.split(",").map(s => s.trim()).filter(Boolean);
writeFileSync("mail.txt", [`From: ${U}`, `To: ${to.join(", ")}`, `Subject: =?UTF-8?B?${b64(subj)}?=`, "MIME-Version: 1.0", "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "", b64(md).replace(/.{76}/g, "$&\r\n")].join("\r\n"));
execFileSync("curl", ["-sS", "--ssl-reqd", "--url", "smtps://smtp.gmail.com:465", "--user", U + ":" + P, "--mail-from", U, ...to.flatMap(x => ["--mail-rcpt", x]), "--upload-file", "mail.txt"], { stdio: "inherit" });
console.log("ส่งอีเมลแล้ว →", to.length, "ผู้รับ");
