# GrindOS 🔥

**The operating system for interview prep.**

A structured DSA interview prep system with spaced repetition, streak tracking, a 20-week phased curriculum, and a global leaderboard. Built for engineers who are serious about landing the job.

🚀 **Live:** [leetcode-psi.vercel.app](https://leetcode-psi.vercel.app)

---

## Features

- **20-Week Phased Curriculum** — 140 days of structured DSA problems, from Arrays to System Design
- **Interview 150 Essentials Track** — curated subset of the most high-signal problems
- **Streak & Consistency Tracking** — daily solve streaks, heatmap, and completeddays counter
- **Interview Readiness Score** — dynamic odds formula based on progress, streak, and pace
- **Global Leaderboard** — anonymous opt-in rankings by problems solved, streak, and readiness %
- **Analytics Dashboard** — solve rate charts, difficulty breakdown, projected completion date
- **Daily Focus Timer** — Pomodoro-style session timer with tick sounds
- **Backup & Restore** — export/import full progress as JSON
- **100% Local-First** — all data stored in `localStorage`, no account required

---

## Stack

| Layer | Tech |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Charts | Recharts |
| Routing | React Router v7 |
| Leaderboard Backend | Supabase (optional) |
| Deployment | Vercel |

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## Leaderboard Setup (Optional)

The leaderboard requires a Supabase project. Without it, the app works fully — the leaderboard just shows "Not Configured".

**1. Create a free Supabase project** at [supabase.com](https://supabase.com)

**2. Run the schema** — paste `supabase/schema.sql` into your Supabase SQL Editor and run it

**3. Add env vars:**

```bash
# .env.local (gitignored)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...   # Legacy anon key from Project Settings → API
```

**4. Set the same vars in Vercel** → Project Settings → Environment Variables

---

## Project Structure

```
src/
├── config/          # App config, storage keys, Supabase client
├── context/         # ProgressContext — central state + localStorage persistence
├── components/      # UI components (Navbar, WeekAccordion, modals, etc.)
├── pages/           # Route-level pages (Landing, Dashboard, Curriculum, Analytics, Leaderboard)
├── hooks/           # useLeaderboard
├── data/            # 20-week curriculum plan data + stats
├── types/           # TypeScript interfaces
└── utils/           # Audio, helpers
```

---

## Data & Privacy

- All solve progress, streaks, and profile data live in **your browser's localStorage** under `go_*` keys
- The leaderboard is **opt-in only** — nothing is sent without your explicit action
- Leaderboard entries are anonymous by default; you can also toggle "Show as Anonymous"
- Opting out **permanently deletes** your row from the database

---

## Backup & Restore

Export your full progress as JSON anytime via **Settings → Download JSON**.  
Restore it on any device via **Settings → Restore JSON File**.

Format: `grindos_backup_<name>_<date>.json`

---

## License

MIT
