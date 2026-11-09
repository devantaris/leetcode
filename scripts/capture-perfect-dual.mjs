import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function capture() {
  const dir = path.resolve('demo-video/dual-assets');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  // Context for Modern UI (width: 940, height: 980)
  const mContext = await browser.newContext({
    viewport: { width: 940, height: 980 },
    deviceScaleFactor: 1.25,
  });
  const mPage = await mContext.newPage();

  console.log('1. Initializing Demo Mode for Modern UI...');
  await mPage.goto('http://localhost:5173');
  await sleep(1000);
  await mPage.click('button:has-text("Explore Demo")');
  await sleep(2000);

  // Modern Dashboard (Initial)
  console.log('Capturing Modern Dashboard (Initial)...');
  await mPage.goto('http://localhost:5173/dashboard');
  await sleep(1500);
  await mPage.screenshot({ path: path.join(dir, 'm-dash-1.png') });

  // Modern Dashboard: Click task complete
  console.log('Toggling problem on Modern Dashboard...');
  // Find problem row in TodayMission or Top150Card
  const problemRow = await mPage.$('div[class*="cursor-pointer"]:has(div:has(svg))');
  if (problemRow) {
    await problemRow.click();
    await sleep(1000);
  }
  console.log('Capturing Modern Dashboard (Solved)...');
  await mPage.screenshot({ path: path.join(dir, 'm-dash-2.png') });

  // Modern Curriculum
  console.log('Capturing Modern Curriculum...');
  await mPage.goto('http://localhost:5173/curriculum');
  await sleep(1500);
  const weekBtn = await mPage.$('button:has-text("Week 1"), button:has-text("Arrays")');
  if (weekBtn) { await weekBtn.click(); await sleep(500); }
  await mPage.screenshot({ path: path.join(dir, 'm-curriculum.png') });

  // Modern Analytics
  console.log('Capturing Modern Analytics...');
  await mPage.goto('http://localhost:5173/analytics');
  await sleep(1500);
  await mPage.screenshot({ path: path.join(dir, 'm-analytics.png') });

  // Modern Leaderboard
  console.log('Capturing Modern Leaderboard...');
  await mPage.goto('http://localhost:5173/leaderboard');
  await sleep(1500);
  await mPage.screenshot({ path: path.join(dir, 'm-leaderboard.png') });

  // Modern Tracker
  console.log('Capturing Modern Tracker...');
  await mPage.goto('http://localhost:5173/tracker');
  await sleep(1500);
  await mPage.screenshot({ path: path.join(dir, 'm-tracker.png') });

  // Context for Retro OS (width: 940, height: 980)
  console.log('2. Initializing Retro OS...');
  const osContext = await browser.newContext({
    viewport: { width: 940, height: 980 },
    deviceScaleFactor: 1.25,
  });
  const osPage = await osContext.newPage();
  await osPage.goto('http://localhost:5173');
  await osPage.evaluate(() => localStorage.setItem('grindos_demo_mode', 'true'));
  await osPage.goto('http://localhost:5173/os');
  await sleep(4500); // wait for boot to complete

  console.log('Capturing Retro Missions (Initial)...');
  await osPage.screenshot({ path: path.join(dir, 'os-dash-1.png') });

  // In Retro Missions, click first problem toggle
  console.log('Toggling problem in Retro Missions...');
  const retroCheck = await osPage.$('.os-window button, .os-window div[class*="cursor-pointer"], .os-window input');
  if (retroCheck) {
    await retroCheck.click();
    await sleep(800);
  }
  await osPage.screenshot({ path: path.join(dir, 'os-dash-2.png') });

  // Open SYLLABUS.EXE
  console.log('Opening SYLLABUS.EXE...');
  const sylIcon = await osPage.$('div:has-text("SYLLABUS.EXE")');
  if (sylIcon) { await sylIcon.dblclick(); await sleep(1200); }
  await osPage.screenshot({ path: path.join(dir, 'os-curriculum.png') });

  // Open STATS.EXE
  console.log('Opening STATS.EXE...');
  const statsIcon = await osPage.$('div:has-text("STATS.EXE")');
  if (statsIcon) { await statsIcon.dblclick(); await sleep(1200); }
  await osPage.screenshot({ path: path.join(dir, 'os-analytics.png') });

  // Open COHORT.EXE
  console.log('Opening COHORT.EXE...');
  const cohortIcon = await osPage.$('div:has-text("COHORT.EXE")');
  if (cohortIcon) { await cohortIcon.dblclick(); await sleep(1200); }
  await osPage.screenshot({ path: path.join(dir, 'os-leaderboard.png') });

  // Open PIPELINE.EXE
  console.log('Opening PIPELINE.EXE...');
  const pipeIcon = await osPage.$('div:has-text("PIPELINE.EXE")');
  if (pipeIcon) { await pipeIcon.dblclick(); await sleep(1200); }
  await osPage.screenshot({ path: path.join(dir, 'os-tracker.png') });

  console.log('🎉 All 12 side-by-side screens captured successfully!');
  await browser.close();
}

capture().catch(console.error);
