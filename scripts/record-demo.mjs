import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function typeInto(page, selector, text, delay = 70) {
  for (const char of text) {
    await page.type(selector, char, { delay });
  }
}

async function run() {
  const outputDir = path.resolve('demo-video');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Clean old webm files in outputDir
  for (const file of fs.readdirSync(outputDir)) {
    if (file.endsWith('.webm')) {
      try { fs.unlinkSync(path.join(outputDir, file)); } catch {}
    }
  }

  console.log('Launching Chrome with video recording...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 },
    },
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();

  console.log('1. Navigating to GrindOS landing page...');
  await page.goto('https://leetcode-psi.vercel.app', { waitUntil: 'networkidle' });
  await sleep(1500);

  // Smooth scroll down hero
  console.log('2. Exploring hero and features...');
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
  await sleep(1500);

  // Click Interactive Demo button on landing page
  console.log('3. Opening Interactive Demo Choice Modal...');
  const demoModalTrigger = await page.$('button:has-text("Interactive Demo"), button:has-text("Explore Demo")');
  if (demoModalTrigger) {
    await demoModalTrigger.click();
    await sleep(1200);

    // Click Launch Modern Demo inside modal
    console.log('4. Launching Cadence Pro Web Dashboard...');
    const launchDemoBtn = await page.$('button:has-text("Launch Modern Demo")');
    if (launchDemoBtn) {
      await launchDemoBtn.click();
    }
  } else {
    await page.goto('https://leetcode-psi.vercel.app/dashboard', { waitUntil: 'networkidle' });
  }
  await sleep(2500);

  // Showcase Dashboard metrics & scroll
  console.log('5. Showcasing Cadence Pro Dashboard metrics & telemetry...');
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await sleep(2000);
  await page.evaluate(() => window.scrollBy({ top: -400, behavior: 'smooth' }));
  await sleep(1500);

  // Navigate to Syllabus
  console.log('6. Navigating to Syllabus & Problem Explorer...');
  const syllabusLink = await page.$('a[href="/curriculum"]');
  if (syllabusLink) {
    await syllabusLink.click();
    await sleep(2000);

    // Expand week 1 if collapsed or search
    console.log('7. Solving a problem and triggering confetti...');
    const solveCheckbox = await page.$('button[role="checkbox"], input[type="checkbox"]');
    if (solveCheckbox) {
      await solveCheckbox.click();
      await sleep(2500);
    }
  }

  // Switch to Retro Terminal OS Mode
  console.log('8. Switching to Retro GrindOS 95 Shell...');
  const osBtn = await page.$('button:has-text("Terminal OS")');
  if (osBtn) {
    await osBtn.click();
    await sleep(3500);
  } else {
    await page.goto('https://leetcode-psi.vercel.app/os', { waitUntil: 'networkidle' });
    await sleep(3500);
  }

  // Interact with retro terminal CLI
  console.log('9. Interacting with VT220 Terminal CLI...');
  const termInput = await page.$('input.cli-input, input[type="text"]');
  if (termInput) {
    await termInput.click();
    await typeInto(page, 'input.cli-input, input[type="text"]', 'missions', 70);
    await page.keyboard.press('Enter');
    await sleep(1500);
    await typeInto(page, 'input.cli-input, input[type="text"]', 'stats', 70);
    await page.keyboard.press('Enter');
    await sleep(2500);
  } else {
    await sleep(3000);
  }

  console.log('10. Finalizing demo recording...');
  await sleep(1000);

  await page.close();
  await context.close();
  await browser.close();

  // Find generated video and rename
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.webm'));
  if (files.length > 0) {
    const latestVideo = path.join(outputDir, files[0]);
    const finalDest = path.resolve('grindos-demo.webm');
    fs.copyFileSync(latestVideo, finalDest);
    const sizeMb = (fs.statSync(finalDest).size / (1024 * 1024)).toFixed(2);
    console.log(`\n🎉 Success! Demo video saved to: ${finalDest} (${sizeMb} MB)`);
  }
}

run().catch((err) => {
  console.error('Error during recording:', err);
  process.exit(1);
});
