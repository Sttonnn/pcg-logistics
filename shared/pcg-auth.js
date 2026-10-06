/* PCG · ระบบเข้าสู่ระบบ (ผู้ใช้ขอ 6 ต.ค. 2569)
   - หน้า MHE / Shift Schedule / Warehouse: ต้อง Login ก่อนเข้า (ตั้ง window.PCG_GATE = true ก่อนโหลดไฟล์นี้)
   - เข้าด้วย ชื่อผู้ใช้ + PIN 4 หลัก (ผู้ใช้เลือก 6 ต.ค.) · 1 คน = ผู้ใช้ Supabase Auth 1 บัญชี
     อีเมลใน Supabase = <ชื่อผู้ใช้>@pcg.example.com · รหัสผ่านใน Supabase = pcg-<PIN>-<ชื่อผู้ใช้> (Supabase บังคับ ≥6 ตัว จึงแปลงให้ในโค้ด)
   - ล็อกจริงที่ Supabase ด้วย RLS (shared/login.sql)
   - Session เก็บ localStorage "pcg-auth" ใช้ร่วมกันทุกหน้าใน sttonnn.github.io · ต่ออายุ token อัตโนมัติ
   API: PCGAuth.isIn() · PCGAuth.whenIn() → Promise (รอจน Login) · PCGAuth.ensure(why) · PCGAuth.headers(anonKey) · PCGAuth.logout() */
