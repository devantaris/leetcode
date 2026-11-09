import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('pageerror', err => {
    errors.push(err.message);
    console.error('PAGE ERROR:', err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('CONSOLE ERROR:', msg.text());
    }
  });

  console.log('Navigating to http://localhost:5173 ...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // Check headline text
  const headline = await page.textContent('h1');
  console.log('H1 Text:', headline?.trim().replace(/\s+/g, ' '));

  // Check hero canvas
  const hasCanvas = await page.$('canvas#heroCanvas');
  console.log('Hero canvas present:', !!hasCanvas);

  // Check demo checklist
  const demoProb = await page.$('#demo');
  console.log('Demo section present:', !!demoProb);

  // Take screenshot
  await page.screenshot({ path: 'scripts/landing-hero-capture.png' });
  console.log('Captured screenshot to scripts/landing-hero-capture.png');

  // Full page screenshot
  await page.screenshot({ path: 'scripts/landing-full-capture.png', fullPage: true });
  console.log('Captured full page screenshot to scripts/landing-full-capture.png');

  await browser.close();

  if (errors.length > 0) {
    console.error('Encountered page errors:', errors);
    process.exit(1);
  } else {
    console.log('Landing page verified cleanly with zero page errors!');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
