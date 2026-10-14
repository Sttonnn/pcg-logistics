/* ตัวอ่านไฟล์แจ้งซ่อม (TrackingWorkOrder*.xlsx ชีต Report) → รายการใบงาน
   ใช้ทั้งตอน build (node) และตอนอัปโหลดบนเว็บ · ไม่เก็บชื่อพนักงาน (ผู้แจ้ง/ช่าง/ผู้อนุมัติ) */
(function (root) {
  const COLS = {
    req: "เลขที่คำขอ", wo: "เลขที่ใบงาน", sub: "ประเภทงานย่อย", locCode: "รหัสสถานที่ตั้ง", loc: "ชื่อสถานที่ตั้ง(ท้องถิ่น)",
    eqCode: "รหัสอุปกรณ์", eq: "ชื่ออุปกรณ์(ท้องถิ่น)", sla: "SLA", over: "เกิน SLA", plant: "รหัสโรงงาน", unit: "ชื่อหน่วยงาน(ท้องถิ่น)",
    pri: "ระดับความเร่งด่วน", priName: "ชื่อความเร่งด่วน(ท้องถิ่น)", symGrp: "กลุ่มอาการเสีย", sym: "ชื่ออาการเสีย(ท้องถิ่น)", desc: "คำอธิบาย",
    created: "วันที่/เวลาสร้างคำขอ", approved: "วันที่อนุมัติ", assigned: "วันที่มอบหมาย", started: "วันที่เริ่มงาน", closed: "วันที่ปิดงาน",
    team: "ชื่อหน่วยที่รับผิดชอบ(ท้องถิ่น)", eqType: "ชื่อประเภทอุปกรณ์(ท้องถิ่น)", cat: "ชื่อหมวดหมู่(ท้องถิ่น)", eqState: "สถานะอุปกรณ์",
    repairs: "ประวัติการซ่อม(ครั้ง)", dept: "แผนกผู้สร้างคำขอ/ผู้แจ้ง", age: "อายุใบงาน", reqType: "ประเภทคำขอ", due: "วันที่คาดว่าจะเสร็จ",
    finished: "วันที่เสร็จงาน", stKey: "คีย์สถานะใบงาน", st: "สถานะงาน(ท้องถิ่น)", score: "คะแนนการประเมิน",
    cause: "สาเหตุอาการ", causeDesc: "คำอธิบายสาเหตุของอาการ", fix: "วิธีแก้ไข", fixDesc: "คำอธิบายวิธีแก้ไขปัญหา"
  };
  const s = v => v == null ? "" : String(v).replace(/\s+/g, " ").trim();
  /* วันที่ในไฟล์: "dd/mm/yyyy hh:mm" หรือ "dd/mm/yyyy" หรือ Date / เลข Excel → "yyyy-mm-ddThh:mm" */
  function dt(v) {
    if (v == null || v === "" || v === "-") return "";
    if (v instanceof Date && !isNaN(v)) return new Date(v.getTime() - v.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
    if (typeof v === "number") { const d = new Date(Math.round((v - 25569) * 864e5)); return d.toISOString().slice(0, 16); }
    const m = String(v).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/); if (!m) return "";
    let y = +m[3]; if (y > 2400) y -= 543;
    const p = n => String(n).padStart(2, "0");
    return `${y}-${p(m[2])}-${p(m[1])}T${p(m[4] || 0)}:${p(m[5] || 0)}`;
  }
  /* กลุ่มสถานะ: done เสร็จสิ้น · review รอตรวจรับ · prog กำลังดำเนินการ · wait รออนุมัติ · cancel ยกเลิก/ไม่อนุมัติ */
  function grp(key, name) {
    const k = (key + " " + name).toUpperCase();
    if (/CANCEL|REJECT|ยกเลิก|ไม่อนุมัติ|ปฏิเสธ/.test(k)) return "cancel";
    if (/CLOSE|COMPLETE|เสร็จ|ปิดงาน/.test(k)) return "done";
    if (/REVIEW|ตรวจรับ|ประเมิน/.test(k)) return "review";
    if (/WAIT|APPROV|PENDING|NEW|REQUEST|DRAFT|รออนุมัติ|อนุมัติ|ร่าง/.test(k)) return "wait";
    return "prog";
  }
  /* อาคาร/สาขา: WHA05-32-001 → WH32 · อื่นๆ ใช้ส่วนที่ 2 ของรหัสสถานที่ หรือชื่อหน่วยงาน */
  function site(plant, locCode, unit) {
    const p = String(locCode || "").split("-");
    if (/^WHA/i.test(plant) && /^\d+$/.test(p[1] || "")) return "WH" + p[1].padStart(2, "0");
    return p[1] || unit || plant || "ไม่ระบุ";
  }
  function parse(aoa) {
    let hi = aoa.findIndex(r => r && r.some(c => s(c) === COLS.wo) && r.some(c => s(c) === COLS.st));
    if (hi < 0) throw new Error("ไม่พบหัวตาราง เลขที่ใบงาน / สถานะงาน (ต้องเป็นไฟล์ TrackingWorkOrder ชีต Report)");
    const H = aoa[hi].map(s), ix = {}; Object.entries(COLS).forEach(([k, h]) => ix[k] = H.indexOf(h));
    const out = [], seen = new Set();
    for (const r of aoa.slice(hi + 1)) {
      if (!r) continue; const g = k => ix[k] < 0 ? "" : r[ix[k]];
      const wo = s(g("wo")) || s(g("req")); if (!wo) continue;
      const plant = s(g("plant")) || "ไม่ระบุ", id = plant + "|" + wo; if (seen.has(id)) continue; seen.add(id);
      const sym = [...new Set(s(g("symGrp")).split(",").map(x => x.trim()).filter(Boolean))];
      const n = v => { const x = parseFloat(v); return isFinite(x) ? x : null; };
      out.push({
        id, wo, req: s(g("req")), plant, unit: s(g("unit")), site: site(plant, s(g("locCode")), s(g("unit"))),
        locCode: s(g("locCode")), loc: s(g("loc")).replace(/^Zone\s*/i, ""), eqCode: s(g("eqCode")), eq: s(g("eq")),
        eqType: s(g("eqType")), cat: s(g("cat")), sub: s(g("sub")), team: s(g("team")), dept: s(g("dept")), type: s(g("reqType")) || "CM",
        pri: s(g("pri")), priName: s(g("priName")), sla: s(g("sla")), over: /^y/i.test(s(g("over"))),
        sym, symName: [...new Set(s(g("sym")).split(",").map(x => x.trim()).filter(Boolean))].join(", "), desc: s(g("desc")),
        created: dt(g("created")), approved: dt(g("approved")), assigned: dt(g("assigned")), started: dt(g("started")),
        closed: dt(g("closed")) || dt(g("finished")), due: dt(g("due")),
        stKey: s(g("stKey")), st: s(g("st")), g: grp(s(g("stKey")), s(g("st"))),
        repairs: n(g("repairs")), age: n(g("age")), score: n(g("score")),
        cause: [s(g("cause")), s(g("causeDesc"))].filter(x => x && x !== "อื่น ๆ" && x !== "-").join(" · "),
        fix: [s(g("fix")), s(g("fixDesc"))].filter(x => x && x !== "อื่นๆ" && x !== "-").join(" · ")
      });
    }
    return out;
  }
  /* วันที่ข้อมูลจากชื่อไฟล์ TrackingWorkOrder…_DD_MM_YYYY_HH_MM */
  function asofOf(name) { const m = String(name || "").match(/(\d{2})_(\d{2})_(\d{4})_(\d{2})_(\d{2})/); return m ? `${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}` : ""; }
  const api = { parse, asofOf, grp };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.cmParse = api;
})(typeof window !== "undefined" ? window : globalThis);
