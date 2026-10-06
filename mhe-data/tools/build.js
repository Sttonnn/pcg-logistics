/* สร้าง mhe-dashboard.html จากไฟล์ Excel
   ใช้: node mhe-data/tools/build.js <ไฟล์รถ.xlsx> "<วันที่ข้อมูล เช่น 5 ต.ค. 2569>" [ไฟล์ตารางราคาประมูล.xlsx]
   ต้องมี xlsx-js-style (npm i xlsx-js-style) หรือกำหนด XLSX_PATH */
const fs = require("fs"), path = require("path");
const XLSX = require(process.env.XLSX_PATH || "xlsx-js-style");
const SITES = require("../../shared/pcg-sites.js"); global.pcgSite = SITES.pcgSite;
const mheParse = require("./mhe_parse.js"), bidParse = require("./bid_parse.js");
const [file, asof = "", bidFile] = process.argv.slice(2);
const wb = XLSX.read(fs.readFileSync(file), { type: "buffer" });
const rows = mheParse(XLSX, wb);
const dir = __dirname;
let t = fs.readFileSync(path.join(dir, "mhe_template.html"), "utf8");
const parse = fs.readFileSync(path.join(dir, "mhe_parse.js"), "utf8"), bparse = fs.readFileSync(path.join(dir, "bid_parse.js"), "utf8");
const bid = bidFile ? bidParse(XLSX, XLSX.read(fs.readFileSync(bidFile), { type: "buffer" })) : null;
const bm = bidFile && path.basename(bidFile).match(/(20\d\d)[-_.](\d{1,2})[-_.](\d{1,2})/);   /* ปีของรอบประมูล = ปีในชื่อไฟล์ราคา */
if (bid) { bid.year = bm ? +bm[1] : new Date().getFullYear(); bid.date = bm ? `${bm[1]}-${bm[2].padStart(2, "0")}-${bm[3].padStart(2, "0")}` : ""; }
const prop = fs.existsSync(path.join(dir, "proposal_base.json")) ? JSON.parse(fs.readFileSync(path.join(dir, "proposal_base.json"), "utf8")) : null;
const spec = fs.existsSync(path.join(dir, "spec_rev4.json")) ? JSON.parse(fs.readFileSync(path.join(dir, "spec_rev4.json"), "utf8")) : null;
const sites = fs.readFileSync(path.join(dir, "..", "..", "shared", "pcg-sites.js"), "utf8");
const auth = fs.readFileSync(path.join(dir, "..", "..", "shared", "pcg-auth.js"), "utf8");
t = t.replace("/*__AUTH__*/", () => auth.replace(/<\//g, "<\\/"));
t = t.replace("/*__MHE_PARSE__*/", () => sites + "\n" + parse).replace("/*__BID_PARSE__*/", () => bparse)
     .replace("/*__BID_DATA__*/null", () => JSON.stringify(bid).replace(/</g, "\\u003c"))
     .replace("/*__PROP_DATA__*/null", () => JSON.stringify(prop).replace(/</g, "\\u003c"))
     .replace("/*__SPEC_DATA__*/null", () => JSON.stringify(spec).replace(/</g, "\\u003c"))
     .replace("/*__MHE_DATA__*/[]", () => JSON.stringify(rows).replace(/</g, "\\u003c"))
     .replace('"/*__ASOF__*/"', () => JSON.stringify(asof));
fs.writeFileSync(path.join(dir, "..", "mhe-dashboard.html"), t);
/* สรุปสั้นให้ Portal อ่าน (จำนวนรถ + วันหมดสัญญา) */
fs.writeFileSync(path.join(dir, "..", "summary.json"), JSON.stringify({ asof, n: rows.length, ends: rows.map(r => r.end || "") }));
console.log("rows", rows.length, "bid", bid ? bid.sheets.map(s => s.name + ":" + s.rows.length).join(",") : "-");
