// Bake the first screen (scoreboard) into the HTML so it reads even where JavaScript doesn't run (iPad Files / Quick Look)
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const SRC = '/home/user/robot-report/preventive-maintenance/pm-dashboard.html';
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1180, height: 820 } });
  await c.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const p = await c.newPage(); await p.goto('file://' + SRC); await p.waitForTimeout(800);
  const html = await p.evaluate(() => {
    document.querySelectorAll('[style*="animation"]').forEach(e => e.style.animation = 'none');
    return '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
  });
  fs.writeFileSync(SRC, html); await b.close(); console.log('prerendered', html.length);
})();
