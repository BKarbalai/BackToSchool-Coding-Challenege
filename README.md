# Horizon — the focus-driven student OS

One loop runs the whole app: **plan → focus → land → review**.
Deadlines feed the calendar, the calendar feeds time-blocks, focused sprints become
flights, and every landing earns miles, unlocks airports, and shows up in travel
history. Built for Codédex's Back to School challenge.

Live demo: https://bkarbalai.github.io/BackToSchool-Coding-Challenege/

## 60-second tour (for judges)

1. **Grades** — drag a target slider, see exactly what each final requires.
2. **Deadlines** — tick one off, watch confetti + the panic meter relax.
3. **Calendar** — click a day, then time-block it in the day planner below.
4. **Study** — flip a flashcard, mark Got/Missed, filter Mistakes only.
5. **Focus** — start a sprint, take off; land to bank miles and a passport stamp.
6. Footer **Export JSON**, then **Import JSON** it back — full backup round-trip.

## Features

- Grade math engine (GPA 4.0 / %) with per-component sliders and insights
- Deadlines with live countdowns, urgency bars, notifications, `.ics` export
- Month calendar + agenda + hourly **day planner** with overlap layout
- Study planner, symbol-aware **flashcards** with wrong-count spaced review
- Finance tracker (income, budget, dues with one-click overdue posting, wishlist)
- Focus sprints, generative soundscapes, and a full **flight simulator**
  (Leaflet + offline canvas maps, departures board, travel history with route map)
- Notes with todos, reminders, trash, version history, `[[backlinks]]`
- Command palette (`Ctrl/⌘+K`, the only global hotkey), 10 themes incl. color-vision-safe sets
- Screen-reader announcements, dialog roles, `prefers-reduced-motion` support

## Run it

No build, no backend, no dependencies to install:

```bash
# option 1: just open it
open index.html
# option 2: serve it (needed for nothing — everything is static)
npx serve .
# option 3: run the checks
npm test
```

## Project structure

```text
index.html          page skeleton, all sections + modals
app.js              all logic, one IIFE, sectioned per tab (§8–§21)
js/data.js          static data only: courses, quotes, airports, planes,
                    cabins, photos, symbols, colors (read-only at runtime)
css/01-tokens.css   design tokens, reset, base
css/02-nav.css      header, nav, pill buttons
css/03-sections.css hero, grades, deadlines, focus
css/04-overlays.css modals, toasts, palette, mobile nav
css/05-themes.css   all 10 themes (dark default)
css/06-features.css quote, credits, notes, calendar, money
css/07-vintage.css  versioned feature layers + latest additions
tests/smoke.mjs     zero-dependency integrity suite (IDs, storage, hygiene)
```

## Data & privacy

Everything stays in your browser (`localStorage`, one key per tab —
`horizon_courses_v1`, `horizon_calendar_v1`, `horizon_flight_v1`, …).
A quota guard warns instead of silently dropping saves, and footer
**Export/Import JSON** round-trips the whole dataset across devices.

## Tech

Vanilla HTML + CSS + JavaScript. Leaflet (CDN, Esri tiles with an offline-safe
fallback) is the only runtime dependency; fonts degrade gracefully with
`display=swap`. Background map art is generated in-page on `<canvas>`.
