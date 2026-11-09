import { chromium } from 'playwright';

async function verify() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('https://leetcode-psi.vercel.app');
  
  // Click Explore Demo
  await page.click('button:has-text("Explore Demo")');
  await page.waitForTimeout(2000);
  console.log('Dashboard URL:', page.url());

  // Click Syllabus link in sidebar/nav
  const syllabusLink = await page.$('a[href="/curriculum"]');
  if (syllabusLink) {
    await syllabusLink.click();
    await page.waitForTimeout(1500);
    console.log('Curriculum URL:', page.url());
  }

  // Click Tracker link
  const trackerLink = await page.$('a[href="/tracker"]');
  if (trackerLink) {
    await trackerLink.click();
    await page.waitForTimeout(1500);
    console.log('Tracker URL:', page.url());
  }

  // Switch to Retro OS
  const osBtn = await page.$('button[title*="Retro"], button:has-text("OS"), a[href="/os"]');
  console.log('OS button found:', !!osBtn);

  await browser.close();
}

verify();
