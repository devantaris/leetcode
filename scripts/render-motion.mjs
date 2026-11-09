import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function render() {
  const outputDir = path.resolve('demo-video');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Clear existing webm in demo-video
  for (const f of fs.readdirSync(outputDir)) {
    if (f.endsWith('.webm') || f.endsWith('.mp4')) {
      try { fs.unlinkSync(path.join(outputDir, f)); } catch {}
    }
  }

  console.log('🎬 Launching Chromium for 1080p Motion Graphics Rendering...');
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
  const htmlPath = path.resolve('scripts/motion-graphic-v2.html').replace(/\\/g, '/');
  const fileUrl = `file:///${htmlPath}`;

  console.log(`📡 Loading motion graphics scene: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'load' });

  console.log('⏳ Recording motion graphics animation (~22 seconds)...');
  
  // Wait until animation finishes or 26s timeout
  try {
    await page.waitForFunction(() => window.__animationFinished === true, { timeout: 28000 });
  } catch (e) {
    console.log('Animation timeout reached, continuing to final frame...');
  }

  // Hold final CTA for 1.8 seconds
  await sleep(1800);

  console.log('💾 Finalizing video stream...');
  const video = page.video();
  const tempVideoPath = await video.path();

  await page.close();
  await context.close();
  await browser.close();

  const finalWebm = path.resolve('grindos-motion.webm');
  const finalMp4 = path.resolve('grindos-motion.mp4');

  if (fs.existsSync(tempVideoPath)) {
    fs.copyFileSync(tempVideoPath, finalWebm);
    console.log(`✅ WebM generated: ${finalWebm} (${(fs.statSync(finalWebm).size / (1024 * 1024)).toFixed(2)} MB)`);

    // Transcode to MP4 using Playwright's ffmpeg
    const ffmpegPath = 'C:\\Users\\Devansh\\AppData\\Local\\ms-playwright\\ffmpeg-1013\\ffmpeg-win64.exe';
    if (fs.existsSync(ffmpegPath)) {
      console.log('🎥 Transcoding to high-compatibility LinkedIn MP4 (H.264 / yuv420p)...');
      try {
        execSync(`"${ffmpegPath}" -y -i "${finalWebm}" -c:v libx264 -pix_fmt yuv420p -crf 20 -preset fast -movflags +faststart "${finalMp4}"`, { stdio: 'inherit' });
        console.log(`✅ MP4 generated: ${finalMp4} (${(fs.statSync(finalMp4).size / (1024 * 1024)).toFixed(2)} MB)`);
      } catch (err) {
        console.error('MP4 transcoding failed, WebM remains available:', err.message);
      }
    }
  } else {
    console.error('❌ Could not locate recorded video output.');
  }

  console.log('🎉 Motion graphics render complete!');
}

render().catch(err => {
  console.error('Fatal error during render:', err);
  process.exit(1);
});
