import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Scroll down to footer
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'scripts/landing-footer-capture.png' });
  console.log('Captured footer screenshot to scripts/landing-footer-capture.png');

  await browser.close();
}

main().catch(console.error);
