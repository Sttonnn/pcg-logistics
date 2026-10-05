# อ่านไฟล์ตารางปฏิบัติงาน (ชีต "ตารางปฏิบัติงาน YYYY") -> JSON สำหรับ shift-schedule.html
# ใช้: python3 shift_extract.py <xlsx> > data.json
import sys, json, re, openpyxl
TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"]
wb = openpyxl.load_workbook(sys.argv[1], data_only=True)
out = {}
for ws in wb.worksheets:
    m = re.search(r"(20\d\d)", ws.title)
    if not m: continue
    year = int(m.group(1)); months = []; cur = None
    for r in range(1, ws.max_row + 1):
        h = ws.cell(r, 8).value
        if isinstance(h, str) and h.strip() in TH and ws.cell(r, 9).value == 1:
            days = max(c - 8 for c in range(9, 41) if isinstance(ws.cell(r, c).value, (int, float)))
            cur = {"m": TH.index(h.strip()) + 1, "days": days, "rows": []}; months.append(cur); continue
        code = ws.cell(r, 2).value
        if cur and code and str(code).strip().isdigit():
            cells = []
            for d in range(1, cur["days"] + 1):
                v = ws.cell(r, 8 + d).value
                cells.append("" if v is None else (str(int(v)) if isinstance(v, (int, float)) else str(v).strip()))
            cur["rows"].append({"id": str(code).strip(), "n": re.sub(r"\s+", " ", str(ws.cell(r, 3).value or "")).strip(),
                "dept": str(ws.cell(r, 6).value or "").strip(), "pos": str(ws.cell(r, 7).value or "").strip(), "c": cells})
    out[year] = months
# แสดงเฉพาะตั้งแต่ มี.ค. 2569 (2026-03) เป็นต้นไป (ผู้ใช้สั่ง 5 ต.ค.)
START = (2026, 3)
out = {y: [m for m in ms if (y, m["m"]) >= START] for y, ms in out.items()}
out = {y: ms for y, ms in out.items() if ms}
print(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