(function () {
  if (window.PCGAuth) return;
  var URL_ = "https://mgnshovnibcmiptoxdfe.supabase.co", DOMAIN = "@pcg.example.com", LS = "pcg-auth";
  var normU = function (u) { return String(u || "").trim().toLowerCase(); };
  var ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nbnNob3ZuaWJjbWlwdG94ZGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzNzI1NDIsImV4cCI6MjEwNDk0ODU0Mn0.UoPu-i6ODMEgyuqoO6oKHf0JIqFKpWkSpBkOKrpITwQ";
  var ses = null; try { ses = JSON.parse(localStorage.getItem(LS) || "null"); } catch (e) {}
  var chip, resolveIn, waitIn = new Promise(function (r) { resolveIn = r; });
  var now = function () { return Math.floor(Date.now() / 1000); };
  function save(s) { ses = s; try { s ? localStorage.setItem(LS, JSON.stringify(s)) : localStorage.removeItem(LS); } catch (e) {} paint(); }
  function token(kind, body) {
    return fetch(URL_ + "/auth/v1/token?grant_type=" + kind, { method: "POST", headers: { apikey: ANON, "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error_description || j.msg || j.error || r.status); return j; }); })
      .then(function (j) { var u = (j.user && j.user.email ? j.user.email : (ses && ses.u) || "").split("@")[0]; save({ at: j.access_token, rt: j.refresh_token, exp: now() + (j.expires_in || 3600) - 60, u: u }); return true; });
  }
  function refresh() {
    if (!ses) return Promise.resolve(false);
    if (ses.exp > now()) return Promise.resolve(true);
    return token("refresh_token", { refresh_token: ses.rt }).catch(function () { save(null); return false; });
  }
  setInterval(function () { if (ses && ses.exp - now() < 600) { ses.exp = 0; refresh(); } }, 300000);

  var A = window.PCGAuth = {
    isIn: function () { return !!ses; },
    user: function () { return ses ? ses.u || "" : ""; },
    headers: function (anon) { var k = anon || ANON; return { apikey: k, Authorization: "Bearer " + (ses ? ses.at : k) }; },
    ensure: function (why) { return refresh().then(function (ok) { return ok || open(why, false); }); },
    whenIn: function () { return refresh().then(function (ok) { return ok || waitIn; }); },
    logout: function () { save(null); if (window.PCG_GATE) location.reload(); }
  };

  var css = ".pcga-chip{position:fixed;right:14px;bottom:14px;z-index:9998;display:flex;align-items:center;gap:7px;font:700 12.5px 'IBM Plex Sans Thai',system-ui,sans-serif;border-radius:999px;padding:8px 13px;border:1px solid rgba(0,0,0,.12);box-shadow:0 6px 18px rgba(0,0,0,.16);cursor:pointer;background:#fff;color:#33373d}"
    + ".pcga-chip.in{background:#e7f6ee;color:#0f6b42;border-color:#9fd8bb}"
    + ".pcga-bg{position:fixed;inset:0;z-index:9999;background:rgba(20,22,26,.45);display:flex;align-items:center;justify-content:center;padding:16px}"
    + "html.pcga-lock body>*:not(.pcga-bg){filter:blur(12px);pointer-events:none;user-select:none}html.pcga-lock .pcga-bg{background:rgba(20,22,26,.62)}"
    + ".pcga-box{background:#fff;border-radius:20px;width:min(380px,100%);padding:22px;box-shadow:0 24px 60px rgba(0,0,0,.3);font:14px 'IBM Plex Sans Thai',system-ui,sans-serif;color:#22262c;display:grid;gap:12px}"
    + ".pcga-box h3{margin:0;font-size:18px}.pcga-box p{margin:0;color:#5f6670;font-size:13px;line-height:1.5}"
    + ".pcga-box input{font:inherit;font-size:16px;padding:11px 12px;border:1px solid #cfd4db;border-radius:12px;width:100%;box-sizing:border-box}"
    + ".pcga-box .row{display:flex;gap:8px;justify-content:flex-end;align-items:center}.pcga-box button{font:inherit;font-weight:800;border:0;border-radius:12px;padding:10px 16px;cursor:pointer}"
    + ".pcga-ok{background:#1d5fd0;color:#fff}.pcga-no{background:#eef0f3;color:#33373d}.pcga-err{color:#c03a1c;font-size:12.5px;font-weight:700;min-height:1em}"
    + ".pcga-home{margin-right:auto;color:#1d5fd0;font-weight:700;font-size:13px;text-decoration:none}";

  function paint() { if (!chip) return; chip.className = "pcga-chip" + (ses ? " in" : ""); chip.textContent = ses ? "✓ " + (ses.u || "เข้าสู่ระบบแล้ว") + " · ออก" : "🔒 เข้าสู่ระบบ"; }
  function homeHref() { var p = location.pathname.replace(/[^/]*$/, ""); return /\/(mhe-data|shift-schedule|preventive-maintenance|daily-machine-check)\/$/.test(p) ? "../index.html" : "index.html"; }
  function open(why, gate) {
    return new Promise(function (done) {
      var bg = document.createElement("div"); bg.className = "pcga-bg";
      var left = gate ? '<a class="pcga-home" href="' + homeHref() + '">← หน้าหลัก</a>' : '<button type="button" class="pcga-no">ยกเลิก</button>';
      bg.innerHTML = '<form class="pcga-box"><h3>🔒 เข้าสู่ระบบ</h3><p>' + (why || "ใส่ชื่อผู้ใช้และ PIN 4 หลัก") + '</p>'
        + '<input name="u" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="ชื่อผู้ใช้">'
        + '<input name="p" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="current-password" placeholder="PIN 4 หลัก" style="letter-spacing:.5em;text-align:center"><div class="pcga-err"></div>'
        + '<div class="row">' + left + '<button type="submit" class="pcga-ok">เข้าสู่ระบบ</button></div></form>';
      document.body.appendChild(bg);
      var f = bg.querySelector("form"), usr = bg.querySelector("input[name=u]"), inp = bg.querySelector("input[name=p]"), err = bg.querySelector(".pcga-err"), ok = bg.querySelector(".pcga-ok");
      var end = function (v) { bg.remove(); if (v) { document.documentElement.classList.remove("pcga-lock"); resolveIn(true); } done(v); };
      if (!gate) { bg.querySelector(".pcga-no").onclick = function () { end(false); }; bg.addEventListener("click", function (e) { if (e.target === bg) end(false); }); }
      f.onsubmit = function (e) {
        e.preventDefault(); var u = normU(usr.value), pin = inp.value.trim();
        if (!/^[a-z0-9._-]{2,30}$/.test(u)) { err.textContent = "ชื่อผู้ใช้ใช้ได้เฉพาะ a-z 0-9 . _ -"; usr.focus(); return; }
        if (!/^\d{4}$/.test(pin)) { err.textContent = "PIN ต้องเป็นตัวเลข 4 หลัก"; inp.select(); return; }
        try { localStorage.setItem("pcg-auth-last", u); } catch (x) {}
        ok.disabled = true; ok.textContent = "กำลังตรวจ…"; err.textContent = "";
        token("password", { email: u + DOMAIN, password: "pcg-" + pin + "-" + u }).then(function () { end(true); }).catch(function (x) {
          ok.disabled = false; ok.textContent = "เข้าสู่ระบบ";
          err.textContent = /invalid/i.test(String(x.message)) ? "ชื่อผู้ใช้หรือ PIN ไม่ถูกต้อง" : /rate|too many/i.test(String(x.message)) ? "ลองผิดหลายครั้ง รอสักครู่แล้วลองใหม่" : "เข้าสู่ระบบไม่ได้: " + x.message; inp.select(); });
      };
      try { usr.value = localStorage.getItem("pcg-auth-last") || ""; } catch (x) {}
      setTimeout(function () { (usr.value ? inp : usr).focus(); }, 30);
    });
  }
  function mount() {
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    chip = document.createElement("button"); chip.type = "button"; paint(); document.body.appendChild(chip);
    chip.onclick = function () {
      if (!ses) { open("", !!window.PCG_GATE && !A.isIn()); return; }
      if (chip.dataset.arm) { delete chip.dataset.arm; A.logout(); return; }
      chip.dataset.arm = 1; chip.textContent = "กดอีกครั้งเพื่อออกจากระบบ"; setTimeout(function () { delete chip.dataset.arm; paint(); }, 2500);
    };
    refresh().then(function (ok) {
      if (ok) { document.documentElement.classList.remove("pcga-lock"); resolveIn(true); }
      else if (window.PCG_GATE) { document.documentElement.classList.add("pcga-lock"); open("หน้านี้ต้องเข้าสู่ระบบก่อนดูข้อมูล · ใส่ชื่อผู้ใช้และ PIN 4 หลัก", true); }
    });
  }
  if (window.PCG_GATE) document.documentElement.classList.add("pcga-lock");
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
  window.addEventListener("storage", function (e) { if (e.key === LS) { try { ses = JSON.parse(e.newValue || "null"); } catch (x) { ses = null; } paint(); } });
})();
