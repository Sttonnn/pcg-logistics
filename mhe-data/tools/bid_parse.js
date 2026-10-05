/* PCG Overall MHE Data · อ่านไฟล์ "ตารางราคาประมูล" (เช่น …update_2026-9-22.xlsx) (5 ต.ค. 2569)
   ใช้ทั้งตอน build และปุ่ม "อัปโหลดตารางราคา" บนเว็บ
   ชีตราคา (เช่น Lithium / Laed-Acid2): แถวหัว = คอลัมน์ A "MHE" · แถวบนหัว = ชื่อรอบ (A) + ผู้ติดต่อของผู้ขายแต่ละราย
   แถวหัว: A รุ่น/สเปก · B Type Battery · C จำนวน · D.. คู่ (คลัง, จำนวน) · ตั้งแต่คอลัมน์ผู้ขายรายแรก = คู่ (3 ปี, 5 ปี) ต่อผู้ขาย
   ชีต "Confirm หน่วยงาน": รายชื่อหน่วยงาน + จำนวน + สถานะ */
function bidParse(XLSX, wb) {
  const norm = s => String(s == null ? "" : s).replace(/\s+/g, " ").trim();
  const val = v => { if (v == null || v === "") return null; if (typeof v === "number") return v; const s = norm(v); const n = parseFloat(s.replace(/,/g, "")); return /^[\d,.]+$/.test(s) && isFinite(n) ? n : s; };
  const out = { title: "", sheets: [], confirm: [] };
  const meta = (wb.Workbook && wb.Workbook.Sheets) || [];
  wb.SheetNames.forEach((name, si) => {
    if (meta[si] && meta[si].Hidden) return;
    const R = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: null });
    const hr = R.findIndex((r, i) => i < 15 && r && norm(r[0]).toUpperCase() === "MHE");
    if (hr >= 0) {
      const H = R[hr], top = R[hr - 1] || [], vcol = [];
      for (let j = 3; j < H.length; j++) if (norm(H[j])) vcol.push(j);
      if (!vcol.length) return;
      const nAlloc = Math.floor((vcol[0] - 3) / 2);
      if (!out.title) out.title = norm(top[0]);
      const sh = { name: name.replace(/Laed/i, "Lead").replace(/\d+$/, "").trim(), vendors: vcol.map(j => ({ name: norm(H[j]), contact: norm(top[j]) })), rows: [] };
      for (let i = hr + 2; i < R.length; i++) {
        const r = R[i] || [], item = norm(r[0]);
        if (!item) { if (sh.rows.length) break; continue; }
        const alloc = [];
        for (let k = 0; k < nAlloc; k++) { const s = norm(r[3 + 2 * k]), q = val(r[4 + 2 * k]); if (s) alloc.push([s, typeof q === "number" ? q : null]); }
        sh.rows.push({ item, energy: norm(r[1]), qty: typeof val(r[2]) === "number" && val(r[2]) > 0 ? val(r[2]) : null, alloc, p: vcol.map(j => [val(r[j]), val(r[j + 1])]) });
      }
      out.sheets.push(sh);
      return;
    }
    const ch = R.findIndex((r, i) => i < 10 && r && r.some(c => norm(c) === "หน่วยงาน"));
    if (ch >= 0 && /confirm/i.test(name)) {
      const ju = R[ch].findIndex(c => norm(c) === "หน่วยงาน"), jq = R[ch].findIndex(c => norm(c) === "จำนวน"), js = R[ch].findIndex(c => norm(c) === "สถานะ");
      for (let i = ch + 1; i < R.length; i++) { const r = R[i] || [], u = norm(r[ju]); if (u) out.confirm.push({ unit: u, qty: jq >= 0 ? val(r[jq]) : null, status: js >= 0 ? norm(r[js]) : "" }); }
    }
  });
  return out;
}
if (typeof module !== "undefined") module.exports = bidParse;
