import { chromium } from 'playwright';

async function testFrames() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // First visit localhost:5173 and activate demo mode so localStorage has demo data
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Explore Demo")');
  await page.waitForTimeout(2000);
  console.log('Demo mode activated. URL:', page.url());

  // Check if /os opens
  await page.goto('http://localhost:5173/os');
  await page.waitForTimeout(4000); // wait for boot to complete
  console.log('OS URL:', page.url());

  await browser.close();
  console.log('Done test');
}

testFrames().catch(console.error);
