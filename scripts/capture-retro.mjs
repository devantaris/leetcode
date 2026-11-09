import { chromium } from 'playwright';
import path from 'path';

async function captureRetro() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  await page.goto('https://leetcode-psi.vercel.app');
  await page.waitForTimeout(1000);

  // Click Explore Demo
  await page.click('button:has-text("Explore Demo")');
  await page.waitForTimeout(1500);

  // Switch to Retro OS
  const osBtn = await page.$('button[title*="Retro"], button:has-text("OS")');
  if (osBtn) await osBtn.click();

  // Boot screen is active for ~2 seconds. Capture the BIOS boot screen!
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.resolve('demo-video/assets/real-os-boot.png') });
  console.log('✅ Captured real-os-boot.png');

  // Wait for boot to finish into full desktop
  await page.waitForTimeout(3000);
  
  // Double-click SYLLABUS.EXE or STATS.EXE icon on desktop to open a cool second retro window!
  const syllabusIcon = await page.$('div:has-text("SYLLABUS.EXE"), div:has-text("STATS.EXE")');
  if (syllabusIcon) {
    console.log('Double clicking SYLLABUS icon...');
    await syllabusIcon.dblclick();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: path.resolve('demo-video/assets/real-os-desktop.png') });
  console.log('✅ Captured real-os-desktop.png with active windows!');

  await browser.close();
}

captureRetro().catch(console.error);
