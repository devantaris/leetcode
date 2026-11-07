#!/usr/bin/env node
// GrindOS — Supabase Schema & Migration Verification Utility
// Run: node scripts/verify-supabase-schema.cjs

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://bjjfiycwhkghbibffmtr.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_LZEFz60xje4AKVpppwyIGQ_VO-kxcse';

const REQUIRED_TABLES = [
  { name: 'user_profiles', description: 'Candidate profiles, target dates & theme preferences' },
  { name: 'user_progress', description: 'Atomic problem solves, notes & bookmarks' },
  { name: 'placement_records', description: 'Job applications & interview round pipeline' },
  { name: 'leaderboard_entries', description: 'Opt-in global leaderboard rankings' },
  { name: 'focus_sessions', description: 'Pomodoro deep work sprint persistence' },
  { name: 'cohorts', description: 'Peer study groups & custom invite codes' },
  { name: 'cohort_members', description: 'Cohort membership rosters' },
  { name: 'admin_users', description: 'Stealth ops console RBAC' },
  { name: 'system_announcements', description: 'Admin broadcast notifications & banners' },
  { name: 'system_settings', description: 'Remote platform configuration toggles' }
];

async function verifySchema() {
  console.log('===============================================================');
  console.log('GRINDOS — SUPABASE CLOUD SCHEMA VERIFICATION');
  console.log('Target URL:', SUPABASE_URL);
  console.log('===============================================================\n');

  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

  let activeCount = 0;
  let missingCount = 0;

  for (const table of REQUIRED_TABLES) {
    try {
      const { error } = await sb.from(table.name).select('*').limit(1);

      if (!error) {
        console.log(`  [READY]              ${table.name.padEnd(22)} ${table.description}`);
        activeCount++;
      } else if (error.code === 'PGRST205' || error.message.includes('Could not find')) {
        console.log(`  [PENDING MIGRATION]  ${table.name.padEnd(22)} ${table.description}`);
        missingCount++;
      } else if (error.code === 'PGRST301' || error.message.includes('permission denied')) {
        console.log(`  [LOCKED / RLS]       ${table.name.padEnd(22)} (Protected by RLS policies)`);
        activeCount++;
      } else {
        console.log(`  [STATUS: ${error.code}]     ${table.name.padEnd(22)} ${error.message}`);
      }
    } catch (err) {
      console.log(`  [QUERY FAILED]       ${table.name.padEnd(22)} ${err.message}`);
      missingCount++;
    }
  }

  console.log('\n---------------------------------------------------------------');
  console.log(`Summary: ${activeCount} active, ${missingCount} pending migration.`);
  console.log('---------------------------------------------------------------');

  if (missingCount > 0) {
    console.log('\nACTION REQUIRED:');
    console.log('1. Open your Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Navigate to SQL Editor.');
    console.log('3. Copy contents of "supabase/schema.sql" and click RUN.');
    console.log('4. Re-run: node scripts/verify-supabase-schema.cjs\n');
  } else {
    console.log('\nAll required SaaS tables are active and provisioned!\n');
  }
}

verifySchema().catch(console.error);
