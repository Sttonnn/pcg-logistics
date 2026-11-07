/* PCG · หน้าใส่รหัสก่อนเข้าแต่ละ Dashboard
   6 พ.ย. 2569 ผู้ใช้สั่ง: "ในทุกหน้าที่เข้า อยากให้ใส่รหัส ในหัวข้อนั้นๆ หน้าตาแบบนี้" (แบบหน้ารหัสของบันทึกการประชุม)
   - ใส่ <script src="https://sttonnn.github.io/pcg-logistics/shared/pcg-gate.js" data-title="ชื่อระบบ"></script> ใน <head>
   - รหัสเดียวกับปุ่มหน้าหลักของหน้า Robot / หน้าบันทึกการประชุม (เทียบ SHA-256 · ไม่เก็บรหัสจริง)
   - จำรายหน้า ใส่วันละครั้ง (localStorage "pcg-gate:<ชื่อหน้า>" = วันที่)
   - ลิงก์ลูกค้า Warehouse (?customer=1 + window.PCG_GATE_PUBLIC) ไม่ต้องใส่รหัส
   - กันได้แค่หน้าจอ: ข้อมูลที่ฝังในไฟล์/ตารางที่อ่านด้วย anon key ยังเปิดตรงได้
   เปลี่ยนรหัส: HASH = sha256("รหัสใหม่") แล้วแก้ GATE_HASH ใน robot-dashboard / mom-dashboard ให้ตรงกัน */
