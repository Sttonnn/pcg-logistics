/* ตัวอ่านไฟล์ Excel งานทีม Project (Project_Team_Y20xx.xlsx) — ใช้ทั้งตอน build และอัปโหลดบนเว็บ
   หัวตาราง: NO. · ชื่องาน (Project …) · ผู้รับผิดชอบ · Start date · Target · Progress · Notes (+ ความสำคัญ / หมวด ถ้ามี)
   แถวที่ไม่มี NO. ต่อจากงานหลัก = งานย่อยของงานนั้น · Progress "-" = ยกเลิก · 0–1 = สัดส่วน */
(function (root, f) { if (typeof module === "object" && module.exports) module.exports = f(); else root.TaskParse = f(); })(this, function () {
  const S = v => v == null ? "" : String(v).replace(/\s+/g, " ").trim();
  const pad = n => String(n).padStart(2, "0");
  function dt(v) {
    if (v == null || v === "") return "";
    if (v instanceof Date && !isNaN(v)) return v.getFullYear() + "-" + pad(v.getMonth() + 1) + "-" + pad(v.getDate());
    if (typeof v === "number" && v > 20000 && v < 80000) { const d = new Date(Math.round((v - 25569) * 864e5)); return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()); }
    const s = S(v); let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); if (m) return m[1] + "-" + pad(m[2]) + "-" + pad(m[3]);
    m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);
    if (m) { let y = +m[3]; if (y < 100) y += 2000; if (y > 2400) y -= 543; return y + "-" + pad(m[2]) + "-" + pad(m[1]); }
    return "";
  }
  function prog(v) {
    if (v == null || v === "") return { p: null };
    if (typeof v === "string") { const s = v.trim(); if (s === "-" || /cancel|ยกเลิก/i.test(s)) return { p: null, cancel: true }; if (s.startsWith("=")) return { p: null };
      const n = parseFloat(s.replace("%", "")); if (isNaN(n)) return { p: null }; v = /%/.test(s) ? n / 100 : n; }
    if (typeof v !== "number" || isNaN(v)) return { p: null };
    const p = v <= 1 ? v * 100 : v; return { p: Math.max(0, Math.min(100, Math.round(p))) };
  }
  const PRI = s => /สูง|high|ด่วน|urgent|^h$|^1$/i.test(s) ? "H" : /ต่ำ|low|^l$|^3$/i.test(s) ? "L" : /กลาง|med|normal|^m$|^2$/i.test(s) ? "M" : "";
  function parse(aoa) {
    let h = -1; for (let i = 0; i < Math.min(aoa.length, 40); i++) if ((aoa[i] || []).some(c => /ผู้รับผิดชอบ|owner|responsible/i.test(S(c)))) { h = i; break; }
    if (h < 0) throw new Error("ไม่พบหัวตาราง (คอลัมน์ ผู้รับผิดชอบ)");
    const H = aoa[h].map(S), col = re => H.findIndex(x => re.test(x));
    const C = { no: col(/^no\.?$|^ลำดับ/i), own: col(/ผู้รับผิดชอบ|owner|responsible/i), start: col(/start|เริ่ม/i), target: col(/target|due|กำหนดเสร็จ|วันเสร็จ/i),
      prog: H.findIndex(x => /^progress$|^%|ความคืบหน้า/i.test(x)), note: col(/note|หมายเหตุ/i), pri: col(/ความสำคัญ|priority/i), cat: col(/หมวด|category|ประเภท/i) };
    C.title = H.findIndex((x, i) => i !== C.no && i !== C.own && /project|งาน|task|รายการ/i.test(x) && !/status|progress/i.test(x));
    if (C.title < 0) C.title = C.no + 1;
    if (C.prog < 0) C.prog = col(/progress/i);
    const out = []; let parent = null, kids = 0;
    for (let i = h + 1; i < aoa.length; i++) {
      const r = aoa[i] || [], title = S(r[C.title]); if (!title) continue;
      const no = S(r[C.no]).replace(/\.0+$/, ""), pg = prog(r[C.prog]);
      const t = { title, owner: S(r[C.own]), start: dt(r[C.start]), target: dt(r[C.target]), prog: pg.p, cancel: !!pg.cancel, note: C.note >= 0 ? S(r[C.note]) : "" };
      if (C.pri >= 0) { const p = PRI(S(r[C.pri])); if (p) t.pri = p; }
      if (C.cat >= 0 && S(r[C.cat])) t.cat = S(r[C.cat]);
      if (no) { t.id = "T" + no; t.no = +no || no; parent = t; kids = 0; }
      else if (parent) { t.id = parent.id + "-" + (++kids); t.no = parent.no + "." + kids; t.parent = parent.id; }
      else continue;
      out.push(t);
    }
    return out;
  }
  return { parse, dt };
});
