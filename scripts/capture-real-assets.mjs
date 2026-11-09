import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function capture() {
  const dir = path.resolve('demo-video/assets');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  console.log('1. Loading landing page & launching Demo...');
  await page.goto('https://leetcode-psi.vercel.app', { waitUntil: 'networkidle' });
  await sleep(1000);

  await page.click('button:has-text("Explore Demo")');
  await sleep(2000);
  console.log('Currently at:', page.url());

  // Capture Dashboard
  console.log('2. Capturing Dashboard...');
  await page.screenshot({ path: path.join(dir, 'real-dashboard.png') });

  // Navigate to Curriculum
  console.log('3. Navigating to Curriculum...');
  const curriculumLink = await page.$('a[href="/curriculum"]');
  if (curriculumLink) {
    await curriculumLink.click();
    await sleep(2000);
    // Expand a week or topic if accordion exists
    const accordionBtn = await page.$('button:has-text("Week 1"), button:has-text("Arrays"), button:has-text("Day 1")');
    if (accordionBtn) {
      await accordionBtn.click();
      await sleep(500);
    }
    await page.screenshot({ path: path.join(dir, 'real-curriculum.png') });
  }

  // Navigate to Tracker (Offer Pipeline Kanban)
  console.log('4. Navigating to Tracker...');
  const trackerLink = await page.$('a[href="/tracker"]');
  if (trackerLink) {
    await trackerLink.click();
    await sleep(2000);
    await page.screenshot({ path: path.join(dir, 'real-tracker.png') });
  }

  // Navigate to Retro OS
  console.log('5. Navigating to Retro OS...');
  // Look for OS switcher button
  const osBtn = await page.$('button[title*="Retro"], button:has-text("Retro"), button:has-text("OS")');
  if (osBtn) {
    await osBtn.click();
    await sleep(2500);
    await page.screenshot({ path: path.join(dir, 'real-os.png') });
  }

  console.log('✅ Real UI screenshots successfully captured!');
  await browser.close();
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
