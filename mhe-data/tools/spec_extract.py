"""อ่าน PDF "Specification MHE PCG" (ตาราง Old Model / New Model ต่อประเภทรถ) → JSON
ใช้: python3 mhe-data/tools/spec_extract.py <ไฟล์.pdf> <Rev เช่น Rev.4> <วันที่ เช่น 2025-05-27> > spec.json
ต้องมี pypdf (pip install pypdf)"""
import sys, re, json
from pypdf import PdfReader

def fix(s):
    s = re.sub(r' ([ัิ-ฺ็-๎])', r'\1', s)      # สระ/วรรณยุกต์ที่มีช่องว่างแทรก
    s = re.sub(r'([ก-ฮ]) า', r'\1ำ', s)                                  # "ส ารอง" → "สำรอง"
    return re.sub(r'\s+', ' ', s).strip()

def main(path, rev, date):
    classes = {}
    order = []
    for pg in PdfReader(path).pages:
        lines = [l for l in pg.extract_text(extraction_mode="layout").split("\n") if l.strip()]
        name, rows, started = None, [], False
        for l in lines:
            parts = [p for p in re.split(r'\s{3,}', l.strip()) if p]
            if not started:
                if parts and fix(parts[0]) == "รายละเอียด":
                    started = True
                    cols = [fix(p) for p in parts[1:]]
                elif len(parts) == 1 and name is None:
                    name = fix(parts[0])
                continue
            if len(parts) >= 3:
                rows.append([fix(parts[0])] + [fix(p) for p in parts[1:3]])
            elif len(parts) == 2 and rows and not re.search(r'[A-Za-zก-ฮ]{3}', parts[0]) is None and l.startswith(" " * 20):
                rows[-1][1] += " " + fix(parts[0]); rows[-1][2] += " " + fix(parts[1])
            elif len(parts) == 2:
                rows.append([fix(parts[0]), fix(parts[1]), ""])
            elif len(parts) == 1 and rows and l.startswith(" " * 20):
                rows[-1][-1] = (rows[-1][-1] + " " + fix(parts[0])).strip()
            elif len(parts) == 1 and not name:
                name = fix(parts[0])
        if not name:
            name = order[-1] if order else "ไม่ระบุ"
        if name not in classes:
            classes[name] = {"name": name, "cols": cols, "rows": []}; order.append(name)
        classes[name]["rows"] += rows
    return {"rev": rev, "date": date, "classes": [classes[n] for n in order]}

if __name__ == "__main__":
    print(json.dumps(main(*sys.argv[1:4]), ensure_ascii=False, indent=1))
