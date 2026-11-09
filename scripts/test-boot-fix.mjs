import { chromium } from 'playwright';

async function testBoot() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 940, height: 980 } });

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    localStorage.setItem('grindos_demo_mode', 'true');
    sessionStorage.clear(); // test cold boot
  });

  console.log('Navigating to http://localhost:5173/os...');
  await page.goto('http://localhost:5173/os');

  console.log('Waiting for .os-desktop to appear...');
  const start = Date.now();
  await page.waitForSelector('.os-desktop', { timeout: 8000 });
  const elapsed = (Date.now() - start) / 1000;
  console.log(`✅ Boot finished cleanly in ${elapsed}s! .os-desktop is visible!`);

  // Verify what windows are open
  const windows = await page.$$eval('.os-window', els => els.map(e => e.innerText.slice(0, 50)));
  console.log('Open windows:', windows);

  await page.screenshot({ path: 'demo-video/test-boot-fixed.png' });
  console.log('Saved screenshot to demo-video/test-boot-fixed.png');

  await browser.close();
}

testBoot().catch(console.error);
