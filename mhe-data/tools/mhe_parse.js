/* PCG Overall MHE Data · อ่านไฟล์ Excel "ข้อมูล MHE" (5 ต.ค. 2569)
   ใช้ทั้งตอน build (node tools/build.js) และตอนอัปโหลดบนเว็บ → ผลลัพธ์ตรงกัน
   อ่านเฉพาะชีตที่ "ไม่ซ่อน" และมีหัวคอลัมน์ หน่วยงาน + วันที่หมดสัญญา (ตอนนี้ = BI Logistics, BI หน่วยงาน)
   1 แถว = รถ 1 คัน · key (id) = Serial No. รถ (ซ้ำ → ต่อท้าย #2) · ไม่มี Serial → หน่วยงาน|UL|คลัง|รุ่น|วันที่สัญญา|ลำดับ */
function mheParse(XLSX, wb) {
  const COL = {
    "supplier": "sup", "ul": "ul", "หน่วยงาน": "unit", "คลัง": "site", "ประเภทรถ": "typeRaw", "ประเภท": "typeRaw",
    "type battery": "energy", "รุ่นรถ": "model", "ขนาด": "size", "น้ำหนัก(kg)": "cap", "lifting capacity (kgs.)": "cap",
    "ความสูง (mm.)": "h", "lifting height (mm.)": "h", "serial no.": "serial", "serial no. รถ": "serial", "เบอร์รถ": "no",
    "รุ่นแบต": "bat", "serial no. battery": "batSn", "serial no. spare battery": "spareSn", "serial charger": "chg",
    "อายุสัญญา(ปี)": "yrs", "วันที่สัญญา": "start", "วันที่หมดสัญญา": "end", "ราคาค่าเช่า/เดือน": "price",
    "ค่ารถ+แบต": "carBat", "ค่า spare แบต": "spare", "ทดแทน/เช่าเพิ่ม": "repl", "memo": "memo", "หมายเหตุ": "note",
    "หมายเหตุจากมิ้ง": "note2"
  };
  const NUM = ["cap", "h", "yrs", "price", "carBat", "spare"], DATE = ["start", "end"];
  const norm = s => String(s == null ? "" : s).replace(/\s+/g, " ").trim();
  const iso = v => {
    if (v == null || v === "") return "";
    let y, m, d;
    if (typeof v === "number") { const t = new Date(Math.round((v - 25569) * 864e5)); y = t.getUTCFullYear(); m = t.getUTCMonth() + 1; d = t.getUTCDate(); }
    else if (v instanceof Date) { y = v.getFullYear(); m = v.getMonth() + 1; d = v.getDate(); }
    else { const r = String(v).match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/); if (!r) return ""; d = +r[1]; m = +r[2]; y = +r[3]; if (y < 100) y += 2000; }
    if (y > 2400) y -= 543;                              /* ปี พ.ศ. ในไฟล์ (เช่น 2572) → ค.ศ. */
    return y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  };
  const num = v => { if (v == null || v === "" || v === "-") return null; const n = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, "")); return isFinite(n) ? n : null; };
  const typeOf = raw => {
    const s = norm(raw).toLowerCase();
    if (/reach/.test(s)) return "Reach Truck";
    if (/or?d?er pick|oder pick/.test(s)) return "Order Pick";
    if (/stacker/.test(s)) return "Stacker";
    if (/power pallet/.test(s)) return "Power Pallet";
    if (/gas|folklift|forklift/.test(s)) return "Forklift Gas";
    if (/counter|^ct\b/.test(s)) return "Counter Balance";
    return norm(raw) || "ไม่ระบุ";
  };
  const energyOf = (v, type) => {
    const s = norm(v).toLowerCase();
    if (/lith/.test(s)) return "Lithium";
    if (/lead|acid/.test(s)) return "Lead-Acid";
    if (/gas/.test(s)) return "Gas";
    return type === "Forklift Gas" ? "Gas" : "";
  };
  const supOf = v => { const s = norm(v).replace(/Matreial/i, "Material"); return /^toyota$/i.test(s) ? "Toyota" : s; };
  const out = [], seen = {};
  const meta = (wb.Workbook && wb.Workbook.Sheets) || [];
  wb.SheetNames.forEach((name, si) => {
    if (meta[si] && meta[si].Hidden) return;
    const ws = wb.Sheets[name];
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });
    const txt = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null });
    let hr = -1;
    for (let i = 0; i < Math.min(raw.length, 15); i++) { const r = (raw[i] || []).map(c => norm(c).toLowerCase()); if (r.includes("หน่วยงาน") && r.includes("วันที่หมดสัญญา")) { hr = i; break; } }
    if (hr < 0) return;
    const map = {};
    raw[hr].forEach((c, j) => { const k = COL[norm(c).toLowerCase()]; if (k && !(k in map)) map[k] = j; });
    for (let i = hr + 1; i < raw.length; i++) {
      const R = raw[i] || [], T = txt[i] || [];
      const g = k => (k in map ? R[map[k]] : null), gt = k => (k in map ? norm(T[map[k]]) : "");
      if (!gt("unit") && !gt("typeRaw") && !gt("model")) continue;
      const rec = { sheet: name };
      ["unit", "site", "typeRaw", "model", "size", "serial", "no", "bat", "batSn", "spareSn", "chg", "repl", "memo", "note", "note2"].forEach(k => { let v = gt(k); if (v === "-" || v === "0" && k !== "no") v = ""; rec[k] = v; });
      rec.ul = gt("ul"); rec.sup = supOf(g("sup"));
      NUM.forEach(k => rec[k] = num(g(k)));
      DATE.forEach(k => rec[k] = iso(g(k)));
      rec.type = typeOf(rec.typeRaw);
      rec.energy = energyOf(g("energy"), rec.type);
      if (rec.cap != null && rec.cap > 0 && rec.cap < 20) rec.cap = Math.round(rec.cap * 1000);   /* ตัน → กก. (ชีต Rayong) */
      if (!rec.yrs && rec.start && rec.end) rec.yrs = Math.round((new Date(rec.end) - new Date(rec.start)) / 31557600000);
      let id = rec.serial ? "SN:" + rec.serial.toUpperCase() : ["X", rec.unit, rec.ul, rec.site, rec.model, rec.start].join("|");
      seen[id] = (seen[id] || 0) + 1; if (seen[id] > 1) id += "#" + seen[id];
      rec.id = id;
      out.push(rec);
    }
  });
  return out;
}
if (typeof module !== "undefined") module.exports = mheParse;
