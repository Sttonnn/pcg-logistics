/* สร้าง cm-dashboard.html จากไฟล์แจ้งซ่อม
   XLSX_PATH=<xlsx> node corrective-maintenance/tools/build.js <TrackingWorkOrder….xlsx>
   ต้องมี xlsx (npm i xlsx-js-style) หรือกำหนด XLSX_PATH · ไม่เก็บชื่อพนักงาน · ไม่ commit ไฟล์ดิบ */
const fs = require("fs"), path = require("path");
const XLSX = require(process.env.XLSX_PATH || "xlsx-js-style");
const P = require("./cm_parse.js");
const src = process.argv[2]; if (!src) { console.error("ใส่ไฟล์ Excel"); process.exit(1); }
const wb = XLSX.readFile(src), sh = wb.Sheets.Report || wb.Sheets[wb.SheetNames[0]];
const rows = P.parse(XLSX.utils.sheet_to_json(sh, { header: 1, raw: true }));
const asof = P.asofOf(path.basename(src)) || new Date().toISOString().slice(0, 16);
const dir = __dirname, out = path.join(dir, "..", "cm-dashboard.html");
let t = fs.readFileSync(path.join(dir, "cm_template.html"), "utf8");
const js = s => JSON.stringify(s).replace(/</g, "\\u003c");
t = t.replace("/*__CM_PARSE__*/", () => fs.readFileSync(path.join(dir, "cm_parse.js"), "utf8"))
  .replace("/*__CM_DATA__*/[]", () => js(rows)).replace('"/*__ASOF__*/"', () => js(asof))
  .replace("TrackingWorkOrderCompleted_14_10_2026_16_28.xlsx", () => path.basename(src).replace(/^[0-9a-f]{8}-/, ""));
fs.writeFileSync(out, t);
const st = { total: rows.length }; rows.forEach(r => st[r.g] = (st[r.g] || 0) + 1);
const open = (st.wait || 0) + (st.prog || 0), valid = rows.length - (st.cancel || 0);
fs.writeFileSync(path.join(dir, "..", "summary.json"), JSON.stringify({ asof, total: rows.length, open, perf: valid ? Math.round(((st.done || 0) + (st.review || 0)) / valid * 1000) / 10 : null }, null, 1));
console.log("เขียน", out, rows.length, "ใบงาน", st);
