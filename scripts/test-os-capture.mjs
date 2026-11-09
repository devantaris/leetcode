import { chromium } from 'playwright';
import path from 'path';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function testOS() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  console.log('Navigating to landing page...');
  await page.goto('https://leetcode-psi.vercel.app', { waitUntil: 'networkidle' });
  
  // Launch demo in OS mode directly!
  // Look at landing page: there is a button "Demo OS" or "OS Mode"
  console.log('Clicking OS Mode / Demo OS...');
  const osDemoBtn = await page.$('button[title*="Retro"], button:has-text("Demo OS"), button:has-text("OS Mode")');
  if (osDemoBtn) {
    await osDemoBtn.click();
  } else {
    // Or explore demo first then switch to OS
    await page.click('button:has-text("Explore Demo")');
    await sleep(2000);
    const osBtn = await page.$('button[title*="Retro"], button:has-text("Retro"), button:has-text("OS")');
    if (osBtn) await osBtn.click();
  }

  console.log('Waiting for .os-desktop (after BootScreen finishes)...');
  await page.waitForSelector('.os-desktop', { timeout: 15000 });
  await sleep(1500); // let animations settle

  console.log('Capturing fully booted OS desktop...');
  await page.screenshot({ path: path.resolve('demo-video/assets/real-os-desktop.png') });
  console.log('✅ real-os-desktop.png captured!');

  await browser.close();
}

testOS().catch((e) => {
  console.error(e);
  process.exit(1);
});