(function () {
  var HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
  var PORTAL = "https://sttonnn.github.io/pcg-logistics/";
  var me = document.currentScript || {}, ds = me.dataset || {};
  if (window.PCG_GATE_PUBLIC && /[?&]customer=1(&|$)/.test(location.search)) return;
  var title = ds.title || window.PCG_GATE_TITLE || document.title || "PCG Dashboard";
  var sub = ds.sub || "สำหรับทีมแผนกโครงการ";
  var d = new Date(), TODAY = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  var KEY = "pcg-gate:" + (ds.key || title);
  var DONE = false; try { DONE = localStorage.getItem(KEY) === TODAY; } catch (e) {}
  var LOGO = "data:image/png;base64,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";
  var css = "html.pcgg-lock,html.pcgg-lock body{overflow:hidden!important}"
    + "html.pcgg-lock body>*:not(#pcggBg){visibility:hidden!important}"
    + "#pcggBg{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:16px;background:linear-gradient(135deg,#0b1f47,#14408f 60%,#0b6f6b);font-family:Anuphan,Prompt,'IBM Plex Sans Thai',system-ui,sans-serif;visibility:visible!important}"
    + "#pcggBg *{box-sizing:border-box}"
    + "#pcggBg .bx{background:#fff;color:#14213d;border-radius:24px;width:min(500px,100%);overflow:hidden;box-shadow:0 30px 70px rgba(0,0,0,.35)}"
    + "#pcggBg .hd{background:linear-gradient(135deg,#0f2a5c,#1d4fa8);color:#fff;padding:22px 26px;display:flex;gap:14px;align-items:center}"
    + "#pcggBg .hd img{height:46px;border-radius:7px;background:#fff;padding:3px;flex:none}"
    + "#pcggBg .hd b{display:block;font-family:Prompt,Anuphan,system-ui,sans-serif;font-size:20px;line-height:1.25}"
    + "#pcggBg .hd span{display:block;font-size:14px;opacity:.85;margin-top:2px}"
    + "#pcggBg form{padding:24px 26px;display:grid;gap:12px;margin:0}"
    + "#pcggBg label{font-weight:700;font-size:15px}"
    + "#pcggBg input{font:inherit;font-size:17px;border:1px solid #dfe5ef;border-radius:14px;padding:13px 16px;width:100%;color:#14213d;background:#fff}"
    + "#pcggBg input:focus{outline:3px solid #f2a516;outline-offset:1px}"
    + "#pcggBg .er{color:#d92d20;font-size:13.5px;font-weight:600;min-height:18px}"
    + "#pcggBg .rw{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:4px}"
    + "#pcggBg a{color:#50607e;font-size:14px}"
    + "#pcggBg button{border:0;border-radius:14px;padding:13px 20px;font:inherit;font-weight:800;font-size:16px;color:#fff;cursor:pointer;background:linear-gradient(135deg,#0f2a5c,#1d4fa8);box-shadow:0 10px 22px rgba(29,79,168,.3)}"
    + "#pcggBg button:disabled{opacity:.6}";
  css += "#pcggBg.home{background:rgba(11,31,71,.55);backdrop-filter:blur(4px)}#pcggBg .cx{background:#eef2f8;color:#14213d;box-shadow:none}";
  function addCss() { if (document.getElementById("pcggCss")) return; var st = document.createElement("style"); st.id = "pcggCss"; st.textContent = css; (document.head || document.documentElement).appendChild(st); }
  /* 7 พ.ย. ปุ่ม "หน้าหลัก" ที่ต้องใส่รหัสก่อนกลับ Portal: PCGGate.home() · ผ่านแล้วจำในแท็บนั้น (sessionStorage pcg-home-ok เหมือนหน้า Robot) */
  window.PCGGate = { home: function (url) {
    url = url || PORTAL;
    try { if (sessionStorage.getItem("pcg-home-ok") === HASH) { location.href = url; return; } } catch (e) {}
    addCss(); mount(true, url);
  } };
  if (DONE) return;
  addCss();
  document.documentElement.classList.add("pcgg-lock");
  /* หน้าที่เปิดป๊อปอัป <dialog> ตอนโหลด (เช่น Daily Task ถามชื่อ) จะบังหน้ารหัส → พักไว้ แล้วเปิดหลังใส่รหัสถูก */
  var HELD = [], DP = window.HTMLDialogElement && HTMLDialogElement.prototype, SM = DP && DP.showModal;
  if (SM) DP.showModal = function () { if (document.documentElement.classList.contains("pcgg-lock")) { if (HELD.indexOf(this) < 0) HELD.push(this); return; } return SM.apply(this, arguments); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ("0" + x.toString(16)).slice(-2); }).join(""); }
  function mount(home, url) {
    if (document.getElementById("pcggBg")) return;
    var bg = document.createElement("div"); bg.id = "pcggBg"; if (home) bg.className = "home";
    bg.innerHTML = '<div class="bx" role="dialog" aria-modal="true" aria-labelledby="pcggT"><div class="hd"><img src="' + LOGO + '" alt="PCG"><div><b id="pcggT">' + (home ? "เข้าสู่หน้าภาพรวม" : esc(title)) + '</b><span>' + (home ? "PCG Project Portal · " : "") + esc(sub) + '</span></div></div>'
      + '<form autocomplete="on"><label for="pcggPw">' + (home ? "ใส่รหัสเพื่อกลับหน้าหลัก" : "ใส่รหัสเพื่อเข้าใช้งาน") + '</label><input id="pcggPw" type="password" autocomplete="current-password" placeholder="รหัส">'
      + '<div class="er" id="pcggEr"></div><div class="rw">' + (home ? '<button type="button" class="cx" id="pcggX">ยกเลิก</button><button type="submit">เข้าสู่หน้าภาพรวม →</button>' : '<a href="' + PORTAL + '">← หน้าหลัก</a><button type="submit">เข้าใช้งาน →</button>') + '</div></form></div>';
    document.body.appendChild(bg);
    var f = bg.querySelector("form"), pw = bg.querySelector("#pcggPw"), er = bg.querySelector("#pcggEr"), bt = bg.querySelector("button[type=submit]");
    if (home) { var close = function () { bg.remove(); document.removeEventListener("keydown", esck); }, esck = function (e) { if (e.key === "Escape") close(); };
      bg.querySelector("#pcggX").onclick = close; bg.onclick = function (e) { if (e.target === bg) close(); }; document.addEventListener("keydown", esck); }
    setTimeout(function () { try { pw.focus(); } catch (e) {} }, 50);
    f.onsubmit = function (e) {
      e.preventDefault(); var v = pw.value.trim(); if (!v) { er.textContent = "กรุณาใส่รหัส"; return; }
      if (!(window.crypto && crypto.subtle)) { er.textContent = "เบราว์เซอร์นี้ตรวจรหัสไม่ได้ (ต้องเปิดผ่าน https)"; return; }
      bt.disabled = true;
      crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)).then(function (h) {
        bt.disabled = false;
        if (hex(h) !== HASH) { er.textContent = "รหัสไม่ถูกต้อง ลองอีกครั้ง"; pw.select(); return; }
        if (home) { try { sessionStorage.setItem("pcg-home-ok", HASH); } catch (e) {} location.href = url; return; }
        try { localStorage.setItem(KEY, TODAY); } catch (e) {}
        bg.remove(); document.documentElement.classList.remove("pcgg-lock");
        HELD.splice(0).forEach(function (dl) { try { if (!dl.open && dl.isConnected) SM.call(dl); } catch (e) {} });
        try { window.dispatchEvent(new Event("resize")); window.dispatchEvent(new Event("pcg-unlock")); } catch (e) {}
      }, function () { bt.disabled = false; er.textContent = "ตรวจรหัสไม่สำเร็จ ลองอีกครั้ง"; });
    };
  }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", function () { mount(); });
})();
