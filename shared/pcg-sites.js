/* รายชื่อคลังกลาง PCG (ผู้ใช้เลือกข้อ G · 6 ต.ค. 2569)
   ทุก Dashboard ใช้ชื่อชุดเดียวกัน: pcgSite(ชื่อที่พิมพ์มา) → ชื่อมาตรฐาน · pcgSiteKey() → key ไว้จับคู่ข้ามหน้า
   เพิ่มชื่อสะกดแบบอื่นที่ alias ได้เลย (ตัวพิมพ์เล็ก/ใหญ่และช่องว่างไม่มีผล) */
var PCG_SITES = [
  ["คลัง 5", ["คลัง5", "wh05", "wh5"]],
  ["คลัง 32", ["คลัง32", "wh32"]],
  ["คลังวัตถุดิบ", ["วัตถุดิบ"]],
  ["โคราช", ["นครราชสีมา"]],
  ["อุบลราชธานี", ["อุบล"]],
  ["สุราษฎร์ธานี", ["สุราษฎร์", "สุราษ"]],
  ["ศรีราชา", ["ศรีราชาa2", "ศรีราชาa3"]],
  ["Rayong", ["ระยอง"]],
  ["วังน้อย", []], ["สายไหม", []], ["หนองแขม", []], ["ลาดพร้าว", []], ["ปากเกร็ด", []], ["ราชบุรี", []], ["เชียงใหม่", []],
  ["เชียงราย", []], ["พิษณุโลก", []], ["ขอนแก่น", []], ["หาดใหญ่", []], ["บางละมุง", []]
];
var pcgSiteKey = function (s) { return String(s == null ? "" : s).toLowerCase().replace(/[\s.]+/g, ""); };
var PCG_SITE_MAP = (function () { var m = {}; PCG_SITES.forEach(function (x) { m[pcgSiteKey(x[0])] = x[0]; x[1].forEach(function (a) { m[pcgSiteKey(a)] = x[0]; }); }); return m; })();
var pcgSite = function (s) { var t = String(s == null ? "" : s).trim(); return PCG_SITE_MAP[pcgSiteKey(t)] || t; };
if (typeof module !== "undefined") module.exports = { PCG_SITES: PCG_SITES, pcgSite: pcgSite, pcgSiteKey: pcgSiteKey };
