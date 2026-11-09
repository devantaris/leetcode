import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function captureDualEngine() {
  const dir = path.resolve('demo-video/dual-assets');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  // Modern UI context (approx 940x980 viewport)
  const modernContext = await browser.newContext({
    viewport: { width: 940, height: 980 },
    deviceScaleFactor: 1,
  });
  const mPage = await modernContext.newPage();

  console.log('1. Setting up Modern UI Demo Mode...');
  await mPage.goto('http://localhost:5173');
  await sleep(1000);
  await mPage.click('button:has-text("Explore Demo")');
  await sleep(2000);

  // Modern Dashboard (Initial)
  console.log('Capturing Modern Dashboard...');
  await mPage.goto('http://localhost:5173/dashboard');
  await sleep(1500);
  await mPage.screenshot({ path: path.join(dir, 'm-dashboard-initial.png') });

  // Modern Dashboard: Click a problem complete!
  console.log('Clicking task complete on Modern Dashboard...');
  // Find a problem checkbox in Today's Mission or CatchUp
  const checkbox = await mPage.$('button[role="checkbox"], input[type="checkbox"], div[class*="cursor-pointer"]:has(svg)');
  if (checkbox) {
    await checkbox.click();
    await sleep(1200);
  }
  await mPage.screenshot({ path: path.join(dir, 'm-dashboard-solved.png') });

  // Modern Curriculum
  console.log('Capturing Modern Curriculum...');
  await mPage.goto('http://localhost:5173/curriculum');
  await sleep(1500);
  // Expand first accordion
  const acc = await mPage.$('button:has-text("Week 1"), button:has-text("Day 1")');
  if (acc) { await acc.click(); await sleep(500); }
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

  // Modern Tracker (Offer Pipeline)
  console.log('Capturing Modern Tracker...');
  await mPage.goto('http://localhost:5173/tracker');
  await sleep(1500);
  await mPage.screenshot({ path: path.join(dir, 'm-tracker.png') });

  // Now capture Retro OS windows
  console.log('2. Setting up Retro OS...');
  const osContext = await browser.newContext({
    viewport: { width: 940, height: 980 },
    deviceScaleFactor: 1,
  });
  const osPage = await osContext.newPage();
  
  // Set demo mode in localStorage
  await osPage.goto('http://localhost:5173');
  await osPage.evaluate(() => localStorage.setItem('grindos_demo_mode', 'true'));
  await osPage.goto('http://localhost:5173/os');
  
  // Wait for boot screen to finish (3-4 seconds)
  await sleep(4500);
  console.log('Capturing Retro Missions (Initial)...');
  await osPage.screenshot({ path: path.join(dir, 'os-missions-initial.png') });

  // Double click SYLLABUS.EXE icon
  console.log('Opening SYLLABUS.EXE in Retro OS...');
  const syllabusIcon = await osPage.$('div:has-text("SYLLABUS.EXE")');
  if (syllabusIcon) {
    await syllabusIcon.dblclick();
    await sleep(1000);
  }
  await osPage.screenshot({ path: path.join(dir, 'os-syllabus.png') });

  // Double click STATS.EXE icon
  console.log('Opening STATS.EXE in Retro OS...');
  const statsIcon = await osPage.$('div:has-text("STATS.EXE")');
  if (statsIcon) {
    await statsIcon.dblclick();
    await sleep(1000);
  }
  await osPage.screenshot({ path: path.join(dir, 'os-stats.png') });

  // Double click COHORT.EXE icon
  console.log('Opening COHORT.EXE in Retro OS...');
  const cohortIcon = await osPage.$('div:has-text("COHORT.EXE")');
  if (cohortIcon) {
    await cohortIcon.dblclick();
    await sleep(1000);
  }
  await osPage.screenshot({ path: path.join(dir, 'os-cohort.png') });

  // Double click PIPELINE.EXE icon
  console.log('Opening PIPELINE.EXE in Retro OS...');
  const pipelineIcon = await osPage.$('div:has-text("PIPELINE.EXE")');
  if (pipelineIcon) {
    await pipelineIcon.dblclick();
    await sleep(1000);
  }
  await osPage.screenshot({ path: path.join(dir, 'os-pipeline.png') });

  console.log('✅ All dual-engine assets captured in demo-video/dual-assets!');
  await browser.close();
}

captureDualEngine().catch(console.error);
