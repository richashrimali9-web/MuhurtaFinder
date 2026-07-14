# Astro Event Planner — Application Flow & Purpose

**Product name:** Astro Event Planner  
**Package name:** `astro-event-planner`  
**Live site:** [https://astroeventplanner.com](https://astroeventplanner.com)  
**Repository:** [github.com/richashrimali9-web/MuhurtaFinder](https://github.com/richashrimali9-web/MuhurtaFinder)

---

## 1. Serving Purpose

Astro Event Planner is a **client-side web application** that helps users plan life events using **Vedic astrology (Panchang) principles**. It answers one core question:

> *When is an auspicious date and time for my event?*

The app serves four audiences and use cases:

| Audience | Need | How the app serves it |
|----------|------|------------------------|
| **Event planners** (weddings, griha pravesh, business openings) | Find good dates across a month | **Event Planner** — scores every day in a month by event type |
| **Daily users** | Check today's Panchang | **Daily Panchang** — full almanac with share/export |
| **Quick decision makers** | Is *right now* a good time? | **Choghadiya** — 8 day + 8 night planetary time windows |
| **Returning users** | Personal relevance + reminders | **Personalized Muhurta**, **Countdown**, browser notifications |

**Design principles today:**
- **No backend** — all calculations run in the browser
- **Privacy-first** — user profile stored in `localStorage` only
- **India-focused** — 12 preset cities, IST timezone for astronomical times
- **Growth loop** — share cards, PDF, calendar export, social sharing on Daily Panchang

**Disclaimer (as shown in the app):** Guidance based on classical Vedic astrology. Users should consult a qualified astrologer for major decisions.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                            │
│  index.html → main.tsx → App.tsx (view router via useState)     │
└────────────────────────────┬────────────────────────────────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     │                       │                       │
     ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────────┐    ┌──────────────────┐
│ 6 Feature   │    │ Calculation     │    │ Share & Export   │
│ Views       │───▶│ Layer (utils/)  │    │ (client-side)    │
└─────────────┘    └────────┬────────┘    └──────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        mhah-panchang   suncalc      choghadiyaData
        (Tithi, etc.)   (moon times)  (day/night periods)
```

### Tech stack

| Layer | Technology |
|-------|------------|
| UI framework | React 18 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS + Radix UI primitives |
| Panchang engine | `mhah-panchang` v1.2.0 |
| Moon times | `suncalc` v1.9.0 |
| PDF export | `jspdf` |
| Share card images | `html-to-image`, `html2canvas` |
| Hosting | GitHub Pages (`CNAME` → astroeventplanner.com) |
| CI/CD | `.github/workflows/deploy.yml` on push to `main` |

---

## 3. Application Entry & Shell

### Boot sequence

```
index.html
  └── main.tsx
        ├── imports index.css + globals.css
        └── createRoot(#root).render(<App />)
```

### App shell (`src/App.tsx`)

The shell provides:
- **Sticky header** with logo, title, and navigation
- **View switching** via `useState<View>` — no URL routing (no deep links per view)
- **Responsive nav** — desktop button row; mobile hamburger menu
- **Footer** — about, features list, disclaimer

### Six views (navigation)

| View ID | Nav label | Component | Default |
|---------|-----------|-----------|---------|
| `finder` | Event Planner | `MuhurtaFinder.tsx` | **Yes** (landing view) |
| `panchang` | Daily Panchang | `PanchangDisplay.tsx` | |
| `choghadiya` | Choghadiya | `ChoghadiyaViewer.tsx` | |
| `personalized` | Personalized | `PersonalizedMuhurta.tsx` | |
| `countdown` | Countdown | `CountdownTimer.tsx` | |
| `knowledge` | Knowledge Base | `KnowledgeBase.tsx` | |

---

## 4. Supported Locations

All location-aware features use the same **12 preset Indian cities** (hardcoded in each component):

| City | Latitude | Longitude |
|------|----------|-----------|
| Delhi | 28.6139 | 77.2090 |
| Mumbai | 19.0760 | 72.8777 |
| Bangalore | 12.9716 | 77.5946 |
| Chennai | 13.0827 | 80.2707 |
| Kolkata | 22.5726 | 88.3639 |
| Hyderabad | 17.3850 | 78.4867 |
| Pune | 18.5204 | 73.8567 |
| Ahmedabad | 23.0225 | 72.5714 |
| Jaipur | 26.9124 | 75.7873 |
| Lucknow | 26.8467 | 80.9462 |
| Jodhpur | 26.2389 | 73.0243 |
| Pali | 25.7725 | 73.3234 |

Default city: **Delhi**.

---

## 5. Core Calculation Engine

All astronomical logic lives in `src/utils/panchangData.ts`. Every feature view calls `calculatePanchang(date, cityName, lat, lon)`.

### 5.1 `calculatePanchang()` flow

```
Input: date, location name, lat, lon
         │
         ▼
┌────────────────────────────┐
│ Normalize date to UTC      │
│ midnight (YYYY-MM-DD)      │
└────────────┬───────────────┘
             ▼
┌────────────────────────────┐
│ mhah-panchang.sunTimer()   │──▶ sunrise, sunset (formatISTHM → HH:MM IST)
└────────────┬───────────────┘
             ▼
┌────────────────────────────┐
│ Sample every 30 min        │
│ midnight → midnight        │
│ panchang.calendar()        │──▶ collect all Tithi, Nakshatra, Yoga, Karana
└────────────┬───────────────┘
             ▼
┌────────────────────────────┐
│ findTransitionTime()       │──▶ binary search for element change times
│ (per element type)         │
└────────────┬───────────────┘
             ▼
┌────────────────────────────┐
│ SunCalc.getMoonTimes()     │──▶ moonrise, moonset (IST day window filter)
│ prev UTC day + current     │
└────────────┬───────────────┘
             ▼
┌────────────────────────────┐
│ Compute muhurta periods    │──▶ Brahma, Abhijit, Rahu Kaal, Gulikai,
│ from sunrise/sunset        │     Yamagandam (weekday-based)
└────────────┬───────────────┘
             ▼
┌────────────────────────────┐
│ qualityScore (0–100)       │──▶ isAuspicious boolean
│ moonSign, sunSign, masa    │
└────────────┬───────────────┘
             ▼
Output: PanchangData object
```

### 5.2 Key data shape (`PanchangData`)

| Field | Description |
|-------|-------------|
| `tithis`, `nakshatras`, `yogas`, `karanas` | Arrays with `name`, `startTime`, `endTime` |
| `sunrise`, `sunset`, `moonrise`, `moonset` | `"HH:MM"` strings in IST |
| `paksha`, `masa` | Lunar fortnight and month |
| `auspiciousPeriods` / `inauspiciousPeriods` | Named time windows |
| `qualityScore` | Base auspiciousness 0–100 |
| `moonSign`, `sunSign` | Zodiac positions |

### 5.3 Time formatting

All displayed astronomical times use `formatISTHM()` — 24-hour `HH:MM` in `Asia/Kolkata`, independent of the user's system timezone.

### 5.4 Event scoring (`getMuhurtaForEvent`)

Ten event types each apply **bonus/penalty rules** on top of `qualityScore`:

| Event type | Value key | Examples of rules |
|------------|-----------|-------------------|
| Marriage / Wedding | `marriage` | Bonus for Rohini, Uttara Phalguni, etc. |
| Griha Pravesh | `housewarming` | Favorable nakshatras for home entry |
| Business Opening | `business` | Weekday and tithi preferences |
| Travel / Journey | `travel` | Char tithi, movement-friendly nakshatras |
| Namakaran | `naming` | Child ceremony preferences |
| Education | `education` | Learning-friendly periods |
| Vehicle Purchase | `vehicle` | Travel/char-related bonuses |
| Investment | `investment` | Financial activity windows |
| Medical / Surgery | `medical` | Avoid inauspicious yogas |
| Religious Ceremony | `ceremony` | General auspiciousness |

`getQualityBreakdown()` returns factor-by-factor scoring for UI tooltips and expanded cards.

### 5.5 Choghadiya (`src/utils/choghadiyaData.ts`)

```
calculateChoghadiya(date, sunrise, sunset)
  ├── Divide daytime into 8 equal periods (lord-based weekday rotation)
  └── Divide nighttime into 8 equal periods (separate night sequence)
```

Period types: **Amrit, Shubh, Labh, Char** (auspicious) vs **Rog, Kaal, Udveg** (inauspicious).

`getCurrentChoghadiya()` highlights the active period based on current clock time.

### 5.6 Time slots (`src/utils/timeslots.ts`)

`generateTimeSlots()` creates hourly windows between sunrise and sunset for Event Planner cards, scoring each slot by tithi/nakshatra preferences. Supports `.ics` export per slot.

---

## 6. Feature View Flows

### 6.1 Event Planner (`MuhurtaFinder.tsx`)

**Purpose:** Find the best dates in a selected month for a specific life event.

```
User selects: event type + city + month/year
         │
         ▼
For each day in month (batched ×10, 50ms delay between batches):
  calculatePanchang(date, city, lat, lon)
  getMuhurtaForEvent(eventType, panchang) → score
         │
         ▼
Apply filters: min score, exclude weekends, tithi/nakshatra (if set)
         │
         ▼
Sort by date OR quality score
         │
         ▼
Render date cards with:
  - Quality score badge
  - Tithi, Nakshatra summary
  - Expand → time slots (generateTimeSlots)
  - Share card image (BeautifulShareCard)
  - Download ICS calendar entry
  - Copy slot details
```

**Filters available:** exclude weekends, minimum score (default 60), sort by date/quality.

---

### 6.2 Daily Panchang (`PanchangDisplay.tsx`)

**Purpose:** Full daily almanac — the primary daily habit and viral growth feature.

```
User selects: date + city (3-column header)
  ├── Column 1: Location dropdown + date + masa/paksha
  ├── Column 2: Prev / Today / Next navigation
  └── Column 3: Sunrise, Sunset, Moonrise, Moonset tiles
         │
         ▼
calculatePanchang(selectedDate, city, lat, lon)
         │
         ▼
Display sections:
  ├── Festival banner (if applicable)
  ├── Auspiciousness score (circular) + Do's/Don'ts (side-by-side on md+)
  ├── Panchang elements (Tithi, Nakshatra, Yoga, Karana) with transitions
  ├── Muhurta periods (Brahma, Abhijit, Rahu Kaal, etc.)
  ├── Shareable card preview (BeautifulShareCard)
  └── Share & Export panel
```

**Share & export options** (`src/utils/shareAndExport.ts`, `src/utils/cardShare.ts`):

| Action | Method |
|--------|--------|
| WhatsApp | Pre-filled `wa.me` link |
| Twitter/X | Tweet intent URL |
| Facebook | Share dialog |
| Web Share API | Native mobile share (with fallback) |
| PDF download | `jspdf` client-side generation |
| Calendar (.ics) | RFC 5545 iCalendar file |
| Share card image | `html-to-image` → social platforms |

---

### 6.3 Choghadiya (`ChoghadiyaViewer.tsx`)

**Purpose:** Quick daily timing — which planetary period is active now.

```
User selects: date + city
         │
         ▼
calculatePanchang() → sunrise, sunset
calculateChoghadiya(date, sunrise, sunset)
         │
         ▼
Display:
  ├── Current active Choghadiya (live, updates every minute)
  ├── Day periods (8) — expandable with activity recommendations
  └── Night periods (8) — toggle show/hide
```

---

### 6.4 Personalized Muhurta (`PersonalizedMuhurta.tsx`)

**Purpose:** Dates tailored to a saved user profile.

```
User creates profile: name, birth date, birth time, birth place
         │
         ▼
Save to localStorage key: "muhurtaProfile"
Moon sign derived from calculatePanchang(birthDate, birthPlace)
         │
         ▼
Scan next 90 days:
  base score = panchang.qualityScore
  +15 if moon sign matches profile moon sign
  +10 if calendar day matches birth day of month
  Keep dates with score ≥ 75
         │
         ▼
Show top 10 dates sorted by score
```

**Note:** This is simplified personalization (moon sign + birth day), not a full birth chart (lagna, dasha, etc.).

---

### 6.5 Countdown (`CountdownTimer.tsx`)

**Purpose:** Count down to the next auspicious date; optional browser reminders.

```
User selects: event type + city
         │
         ▼
Scan up to 365 days ahead for first date with score ≥ 80
         │
         ▼
Display: live countdown (days/hours/minutes/seconds)
         │
         ▼
Also find next 5 upcoming muhurtas (score ≥ 75)
         │
         ▼
Optional: enable browser notifications
  - Stored in localStorage: "muhurta-notifications-enabled"
  - Schedules: 1 day before + 1 hour before (setTimeout-based)
  - Requires Notification API permission
```

See `src/docs/BROWSER_NOTIFICATIONS.md` for notification limitations.

---

### 6.6 Knowledge Base (`KnowledgeBase.tsx`)

**Purpose:** Static educational content — no calculations.

```
Tabs:
  ├── Articles (What is Muhurta, Panchang, Tithi, Nakshatra, etc.)
  └── FAQ (accordion)
```

Pure content; helps SEO, trust, and user education.

---

## 7. Share Card System

Reusable card components in `src/components/ShareableCard/`:

| Component | Role |
|-----------|------|
| `BeautifulShareCard.tsx` | Primary branded share image |
| `BaseShareCard.tsx` | Layout foundation |
| `CardHeader.tsx` / `CardFooter.tsx` | Branding + website URL |
| `SmallShareCard.tsx` | Compact variant |
| `HeaderIcons.tsx` | Social action icons |

Image generation: `src/utils/cardGenerator.ts` and `src/utils/cardShare.ts` use `html-to-image` to rasterize DOM cards into PNG blobs for download or social share.

---

## 8. Data & Persistence

| Data | Storage | Key |
|------|---------|-----|
| User birth profile | `localStorage` | `muhurtaProfile` |
| Notification preference | `localStorage` | `muhurta-notifications-enabled` |
| Panchang calculations | In-memory only | — |
| Server/database | None | — |

All Panchang data is computed on demand; there is no API layer or caching layer today.

---

## 9. Build & Deployment Flow

### Local development

```bash
npm install
npm run dev        # http://localhost:3000
```

### Production build

```bash
npm run build      # vite build → build/ + fix-html.js post-process
```

`fix-html.js` strips module attributes from script tags for GitHub Pages compatibility.

### CI/CD (GitHub Actions)

```
Push to main / master / Fixes
         │
         ▼
.github/workflows/deploy.yml
  ├── npm ci
  ├── npm run build
  ├── cp CNAME build/
  ├── echo "" > build/.nojekyll
  └── deploy-pages artifact
         │
         ▼
GitHub Pages → astroeventplanner.com (CNAME)
```

Vite config: `base: './'` (relative paths for static hosting), single IIFE bundle output.

---

## 10. End-to-End User Journeys

### Journey A — Plan a wedding month

```
Land on Event Planner
  → Select "Marriage"
  → Choose city (e.g. Jodhpur)
  → Pick month/year
  → Review scored date cards
  → Expand best date → see time slots
  → Share card or add to calendar
```

### Journey B — Daily Panchang habit

```
Open Daily Panchang
  → See today's header (sun/moon times)
  → Check auspiciousness score
  → Share to WhatsApp family group
  → Download PDF for records
```

### Journey C — Quick "is now good?" check

```
Open Choghadiya
  → See current period highlighted
  → Read activity recommendations
  → Decide go / wait
```

### Journey D — Personal profile + reminder

```
Create profile in Personalized
  → See top 10 personal dates
  → Switch to Countdown
  → Enable notifications for next muhurta
```

---

## 11. File Map (Key Source Files)

```
src/
├── main.tsx                    # App bootstrap
├── App.tsx                     # Shell + view router
├── components/
│   ├── MuhurtaFinder.tsx       # Event Planner
│   ├── PanchangDisplay.tsx     # Daily Panchang
│   ├── ChoghadiyaViewer.tsx    # Choghadiya
│   ├── PersonalizedMuhurta.tsx   # Personalized dates
│   ├── CountdownTimer.tsx      # Countdown + notifications
│   ├── KnowledgeBase.tsx       # Education / FAQ
│   ├── ShareableCard/          # Share image components
│   └── ui/                     # Radix + Tailwind primitives
├── utils/
│   ├── panchangData.ts         # Core Panchang engine (~1200 lines)
│   ├── choghadiyaData.ts       # Choghadiya periods
│   ├── timeslots.ts            # Hourly slot generation
│   ├── shareAndExport.ts       # PDF, ICS, social text
│   ├── cardGenerator.ts        # Image generation
│   └── cardShare.ts            # Social share helpers
└── docs/
    └── BROWSER_NOTIFICATIONS.md

docs/
└── APP_FLOW.md                 # This document

.github/workflows/deploy.yml     # GitHub Pages CI/CD
CNAME                            # astroeventplanner.com
index.html                       # SEO, OG tags, optional AdSense/GA
```

---

## 12. Known Limitations & Open Items

| Area | Current state |
|------|---------------|
| **URL routing** | Views are React state only — no deep links (`?view=panchang`) |
| **Cities** | 12 hardcoded cities; duplicated across 5+ components |
| **Transition UI** | Backend detects Tithi/Nakshatra transitions; predominant-element display + tooltip not built |
| **Personalization** | Moon sign + birth day only; not full birth chart |
| **Caching** | No calculation cache — month scans recompute all days |
| **Tests** | Playwright installed; no CI test job |
| **Analytics / AdSense** | Placeholder in `index.html`; commented out until IDs configured |
| **Mobile header** | Panchang 3-column header may be cramped on small screens |
| **Notifications** | `setTimeout`-based; no service worker for background delivery |

---

## 13. Summary

Astro Event Planner is a **single-page, client-side Vedic astrology tool** that:

1. **Calculates** Panchang data in the browser using `mhah-panchang` + `suncalc`
2. **Scores** dates for 10 event types across 12 Indian cities
3. **Presents** six focused views from one navigation shell
4. **Shares** daily Panchang via social, PDF, calendar, and image cards
5. **Deploys** statically to GitHub Pages at astroeventplanner.com

No server, no database, no user accounts — privacy and simplicity by design, with room to grow into routing, caching, deeper personalization, and automated testing.

---

*Last updated: July 2026 — reflects `main` at commit `05e343f` (SunCalc moon times + Panchang header redesign).*
