import { chromium } from 'playwright';
import path from 'path';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function captureAllRetro() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 940, height: 980 } });
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    localStorage.setItem('grindos_demo_mode', 'true');
    sessionStorage.setItem('grindos_booted', 'true'); // Bypass boot screen!
  });

  await page.goto('http://localhost:5173/os');
  await page.waitForSelector('.os-desktop', { timeout: 6000 });
  await sleep(1200);

  const dir = path.resolve('demo-video/dual-assets');

  // 1. Retro Dashboard (MISSIONS.EXE open on desktop)
  console.log('1. Capturing os-dash-1.png...');
  await page.screenshot({ path: path.join(dir, 'os-dash-1.png') });

  // 1b. In MISSIONS.EXE, toggle first problem
  console.log('Toggling problem in MISSIONS.EXE...');
  const check = await page.$('.win button, .win input[type="checkbox"], .win .chk');
  if (check) {
    await check.click();
    await sleep(600);
  }
  console.log('1b. Capturing os-dash-2.png...');
  await page.screenshot({ path: path.join(dir, 'os-dash-2.png') });

  // Helper to open an app via Start button (.start)
  async function openFromStart(name) {
    console.log(`Opening ${name}...`);
    await page.click('button.start');
    await sleep(350);
    await page.click(`#startmenu button:has-text("${name}")`);
    await sleep(700);
  }

  // 2. Open SYLLABUS.EXE
  await openFromStart('SYLLABUS.EXE');
  await page.screenshot({ path: path.join(dir, 'os-curriculum.png') });

  // 3. Open STATS.EXE
  await openFromStart('STATS.EXE');
  await page.screenshot({ path: path.join(dir, 'os-analytics.png') });

  // 4. Open COHORT.EXE
  await openFromStart('COHORT.EXE');
  await page.screenshot({ path: path.join(dir, 'os-leaderboard.png') });

  // 5. Open PIPELINE.EXE
  await openFromStart('PIPELINE.EXE');
  await page.screenshot({ path: path.join(dir, 'os-tracker.png') });

  console.log('🎉 All 5 retro screens successfully captured with authentic Windows 95 UI!');
  await browser.close();
}

captureAllRetro().catch(console.error);
