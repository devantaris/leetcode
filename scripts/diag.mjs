import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  await page.goto('https://leetcode-psi.vercel.app');
  await page.waitForTimeout(1000);

  // Click Explore Demo
  await page.click('button:has-text("Explore Demo")');
  await page.waitForTimeout(2000);
  console.log('1. After Explore Demo URL:', page.url());

  // Click Retro OS toggle
  console.log('2. Clicking OS Mode button in navbar...');
  const osBtn = await page.$('button[title*="Retro"], button:has-text("OS"), a[href="/os"]');
  console.log('Found button:', !!osBtn);
  if (osBtn) {
    await osBtn.click();
  } else {
    // Try pressing Alt+O keyboard shortcut!
    console.log('Pressing Alt+O...');
    await page.keyboard.press('Alt+KeyO');
  }

  await page.waitForTimeout(3000);
  console.log('3. URL after switch:', page.url());
  await page.screenshot({ path: 'demo-video/assets/diag-1.png' });

  // Wait another 3 seconds for boot to finish
  await page.waitForTimeout(3000);
  console.log('4. URL 3s later:', page.url());
  await page.screenshot({ path: 'demo-video/assets/diag-2.png' });

  await browser.close();
}

diagnose();
