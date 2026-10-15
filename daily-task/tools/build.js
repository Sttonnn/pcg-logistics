/* สร้าง task-dashboard.html จากไฟล์งานทีม Project
   XLSX_PATH=<xlsx> node daily-task/tools/build.js <Project_Team_Y2026.xlsx>  (ต้องมี xlsx หรือกำหนด XLSX_PATH · ไม่ commit ไฟล์ดิบ) */
const fs = require("fs"), path = require("path");
const XLSX = require(process.env.XLSX_PATH || "xlsx-js-style");
const P = require("./task_parse.js");
const src = process.argv[2]; if (!src) { console.error("ใส่ไฟล์ Excel"); process.exit(1); }
const wb = XLSX.readFile(src, { cellDates: true }), sh = wb.Sheets[wb.SheetNames[0]];
const rows = P.parse(XLSX.utils.sheet_to_json(sh, { header: 1, raw: true }));
const asof = new Date().toISOString().slice(0, 16);
const dir = __dirname, out = path.join(dir, "..", "task-dashboard.html");
const js = s => JSON.stringify(s).replace(/</g, "\\u003c");
let t = fs.readFileSync(path.join(dir, "task_template.html"), "utf8");
t = t.replace("/*__TASK_PARSE__*/", () => fs.readFileSync(path.join(dir, "task_parse.js"), "utf8"))
  .replace("/*__TASK_DATA__*/[]", () => js(rows)).replace('"/*__ASOF__*/"', () => js(asof));
fs.writeFileSync(out, t);
const top = rows.filter(r => !r.parent), today = new Date(Date.now() + 7 * 36e5).toISOString().slice(0, 10);
const st = r => r.cancel ? "cancel" : (r.prog || 0) >= 100 ? "done" : !r.target ? "wait" : today > r.target ? "delay" : "prog";
const c = {}; top.forEach(r => c[st(r)] = (c[st(r)] || 0) + 1);
fs.writeFileSync(path.join(dir, "..", "summary.json"), JSON.stringify({ asof, total: top.length - (c.cancel || 0), done: c.done || 0, delay: c.delay || 0 }, null, 1));
console.log("เขียน", out, rows.length, "แถว", c);
