import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function renderDualVideo() {
  const outputDir = path.resolve('demo-video');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🎬 Launching Chromium for 1080p Dual-Engine Split-Screen Recording...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--hide-scrollbars', '--force-device-scale-factor=1'],
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: outputDir,
      size: { width: 1920, height: 1080 },
    },
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  const htmlPath = path.resolve('scripts/dual-engine-demo.html').replace(/\\/g, '/');
  const fileUrl = `file:///${htmlPath}`;

  console.log(`📡 Loading dual-engine scene: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'load' });

  console.log('⏳ Recording dual-engine split screen demo (30 seconds)...');
  
  try {
    await page.waitForFunction(() => window.__animationFinished === true, { timeout: 38000 });
  } catch (e) {
    console.log('Animation timeout reached, wrapping up video stream...');
  }

  // Hold final celebratory card for 1.5 seconds
  await sleep(1500);

  console.log('💾 Finalizing video stream...');
  const video = page.video();
  const tempVideoPath = await video.path();

  await page.close();
  await context.close();
  await browser.close();

  const finalWebm = path.resolve('grindos-dual-demo.webm');
  const mainWebm = path.resolve('grindos-motion.webm');

  if (fs.existsSync(tempVideoPath)) {
    fs.copyFileSync(tempVideoPath, finalWebm);
    fs.copyFileSync(tempVideoPath, mainWebm);
    console.log(`✅ Dual-engine video generated: ${finalWebm} (${(fs.statSync(finalWebm).size / (1024 * 1024)).toFixed(2)} MB)`);
  } else {
    console.error('❌ Could not locate recorded video output.');
  }

  console.log('🎉 Dual-Engine split-screen render complete!');
}

renderDualVideo().catch(err => {
  console.error('Fatal error during render:', err);
  process.exit(1);
});
