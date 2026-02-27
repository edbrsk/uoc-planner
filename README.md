# 📚 UOC Planner

![Weekly planner view](demo/uoc_planner.gif)

A weekly planner for [UOC](https://www.uoc.edu) (Universitat Oberta de Catalunya) students. Visualize your courses, deadlines, and weekly tasks in a modern interface with a full semester roadmap.

Developed by Edgar [@edbrsk](https://github.com/edbrsk/)

## ✨ Features

- 📅 **Weekly planning** — Tasks organized by week and course
- 📊 **Visual roadmap** — Swimlane timeline of all semester deliverables
- 🔥 **Real-time sync** — Firebase-backed, works across devices
- 💾 **Offline mode** — Works without an account using browser localStorage
- 🔒 **Self-hosted data** — Each user connects their own Firebase project
- ⚡ **Upcoming deadline highlights** — Deliverables due within 15 days are flagged
- ⬆️ **JSON import** — Paste LLM-generated planning data directly into the app
- ⬇️ **JSON export** — Export your modified data to share or back up
- 📲 **Installable PWA** — Add to home screen on iOS and Android for a native app experience
- 🖨️ **Print-ready** — Optimized layout for printing
- 📱 **Responsive** — Works on desktop and mobile

---

## 📲 Install as App

UOC Planner is a Progressive Web App (PWA) — you can install it on your phone for a native app look and feel, no app store needed.

### iOS (Safari)
1. Open the app in **Safari**
2. Tap the **Share** button (⬆️)
3. Select **"Add to Home Screen"**
4. Tap **"Add"**

### Android (Chrome)
1. Open the app in **Chrome**
2. Tap the **three-dot menu** (⋮)
3. Select **"Add to Home Screen"** or **"Install App"**
4. Tap **"Install"**

The app will appear on your home screen with its own icon and launch in full-screen mode, just like a native app.

---

## 🎮 Quick Demo (no setup required)

Want to try the app without any configuration?

1. Open the app and click **💾 Usar sin cuenta (offline)**
2. Click your profile avatar (top-right) → **⬆️ Importar JSON**
3. Copy the contents of [`demo/uoc_planner_2025-2.json`](demo/uoc_planner_2025-2.json) and paste it
4. Click **Validar JSON** → **Importar semestre**
5. Explore the full app with 18 weeks, 5 courses, and 30+ deadlines!

---

## 🚀 Setup

### Option 1: Offline mode (no account)

Just click **💾 Usar sin cuenta (offline)** on the login screen. Your data is stored in the browser's localStorage — no Firebase, no Google account needed.

### Option 2: Firebase (cloud sync)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (free **Spark** plan)
3. Add a **Web app** and copy the `firebaseConfig` object
4. Enable **Authentication → Google** as a sign-in provider
5. Create a **Firestore Database** in test mode
6. On the setup screen, paste your `firebaseConfig` JSON

### Running locally

```bash
git clone https://github.com/edbrsk/uoc-planner.git
cd uoc-planner
npm install
npm run dev
```

---

## 📊 Generating Your Data with AI

The power of UOC Planner is that an LLM (Claude, ChatGPT, etc.) can automatically generate your entire weekly plan by analyzing your virtual campus.

### Recommended: Claude + Canvas LMS MCP

1. **Install the Canvas MCP server** — [mcp-canvas-lms](https://github.com/DMontgomery40/mcp-canvas-lms)
2. **Generate an access token** from your campus:
   - Navigate to [aula.uoc.edu/profile/settings](https://aula.uoc.edu/profile/settings)
   - Find the **"Approved Integrations"** section
   - Generate a new access token
3. **Configure the MCP** in Claude Desktop with your token and Canvas base URL
4. **Use the prompt below** to generate your planning data

### Alternative: without the MCP

If you don't have the Canvas MCP, you can manually copy the syllabus, calendar, and deliverable schedule from each course in your virtual campus, then paste it into a chat with your preferred LLM alongside the prompt and JSON schema below.

### Prompt

>  You have access to my Canvas LMS courses for the current semester using the mcp-canvas-lms.
>  Build a comprehensive weekly study plan following ALL the rules below exactly.
>
>  STEP 1 — COURSE DISCOVERY:
>
>  • Use canvas_list_courses to find all active courses for the current semester term.
>    Ignore any courses from previous terms (check enrollment_term_id).
>  • For each active course, call canvas_list_assignments and capture for every assignment:
>    name, due_at, unlock_at, html_url, submission_types, points_possible.
>
>
>  STEP 2 — TIMEZONE CONVERSION (CRITICAL):
>
>  Canvas stores all timestamps in UTC. My timezone is Spain:
>    • CET  = UTC+1  → applies before the last Sunday of March
>    • CEST = UTC+2  → applies from the last Sunday of March onward
>    For 2026: CET before March 29; CEST from March 29 onward.
>
>  Convert EVERY unlock_at and due_at to Spain local time before using them > anywhere.
>  Key rule: an unlock_at of 23:00 UTC on day D becomes 00:00 local time on > day D+1.
>    → Display as "abre D+1 mmm", never "abre D mmm".
>  Example: unlock_at 2026-03-19T23:00:00Z → 2026-03-20 00:00 CET → "abre 20 mar"
>
>
>  STEP 3 — UNLOCK-DATE RULE:
>
>  • Never schedule a task to start working on an assignment before its unlock_at
>    (converted to Spain local time).
>  • For weeks before unlock: use study/reading preparation tasks instead, with
>    "(preparacion NombreTarea, abre DD mmm)" in the task text.
>  • If an assignment unlocks mid-week: it may appear in that week with "(abre DD mmm)".
>
>  STEP 4 — TASK GRANULARITY (CRITICAL):
>
>  • ONE task per deliverable per week. Never merge multiple separate deliverables
>    into a single task.
>    ✗ WRONG: "Hacer Q1, Q2, Q3 y empezar R1 (vencen 13 mar)"
>    ✓ RIGHT: Three separate tasks — Q1 in week 1, Q2 in week 2, Q3 in week 3
>
>  • For courses with weekly cuestionarios (e.g., AL), place exactly ONE cuestionario
>    per week following the course's intended weekly schedule, even if they all share
>    the same final deadline.
>
>  • Reading/study tasks must also be split per chapter or unit, one per week,
>    mirroring the course's own weekly structure.
>
>  • For each Reto in AL: create separate tasks for (1) reading/preparation,
>    (2) Preparar Reto, (3) Entregar Reto, and (4) Subir Video — each in its own week.
>
>
>  STEP 5 — VIDEO SUBMISSION TASKS:
>
>  • Video submissions have very short unlock windows (3–5 days).
>    Place video tasks ONLY in the week they actually unlock — never earlier.
>  • Task text format: "Subir Video Reto 1 (abre 20 mar, entrega: 23 mar)"
>  • Set "urgent": true for video deadlines with ≤ 3 days window.
>
>
>  STEP 6 — COMBINED TASK RULE:
>
>  When a deadline and the start of the next assignment fall in the same week but the
>  new assignment is still locked: create two separate entries — one for the delivery,
>  one for study/preparation. Never write "Entregar X. Empezar Y" if Y is not yet unlocked.
>
>
>  STEP 7 — WEEK-BY-WEEK PLAN:
>
>  • Cover all active courses simultaneously, interleaved by urgency and workload.
>  • Each week: 3–8 tasks across multiple courses.
>  • Within each week, order tasks by priority (most urgent / closest deadline first).
>  • Use these course abbreviations exactly: AL, Prob, Prog, Redes, Lab
>    (not "LabPyR" or any other variant).
>
>
>  STEP 8 — CANVAS URLs:
>
>  • For every task that maps to a specific Canvas assignment, include:
>    "url": <html_url from canvas_get_assignment>
>  • For generic study/preparation tasks with no direct Canvas assignment,
>    omit the "url" field entirely. Do not include null or empty strings.
>
>
>  STEP 9 — NOTES AND taskId (CRITICAL):
>
>  The "tasks" array is 0-indexed. The taskId in each note must be "task_N" where N
>  is the 0-BASED position of that task in the tasks array.
>    → tasks[0] = "task_0", tasks[1] = "task_1", tasks[38] = "task_38", etc.
>
>  NEVER use an empty string "", null, or undefined for taskId.
>  Every note must be linked to a specific task — for general/calendar notes, choose
>  the most relevant task (e.g., the delivery task it warns about).
>
>  Before writing the final JSON: verify each note's taskId by counting the 0-based
>  position of the intended task in the tasks array and confirm the text at that
>  index matches your intent.
>
>  STEP 10 — SELF-VERIFICATION BEFORE OUTPUT:
>
>  Before writing the final JSON, run these checks:
>  1. All unlock_at dates have been converted to Spain local time (CET/CEST).
>  2. No task appears in a week before its unlock date.
>  3. No week has merged cuestionarios that should be separate weekly tasks.
>  4. Every note's taskId resolves to tasks[N] where tasks[N].text matches
>     what the note is referring to.
>  5. No taskId uses "", null, or a non-existent index.
>
>  
>  OUTPUT SCHEMA (exact — do not deviate):
>
>  {
>    "semester": {
>      "name": "2025-2",
>      "label": "Semestre 2025-2",
>      "startDate": "2026-02-17",
>      "endDate": "2026-06-22"
>    },
>    "weeks": {
>      "1": { "dates": "17 feb – 23 feb", "title": "Arranque del semestre" }
>    },
>    "tasks": [
>      {
>        "weekNum": 1,
>        "course": "AL",
>        "text": "Hacer Cuestionario 1 (Q1) — entrega: 13 mar",
>        "order": 0,
>        "done": false,
>        "url": "https://aula.uoc.edu/courses/..."
>      }
>    ],
>    "deadlines": [
>      {
>        "date": "2026-03-13",
>        "label": "AL — Reto 1 + Q1+Q2+Q3",
>        "course": "AL",
>        "urgent": false,
>        "order": 0
>      }
>    ],
>    "notes": [
>      {
>        "taskId": "task_3",
>        "text": "Note text — taskId is the 0-based index of the task in the tasks array."
>      }
>    ]
>  }
>
>  Additional output rules:
>  • All dates in YYYY-MM-DD format.
>  • "urgent": true only for deliverables with ≤ 3 days between unlock and due date.
>  • "done": false for all tasks.
>  • tasks array ordered chronologically (weekNum ASC, then order ASC within each week).
>  • Output only the raw JSON — no markdown code fences, no explanations.

---

## ⬆️ Import & ⬇️ Export

Both features are accessible from the **profile menu** (click your avatar in the top-right corner).

### Importing JSON

1. Click your profile avatar → **⬆️ Importar JSON**
2. Paste the complete JSON (from an LLM, an export, or the demo file)
3. Click **Validar JSON** — a preview shows courses, task count, and deadline count
4. Click **Importar semestre**

### Exporting JSON

1. Click your profile avatar → **⬇️ Exportar JSON**
2. A `.json` file downloads with the exact same schema used for import
3. Share it, back it up, or re-import it later

This means you can: generate data with AI → import → modify in the app → export → share with classmates.

---

## 📋 JSON Schema Reference

| Field | Type | Description |
|-------|------|-------------|
| `semester.name` | `string` | Unique identifier (e.g., `"2025-2"`) |
| `semester.label` | `string` | Display name (e.g., `"Semester 2025-2"`) |
| `semester.startDate` | `string` | Start date in `YYYY-MM-DD` format |
| `semester.endDate` | `string` | End date in `YYYY-MM-DD` format |
| `weeks.N.dates` | `string` | Human-readable date range (e.g., `"Feb 17 – 23"`) |
| `weeks.N.title` | `string` | Week summary / theme |
| `tasks[].weekNum` | `number` | Week number (1, 2, 3...) |
| `tasks[].course` | `string` | Course abbreviation (e.g., `"AL"`) |
| `tasks[].text` | `string` | Task description |
| `tasks[].order` | `number` | Sort order within the week (0, 1, 2...) |
| `tasks[].done` | `boolean` | Completion status — default `false` |
| `tasks[].url` | `string` _(optional)_ | Direct Canvas URL to the assignment/quiz (`html_url` from Canvas API) |
| `deadlines[].date` | `string` | Due date in `YYYY-MM-DD` format |
| `deadlines[].label` | `string` | Deliverable description |
| `deadlines[].course` | `string` | Course abbreviation |
| `deadlines[].urgent` | `boolean` | `true` for extremely short submission windows |
| `deadlines[].order` | `number` | Display order |
| `notes[].taskId` | `string` | ID of the task this note belongs to (optional on import if mapped during generation) |
| `notes[].text` | `string` | The note content |

---

## 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI components |
| Vite 6 | Build tool + dev server |
| TailwindCSS v4 | Styling |
| Firebase Firestore | Real-time database (optional) |
| Firebase Auth | Google sign-in (optional) |
| localStorage | Offline data storage |
| GitHub Pages | Deployment |

## 📦 Deployment

The app deploys automatically to GitHub Pages via GitHub Actions on every push to `main`. See [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## 🛠️ Development

```bash
npm run dev      # Dev server (http://localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build
```

## 📁 Project Structure

```
├── demo/
│   └── uoc_planner_2025-2.json   # Demo data for quick testing
src/
├── App.jsx                        # Main application component
├── main.jsx                       # Entry point
├── index.css                      # Global styles + Tailwind
├── lib/
│   ├── firebase.js                # Dynamic Firebase initialization
│   ├── constants.js               # Colors, date helpers
│   └── store.js                   # Offline localStorage data layer
├── hooks/
│   ├── useAuth.js                 # Authentication (Firebase + offline)
│   ├── useSemesters.js            # Semester CRUD (Firebase + offline)
│   ├── useTasks.js                # Task CRUD (Firebase + offline)
│   └── useDeadlines.js            # Deadline CRUD (Firebase + offline)
└── components/
    ├── AuthScreen.jsx             # Login screen (Google + offline)
    ├── SetupScreen.jsx            # Firebase / offline mode selection
    ├── Header.jsx                 # Header + profile dropdown
    ├── CoursePills.jsx            # Course filter pills
    ├── WeekCard.jsx               # Collapsible week card
    ├── TaskItem.jsx               # Individual task item
    ├── DeadlinesSection.jsx       # Deadline table
    ├── RoadmapView.jsx            # Swimlane roadmap
    ├── ImportModal.jsx            # JSON import modal
    ├── Modal.jsx                  # Reusable modal shell
    ├── TaskModal.jsx              # Task form
    ├── DeadlineModal.jsx          # Deadline form
    ├── SemesterModal.jsx          # Semester + week forms
    └── Toast.jsx                  # Toast notifications
```

## 📄 License

MIT
