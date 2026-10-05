/* สร้าง mhe-dashboard.html จากไฟล์ Excel
   ใช้: node mhe-data/tools/build.js <ไฟล์.xlsx> [วันที่ข้อมูล เช่น "5 ต.ค. 2569"]
   ต้องมี xlsx-js-style (npm i xlsx-js-style) หรือกำหนด XLSX_PATH */
const fs = require("fs"), path = require("path");
const XLSX = require(process.env.XLSX_PATH || "xlsx-js-style");
const mheParse = require("./mhe_parse.js");
const [file, asof = ""] = process.argv.slice(2);
const wb = XLSX.read(fs.readFileSync(file), { type: "buffer" });
const rows = mheParse(XLSX, wb);
const dir = __dirname;
let t = fs.readFileSync(path.join(dir, "mhe_template.html"), "utf8");
const parse = fs.readFileSync(path.join(dir, "mhe_parse.js"), "utf8");
t = t.replace("/*__MHE_PARSE__*/", () => parse)
     .replace("/*__MHE_DATA__*/[]", () => JSON.stringify(rows).replace(/</g, "\\u003c"))
     .replace('"/*__ASOF__*/"', () => JSON.stringify(asof));
fs.writeFileSync(path.join(dir, "..", "mhe-dashboard.html"), t);
console.log("rows", rows.length);
