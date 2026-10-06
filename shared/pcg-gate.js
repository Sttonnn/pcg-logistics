/* PCG · หน้า Login แบบง่าย (ผู้ใช้ขอ 6 ต.ค. 2569: "กรอก 1 ค่าใช้ร่วมกัน ก่อนเข้า · เบื้องต้น")
   - กรอกรหัสร่วมกันช่องเดียว ถูก = เข้าได้ · จำไว้ในเครื่อง 30 วัน (localStorage "pcg-gate")
   - ตรวจในเบราว์เซอร์ (เก็บแค่ SHA-256 ของรหัส ไม่เก็บรหัสจริง) · ไม่ผูก Supabase
   - เป็นการกันคนทั่วไปเบื้องต้นเท่านั้น คนที่เปิดไฟล์ HTML ตรงๆ ยังเห็นข้อมูลที่ฝังได้
   เปลี่ยนรหัส: แก้ HASH = sha256("รหัสใหม่") (node -e 'console.log(require("crypto").createHash("sha256").update("รหัส").digest("hex"))') */
(function () {
  var HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", LS = "pcg-gate", DAYS = 30;
  var ok = false; try { var g = JSON.parse(localStorage.getItem(LS) || "null"); ok = !!(g && g.h === HASH && g.exp > Date.now()); } catch (e) {}
  if (ok) return;
  var css = "html.pcgg-lock body>*:not(.pcgg-bg){filter:blur(12px);pointer-events:none;user-select:none}"
    + ".pcgg-bg{position:fixed;inset:0;z-index:99999;background:rgba(20,22,26,.6);display:flex;align-items:center;justify-content:center;padding:16px}"
    + ".pcgg-box{background:#fff;border-radius:20px;width:min(360px,100%);padding:22px;box-shadow:0 24px 60px rgba(0,0,0,.3);font:14px 'IBM Plex Sans Thai',system-ui,sans-serif;color:#22262c;display:grid;gap:12px}"
    + ".pcgg-box h3{margin:0;font-size:18px}.pcgg-box p{margin:0;color:#5f6670;font-size:13px}"
    + ".pcgg-box input{font:inherit;font-size:18px;padding:11px 12px;border:1px solid #cfd4db;border-radius:12px;width:100%;box-sizing:border-box;text-align:center;letter-spacing:.2em}"
    + ".pcgg-row{display:flex;align-items:center;gap:8px}.pcgg-row a{margin-right:auto;color:#1d5fd0;font-weight:700;font-size:13px;text-decoration:none}"
    + ".pcgg-row button{font:inherit;font-weight:800;border:0;border-radius:12px;padding:10px 18px;cursor:pointer;background:#1d5fd0;color:#fff}"
    + ".pcgg-err{color:#c03a1c;font-size:12.5px;font-weight:700;min-height:1em}";
  document.documentElement.classList.add("pcgg-lock");
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); }
  function sha(t) { return crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)).then(hex); }
  function home() { var p = location.pathname.replace(/[^/]*$/, ""); return /\/(mhe-data|shift-schedule|preventive-maintenance|daily-machine-check)\/$/.test(p) ? "../index.html" : "index.html"; }
  function mount() {
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var bg = document.createElement("div"); bg.className = "pcgg-bg";
    bg.innerHTML = '<form class="pcgg-box"><h3>🔒 เข้าสู่ระบบ</h3><p>ใส่รหัสเข้าใช้งานของแผนก</p>'
      + '<input type="password" autocomplete="current-password" placeholder="รหัสเข้าใช้งาน"><div class="pcgg-err"></div>'
      + '<div class="pcgg-row"><a href="' + home() + '">← หน้าหลัก</a><button type="submit">เข้าสู่ระบบ</button></div></form>';
    document.body.appendChild(bg);
    var f = bg.querySelector("form"), inp = bg.querySelector("input"), err = bg.querySelector(".pcgg-err");
    f.onsubmit = function (e) {
      e.preventDefault(); var v = inp.value.trim(); if (!v) return;
      sha(v).then(function (h) {
        if (h !== HASH) { err.textContent = "รหัสไม่ถูกต้อง"; inp.select(); return; }
        try { localStorage.setItem(LS, JSON.stringify({ h: HASH, exp: Date.now() + DAYS * 864e5 })); } catch (x) {}
        bg.remove(); document.documentElement.classList.remove("pcgg-lock");
      });
    };
    setTimeout(function () { inp.focus(); }, 30);
  }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
