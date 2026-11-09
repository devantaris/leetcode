import { chromium } from 'playwright';

async function testDesktop() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 940, height: 980 } });
  await page.goto('http://localhost:5173');
  await page.evaluate(() => localStorage.setItem('grindos_demo_mode', 'true'));
  await page.goto('http://localhost:5173/os');
  await page.waitForSelector('.os-desktop', { timeout: 5000 });

  // Open MISSIONS.EXE
  console.log('Double clicking MISSIONS.EXE icon...');
  const icon = await page.$('.desktop-icon:has-text("MISSIONS.EXE")');
  if (icon) {
    await icon.dblclick();
    await page.waitForTimeout(500);
  } else {
    console.log('Looking for all icons...');
    const all = await page.$$eval('.desktop-icon, [class*="icon"]', els => els.map(e => e.innerText));
    console.log('Icons found:', all);
  }

  const windows = await page.$$eval('.os-window', els => els.map(e => e.innerText.slice(0, 40)));
  console.log('Open windows now:', windows);

  await page.screenshot({ path: 'demo-video/test-desktop-open.png' });
  console.log('Saved test-desktop-open.png');

  await browser.close();
}

testDesktop().catch(console.error);
