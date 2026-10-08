import openpyxl,json,re,collections as C,sys
F=sys.argv[1]
ws=openpyxl.load_workbook(F,read_only=True,data_only=True).worksheets[0]
rows=list(ws.iter_rows(values_only=True)); h=rows[0]; ix={c:i for i,c in enumerate(h)}
BR=['เชียงใหม่','เชียงราย','พิษณุโลก','ปากเกร็ด','หนองแขม','สายไหม','ลาดพร้าว','สุราษฎร์ธานี','หาดใหญ่','ราชบุรี','ศรีราชา','อุบลราชธานี','ขอนแก่น','โคราช']
ALIAS={'สุราษ':'สุราษฎร์ธานี','อุบล':'อุบลราชธานี'}
def d(v):
    v=str(v or '')
    m=re.match(r'(\d\d)/(\d\d)/(\d{4})',v); return f'{m[3]}-{m[2]}-{m[1]}' if m else ''
out=[]
for r in rows[1:]:
    g=lambda c:(str(r[ix[c]]).strip() if r[ix[c]] is not None else '')
    p=g('รหัสโรงงาน'); plan=g('ชื่อแผน'); eq=g('ชื่ออุปกรณ์')
    if p=='RDC01':
        b=next((x for x in BR if x in plan),None) or next((v for k,v in ALIAS.items() if k in plan),'ไม่ระบุ')
    else:
        m=re.search(r'WH ?(05|32)',eq+' '+g('สถานที่ตั้ง')); z=g('สถานที่ตั้ง')
        b='WH'+m[1] if m else ('WH32' if '24-35' in z else 'WH05' if '1-23' in z else 'ไม่ระบุ')
    if b=='ไม่ระบุ': continue  # 8 ต.ค. ผู้ใช้สั่งตัดข้อมูลที่ระบุสาขาไม่ได้ออก
    res=g('ผลการตรวจสอบ'); m=re.search(r'ไม่ผ่าน\s*(\d+)',res)
    out.append({'id':'|'.join([p,g('เลขที่แผน'),g('กำหนดการครั้งที่'),g('รหัสอุปกรณ์')]),'w':g('เลขที่ใบงาน'),'p':p,'b':b,'z':g('สถานที่ตั้ง').replace('Zone ','').replace('ถายนอก','ภายนอก'),
      'e':eq,'t':g('ประเภทเครื่องจักร/อุปกรณ์'),'n':plan,'k':g('รายการตรวจสอบ'),
      'due':d(r[ix['กำหนดการดำเนินงาน']]),'done':d(r[ix['วันที่เสร็จสิ้น']]),'s':g('สถานะ'),
      'r':('fail:'+m[1]) if m else ('pass' if res=='ผ่าน' else '')})
print(json.dumps(out,ensure_ascii=False,separators=(',',':')))
print(C.Counter(x['b'] for x in out),file=sys.stderr)
