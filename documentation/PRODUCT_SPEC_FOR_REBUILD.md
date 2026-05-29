# DeutschLernen — Product Spec for Rebuild

> **Audience:** an LLM that will rebuild this app in a modern web stack (JS or TS) with a fresher design, while preserving the product concept.
>
> **How to use this document:** every behavior below is anchored to the current implementation with `file:line` refs. Read the reference when the behavior matters; this doc tells you **what** to build, the code tells you the **exact arithmetic**. The current stack (vanilla JS + Express + JSON files) is **not prescriptive** — you may choose any modern web stack. Only the product concept, data shape, and learning rules must carry over.
>
> **Scope of rebuild:** two apps — **Nouns** and **Der Die Das**. The current repo also has empty placeholders for Verbs and Expressions; ignore those.

---

## 1. Product concept in one paragraph

DeutschLernen is a personal, single-user German vocabulary trainer for a Portuguese/English-speaking learner at roughly A1–B2 level. The user opens a launcher, picks one of two practice apps, and runs short flash-card sessions (~15 cards). Each card shows a German noun; the user either types its translation (**Nouns** app) or picks its article der/die/das (**Der Die Das** app). The system tracks per-word streaks, auto-promotes words to "memorized" after 5 consecutive correct answers, surfaces them again ~30 days later for reinforcement, and finally archives them after 90 days of being memorized. Failed words from the archive bounce back into active practice. Translations are accepted in **both English and Portuguese**, with typo tolerance. Everything persists between sessions.

The two apps share **the same data model, the same word list, the same learning engine, the same UI shell, and the same three-mode session structure**. They differ only in what the card asks the user.

---

## 2. The two apps, side by side

| Aspect | **Nouns** app | **Der Die Das** app |
|---|---|---|
| Question shown | `der Hund` + plural `die Hunde` | `Hund` (no article shown) |
| User input | Free-text translation typed into input field | Click one of three buttons: `der` / `die` / `das` (+ "I don't know") |
| Correct if | Input matches any English or Portuguese translation (typo-tolerant, articles ignored) | Selected article === word's article |
| Visual cue | Card border colored by gender from the start | Card neutral until answered, then colored by gender |
| Reference | `public/apps/nouns/nouns.js`, `public/apps/nouns/nouns.html` | `public/apps/derdiedas/derdiedas.js`, `public/apps/derdiedas/derdiedas.html` |

Both apps use the **same word data shape** (see §4). The current implementation keeps **separate copies** of the word list per app under `data/nouns/` and `data/derdiedas/` — this means learning progress in one app does **not** affect the other, even for the same noun. Keep this independence in the rebuild (a user mastering an article in Der Die Das shouldn't auto-mark the noun memorized in the Nouns app, because the cognitive task is different).

---

## 3. User-visible screens & flow

Each app is a single-page experience with **four screens**, only one visible at a time. The launcher is a fifth screen at the root.

### 3.1 Launcher (`/`)
- Title "German Learning" + subtitle.
- 2×2 (or responsive) grid of app tiles. Each tile shows: emoji, app name, short description, **live stats** loaded from the metadata API (`X memorized • Y active • Z archived`).
- Tiles for Verbs and Expressions are disabled placeholders ("Coming soon"). In the rebuild you may drop these or keep them as a hint at future scope.
- Reference: `public/index.html`, `public/launcher.js:26-100`.

### 3.2 App home screen (per app)
- Header with "← Back to Launcher" and app title.
- Three large stat cards: **Learning** (active, non-memorized), **Recently Memorized**, **Archived**.
- Three large mode buttons (disabled when their pool is empty):
  1. **Practice New Words** — N cards (default 15, from `metadata.settings.sessionLength`).
  2. **Review Recently Memorized** — 10 cards.
  3. **Review Archive** — 10 cards.
- Two secondary buttons: **View Statistics**, **Export Backup**.
- Reference: `public/apps/nouns/nouns.html:15-60`, `public/apps/nouns/nouns.js:56-75`.

### 3.3 Practice screen
- Top: a quit button (`✕ Quit`, with confirm + save) and the current mode label.
- Center: the **card** (~400px tall, soft shadow, rounded). Shows the question; reveals the answer after the user responds.
- Bottom: a progress bar `Card X of N` with a filling bar.
- Reference: `public/apps/nouns/nouns.html:65-88`, `public/apps/nouns/nouns.js:175-218` (front), `public/apps/nouns/nouns.js:271-315` (back).

**Card lifecycle:**
1. **Front** appears. Timer starts (`cardStartTime = Date.now()`, `nouns.js:217`).
2. User answers (Enter to submit in Nouns; click in Der Die Das).
3. Card shakes briefly — **green shake** for correct, **red shake** for incorrect (~500ms animation; `nouns.js:275-278`).
4. **Back** is rendered in place, showing: full German form (`article noun → plural`), ✓/✗ result, all English translations, all Portuguese translations, optional `⚠️ warning` if present, the German example sentence, the Portuguese example translation, and a **Next Card / Finish Session** button. The button auto-focuses so Enter advances.
5. Repeat until index === session length, then `finishSession()` → save → show results.

### 3.4 Results screen
- Title "Session Complete!"
- Big score: `X out of Y correct` + accuracy percentage.
- A motivational message tiered by performance:
  - All correct → "Perfect! 🌟"
  - Off by ≤2 → "Excellent! 🎉"
  - Off by ≤5 → "Great job! 👏"
  - Off by ≤8 → "Good effort! 💪"
  - Else → "Keep practicing! 📚"
  - Reference: `public/apps/nouns/nouns.js:360-387`. (Der Die Das uses the same tiers without emojis — feel free to unify in the rebuild.)
- Two buttons: **Practice Again** (re-runs the same mode), **Return to Home**.

### 3.5 Statistics screen
- Four metric tiles: Current Streak (days), Longest Streak (days), Overall Accuracy %, Total Sessions.
- A horizontal **streak distribution bar** with 5 segments (streaks `0`, `1`, `2`, `3`, `4+`) where each segment's width is proportional to how many active non-memorized words have that streak, with a distinct color per bucket (grey / pink / yellow / light-green / light-blue).
- A placeholder for a calendar visualization (not yet implemented; nice-to-have in the rebuild).
- Reference: `public/apps/nouns/nouns.js:414-440`, `public/apps/nouns/nouns.html:117-176`.

---

## 4. Data model

Three JSON files per app live under `data/<app>/`:

```
data/
  nouns/      { active.json, archived.json, metadata.json }
  derdiedas/  { active.json, archived.json, metadata.json }
```

### 4.1 Active word (full record)

This is the canonical "word" object. **Both apps use this same shape.** It is the central object of the entire product — design your storage around it.

```json
{
  "id": 1,
  "de": "Hund",
  "article": "der",
  "plural": "die Hunde",
  "en": ["dog", "hound"],
  "pt": ["cão", "cachorro"],
  "example": "Der Hund spielt im Garten.",
  "examplePt": "O cachorro brinca no jardim.",
  "level": "A1",
  "difficulty": 2,
  "falseFriend": false,
  "warning": "",
  "attempts": [
    { "date": "2026-01-09", "correct": true, "ms": 3402 }
  ],
  "streak": 5,
  "memorized": true,
  "memorizedDate": "2026-02-04"
}
```

Field notes:
- `id` is a stable integer, unique per app, never reused.
- `de` is the bare noun (no article).
- `article` ∈ `"der" | "die" | "das"`.
- `plural` is the full plural with article (e.g., `"die Hunde"`).
- `en` and `pt` are **arrays of strings**, because synonyms must all be accepted as correct answers.
- `example` / `examplePt` are short illustrative sentences (German + Portuguese gloss).
- `level` follows CEFR ("A1", "A2", "B1", "B2").
- `difficulty` ∈ `1 | 2 | 3` (used as a weighting input — see §5.2).
- `falseFriend` is a boolean flag for words that look like Portuguese/English but mean something different. Not currently surfaced in UI; reserved for future emphasis.
- `warning` is a free-text note shown on the card back when non-empty (e.g., a usage caveat). Currently empty across the seed set.
- `attempts` is an append-only log of `{ date: YYYY-MM-DD, correct: bool, ms: number }`.
- `streak` is the count of consecutive correct attempts at the tail of `attempts` (denormalized for fast reads).
- `memorized` flips to `true` once `streak >= 5`. `memorizedDate` is the ISO date when that happened.
- Reference: `data/nouns/active.json:4-53` (sample), `public/core/utils.js:384-407` (validation).

### 4.2 Archived word (compressed)

When a memorized word ages out (90 days since `memorizedDate`), the server **compresses** it: the per-attempt log is collapsed into summary stats, and review-tracking fields are added.

```json
{
  "id": 1,
  "de": "Hund", "article": "der", "plural": "die Hunde",
  "en": ["dog", "hound"], "pt": ["cão", "cachorro"],
  "example": "...", "examplePt": "...",
  "level": "A1", "difficulty": 2,
  "falseFriend": false, "warning": "",
  "totalAttempts": 12,
  "totalCorrect": 11,
  "accuracy": 0.9166,
  "memorizedDate": "2026-02-04",
  "archivedDate": "2026-05-05",
  "lastReviewDate": null,
  "reviewFailures": 0
}
```

Reference: `server.js:367-390` (`compressWord`).

If the user fails an archived word `metadata.settings.unarchiveFailureThreshold` times (default 2), it's **decompressed back** into the active list with `streak: 0`, `memorized: false`, and a fresh single-attempt history seed. Reference: `server.js:400-442`, `public/core/learning-engine.js:494-530`.

### 4.3 Metadata (per app)

```json
{
  "version": "1.0",
  "settings": {
    "archiveThresholdDays": 90,
    "reviewInterval": 30,
    "sessionLength": 15,
    "unarchiveFailureThreshold": 2
  },
  "stats": {
    "totalWords": 50,
    "activeWords": 50,
    "memorizedWords": 13,
    "archivedWords": 0,
    "startDate": "2026-01-21",
    "totalSessions": 18,
    "totalCards": 257,
    "overallAccuracy": 0.6731,
    "currentStreak": 0,
    "longestStreak": 0,
    "averageSessionTime": 0
  },
  "lastArchiveCheck": "2026-01-21T00:00:00.000Z",
  "lastBackup": null
}
```

- `settings` are tunable per-app via the file. All four are read at runtime — do not hardcode them in code.
- `stats` are derived/cached. `currentStreak`/`longestStreak`/`averageSessionTime` are present but **not currently maintained** by the engine — the UI shows them as 0. Treat as a stub you may either fill in or remove in the rebuild.
- `reviewInterval: 30` is declared but **not currently used** by any code path. The "Review Recently Memorized" mode just picks the oldest memorized words regardless of interval — see §5.1.
- Reference: `data/nouns/metadata.json`, `server.js:75-98` (defaults at init), `public/core/learning-engine.js:434-458` (stats update on session end).

### 4.4 Seed data

The current Nouns and Der Die Das apps ship with the **same 50 A1-level nouns** (Hund, Katze, Haus, Auto, Tisch, …). Either copy these into the rebuild or regenerate equivalent seed data. The exact source list is in `documentation/AI_IMPLEMENTATION_PLAN.md:201`.

---

## 5. The learning engine — behaviors

All learning rules live in `public/core/learning-engine.js`. This is the heart of the product. Re-read it in the rebuild — these rules are the IP.

### 5.1 Three session modes — how words are picked

| Mode | Pool | Selection rule | Default count | Reference |
|---|---|---|---|---|
| **Practice** (new words) | Active words where `memorized === false` | **Weighted random sample without replacement** (see §5.2) | `metadata.settings.sessionLength` (15) | `learning-engine.js:170-185` |
| **Review** (recently memorized) | Active words where `memorized === true` | Sort by `memorizedDate` ascending (oldest first → closest to archive threshold), take first N | 10 | `learning-engine.js:194-206` |
| **Archive review** | All archived words | Sort: never-reviewed first (`lastReviewDate === null`), then by `lastReviewDate` ascending. Take first N. | 10 | `learning-engine.js:215-232` |

If the pool has fewer words than requested, return everything available. If empty, alert the user and stay on the home screen. Archive mode lazily loads `archived.json` on first use (`learning-engine.js:91-100`).

### 5.2 Weighted selection (Practice mode)

For each candidate non-memorized word, multiply weights:

| Condition | Multiplier |
|---|---|
| Base weight | `1` |
| Last attempt was incorrect | `× 3` |
| `streak` is 1 or 2 (low streak, not zero) | `× 2` |
| `difficulty === 3` (hard) | `× 2` |
| `difficulty === 1` (easy) | `× 0.5` |

Then perform **weighted random sampling without replacement**: at each step, compute total weight of remaining pool, draw a uniform random in `[0, total)`, walk the array subtracting weights until you cross zero, pick that word, remove it from the pool, repeat N times.

Reference: `learning-engine.js:248-302` (`weightedSample` and `_weightedRandomSample`).

Note: zero-streak words don't get the `× 2` "low streak" boost; only streaks 1–2 do. Brand-new words (no attempts) get base weight = 1. Failed-last gives the strongest signal.

### 5.3 Recording an attempt (per card)

After the user submits an answer:

1. Compute `timeMs = Date.now() - cardStartTime`.
2. Determine `correct` (see §5.4 for Nouns matching; for Der Die Das it's a literal article equality check).
3. **In Practice or Review mode** → `engine.recordAttempt(wordId, correct, timeMs)`:
   - Append `{ date: todayISO(), correct, ms: timeMs }` to `word.attempts`.
   - If `correct`: `word.streak += 1`. If new streak `>= 5` and not already memorized, set `memorized = true`, `memorizedDate = todayISO()`.
   - If incorrect: `word.streak = 0`. If it was memorized, **demote**: `memorized = false`, `memorizedDate = null`.
   - Reference: `learning-engine.js:316-349`.
4. **In Archive review mode** → `engine.recordArchiveAttempt(wordId, correct)`:
   - Set `word.lastReviewDate = todayISO()`.
   - If incorrect: increment `reviewFailures`; if it reaches `metadata.settings.unarchiveFailureThreshold` (default 2), **unarchive immediately** (decompress + push to active + remove from archived + save), and alert the user with the word.
   - If correct: reset `reviewFailures = 0`.
   - Returns a boolean signaling whether the word was unarchived.
   - Reference: `learning-engine.js:359-382`.

### 5.4 Answer validation (Nouns app only)

The user types a translation. The system accepts a wide envelope:

1. **Normalize** both input and each candidate answer (`utils.js:18-26`):
   - Lowercase, trim.
   - Strip a single leading article: `the`, `a`, `an`, `o`, `os`, `as` (case-insensitive). "the dog" → "dog", "o cachorro" → "cachorro". *(Note: Portuguese "a"/"as" overlap with English "a" in the same alternation — the existing regex is `^(the|a|an|o|a|os|as)\s+/i`; the dupes are harmless but worth cleaning up.)*
   - Collapse internal whitespace runs to single spaces.
2. **Build candidate set**: union of `word.en` and `word.pt` (so any English **or** Portuguese answer is accepted). Reference: `public/apps/nouns/nouns.js:237`.
3. **Match**: input is correct if it matches any candidate either exactly (after normalization) **or** within **Levenshtein distance ≤ 1** (single insert/delete/substitute typo allowed). Reference: `utils.js:78-92`, `utils.js:37-68`.

Empty input is rejected silently — the input refocuses, no attempt recorded (`nouns.js:228-232`).

### 5.5 Auto-archive (server-side, on every load)

Every time the engine `load()`s (page open / session end → reload), it POSTs `/api/<app>/archive`. The server:

1. Reads all active words.
2. For each `memorized` word with a `memorizedDate`, computes days since.
3. If `daysSince >= archiveThresholdDays` (default 90): compress it (§4.2) and move it from `active.json` to `archived.json`.
4. Updates `metadata.stats.activeWords`, `archivedWords`, and `lastArchiveCheck`.
5. Returns count archived; if > 0, the client reloads.

Reference: `server.js:307-357`, `learning-engine.js:469-485`.

### 5.6 Session-end statistics

After all cards in a session are answered, `updateSessionStats(sessionResults)` runs:

- `metadata.stats.totalSessions += 1`.
- `metadata.stats.totalCards += session length`.
- `overallAccuracy` is updated as a **running weighted average** over all cards ever practiced — `(oldAccuracy * oldTotal + correctThisSession) / newTotal`. Reference: `learning-engine.js:444-446`.
- `activeWords` and `memorizedWords` counts refreshed.
- Saved to `metadata.json` via POST.

Reference: `learning-engine.js:434-458`.

---

## 6. Persistence & data flow (rebuild-friendly summary)

The current app uses a **double-cache** scheme: server JSON files are the source of truth; LocalStorage holds a recent copy for instant UI on page load while the server fetch is in flight.

Reads on load (`learning-engine.js:36-83`):
1. Read LocalStorage key `${appName}-data` → if present, hydrate UI immediately.
2. Fetch `GET /api/<app>/active` and `GET /api/<app>/metadata` in parallel.
3. Overwrite cache and state with server response.
4. Trigger auto-archive check.

Writes after every session (`learning-engine.js:112-153`):
1. POST `/api/<app>/active` (full active list).
2. POST `/api/<app>/archived` (full archived list).
3. Write LocalStorage cache with new state.
4. Separately POST `/api/<app>/metadata` from `updateSessionStats`.

**For the rebuild:** you don't need to preserve this exact pattern. The principle is *persistence between sessions + fast reads*. Recommended modern equivalents include IndexedDB-only (no server), a serverless backend with Supabase/Firebase, or SQLite via a thin API — pick what fits your chosen stack. **Keep the auto-archive trigger** on app open so the user sees fresh state.

API surface to replicate (or replace):

| Method | Path | Purpose | Reference |
|---|---|---|---|
| GET | `/api/:app/active` | Load active words | `server.js:114-125` |
| GET | `/api/:app/archived` | Load archived words | `server.js:131-142` |
| GET | `/api/:app/metadata` | Load settings + cached stats | `server.js:148-159` |
| POST | `/api/:app/active` | Save active words (full replace) | `server.js:170-183` |
| POST | `/api/:app/archived` | Save archived words (full replace) | `server.js:189-201` |
| POST | `/api/:app/metadata` | Save metadata | `server.js:207-218` |
| POST | `/api/:app/archive` | Run auto-archive sweep | `server.js:230-240` |
| POST | `/api/:app/unarchive` | Move one word back to active by id | `server.js:246-257` |
| GET | `/api/:app/export` | Download all three files bundled with `exportDate` | `server.js:268-293` |

Export downloads a single JSON file named `<app>-backup-YYYY-MM-DD.json`. Trigger from the **Export Backup** button on the app home screen. Reference: `public/apps/nouns/nouns.js:450-470`.

---

## 7. UI/UX requirements (preserve, but redesign)

The current design is functional but plain (CSS custom properties, system font stack, light theme only). The rebuild should look **substantially better** while keeping the rules below. Treat these as product invariants, not visual prescriptions.

### 7.1 Hard requirements — keep these
- **Gender color coding** is the central visual language:
  - `der` (masculine) → **blue**
  - `die` (feminine) → **red**
  - `das` (neuter) → **green**
  - These show as the card border in Nouns, and as the article-button border (and post-answer card border) in Der Die Das. Reference: `public/style.css:19-22`, `public/core/utils.js:105-116`.
- **Shake feedback** on the card after an answer — green tint for correct, red tint for incorrect, ~500ms before flipping to the card back. Reference: `nouns.js:275-278`.
- **Card back must show:** full German form with article and plural, ✓/✗ verdict, **both** English and Portuguese translation lists (with flag indicators 🇬🇧/🇧🇷 in the current build), optional warning, German example sentence, Portuguese gloss of the example.
- **Keyboard-first interaction in Nouns:** input auto-focuses; Enter submits; Enter on the back advances (because Next button auto-focuses). Reference: `nouns.js:204-211`, `nouns.js:312-313`.
- **Click-first interaction in Der Die Das:** three big article buttons + an "I don't know" button (counts as incorrect). Reference: `derdiedas.js:187-203`.
- **Progress bar** at the bottom of the practice screen: textual `Card X of N` + a filling bar (`% = (current+1) / total`). Reference: `nouns.js:397-404`.
- **Empty-pool guard:** mode buttons on the home screen are disabled when their pool is empty. Reference: `nouns.js:72-74`.
- **Quit confirmation:** the Quit button must `confirm()` and save before exiting. Reference: `nouns.js:158-163`.
- **No data loss on accidental refresh:** save runs after every session; LocalStorage (or equivalent) gives instant rehydration.

### 7.2 Performance targets
- Answer validation < 100 ms (today's Levenshtein on short strings is trivially under this).
- Initial data load < 2 s for ~50 words.
- Card-to-card transition feels instantaneous after the shake animation completes.

### 7.3 Responsive
- Currently desktop-first with a single media query at 768px collapsing the launcher grid to one column. The rebuild should be **mobile-friendly** — large tap targets for der/die/das buttons especially, and a touch-friendly input on Nouns.

### 7.4 Things you can freely modernize
- Switch to a real component model (the current code mutates `innerHTML` strings — fine for a prototype, ugly for maintenance).
- Replace inline event listener wiring with declarative components.
- Add dark mode (the current CSS variables make this trivial).
- Add the calendar visualization that the stats screen leaves as a placeholder (`nouns.html:172-175`).
- Add a real "current streak / longest streak" implementation — these fields exist in metadata but aren't maintained today.
- Unify the two apps under a single shell with internal routing; the current setup duplicates ~95% of `nouns.html`/`derdiedas.html` and `nouns.js`/`derdiedas.js` (compare side by side — the only meaningful difference is the question/answer half).

---

## 8. Why each piece exists — design rationale

Useful context for the rebuild LLM when judging edge cases:

- **Two translation languages.** The user thinks in Portuguese natively but writes English professionally; accepting both removes friction at the moment of recall. Don't drop one to "simplify."
- **Typo tolerance with edit-distance ≤ 1.** The user is a fast typist; a one-letter slip shouldn't be punished as a memory failure. Make it tighter (distance 0) only if the new UI makes typos far less likely (e.g., picker UI for Nouns).
- **Article stripping in normalization.** "the dog" and "dog" should both count — the article is grammar overhead, not content.
- **Five-streak memorization, 90-day archive, 30-day review interval.** The "memorize → revisit → forget proof → archive" pipeline is roughly a spaced-repetition gradient at long intervals. These thresholds are tuned for a hobbyist learner doing short daily sessions, not a cram student.
- **Demote on miss.** A previously memorized word that fails immediately drops to `memorized: false, streak: 0`. This is intentional: confident wrong answers signal real decay.
- **Failed-last × 3 weight.** The strongest priority. Yesterday's failure is tomorrow's drill.
- **Per-app independence of progress.** Knowing how to translate "Hund" ≠ knowing its gender. They are tracked separately on purpose.
- **Archive compression.** Saves bytes once a word is solid; review failures bring it back rather than losing the history entirely. The compressed form keeps the **summary** of past attempts (`totalAttempts`, `totalCorrect`, `accuracy`) so the LLM rebuild can decide whether to surface "lifetime accuracy" in the UI.
- **Local-only / single-user.** No auth, no accounts. The current Express server is for one machine. Match this in the rebuild unless you intentionally add multi-user support (in which case namespace everything by userId).

---

## 9. Acceptance criteria for the rebuild

A successful rebuild satisfies all of the following. Use these as a checklist near the end.

1. **Two apps** (Nouns, Der Die Das) reachable from a launcher. Each shows live stats on its launcher tile.
2. **The same word record schema** (§4.1) persists between sessions in some store of your choice. Seed with the 50 A1 nouns (or import the current `data/nouns/active.json` + `data/derdiedas/active.json` verbatim).
3. **All three modes** (Practice / Review / Archive) work in each app, with the selection rules in §5.1.
4. **Weighted Practice selection** with the exact multipliers in §5.2.
5. **Memorization at 5-streak**, **demotion on incorrect**, **auto-archive at 90 days**, **unarchive at 2 review failures** — exact thresholds, loaded from settings (not hardcoded).
6. **Nouns answer validation** accepts both English and Portuguese, ignores leading articles, allows Levenshtein ≤ 1.
7. **Der Die Das article check** is a literal equality on `der`/`die`/`das`; "I don't know" counts as incorrect.
8. **Gender color coding** (der=blue, die=red, das=green) is visible everywhere genders appear.
9. **Card-back content** is complete (German form + plural, verdict, EN list, PT list, optional warning, example + PT gloss).
10. **Export** produces a single JSON file containing active + archived + metadata + an `exportDate` (per app).
11. **Stats screen** shows current/longest streak, overall accuracy, total sessions, and a streak-distribution bar with buckets 0/1/2/3/4+.
12. **No data loss** across page reloads, accidental refresh, or quit-mid-session (after a confirm).
13. **Settings are runtime-tunable** — changing `sessionLength` or `archiveThresholdDays` in storage must take effect on next load without code changes.

---

## 10. File map of the current implementation

For quick LLM navigation while reading source:

| Layer | File | Lines | Role |
|---|---|---:|---|
| Server | `server.js` | 464 | Express + JSON-file API, archive sweep, export |
| Shared core | `public/core/learning-engine.js` | 531 | `LearningEngine` class: load/save, selection, attempts, archive |
| Shared core | `public/core/utils.js` | 440 | Text normalization, Levenshtein, gender color, date utils, storage helpers, validation |
| Launcher | `public/index.html` | 69 | App tiles |
| Launcher | `public/launcher.js` | 107 | Loads per-app metadata, renders stats line |
| Shared CSS | `public/style.css` | 341 | Design tokens (CSS vars), launcher styles, buttons |
| Nouns app | `public/apps/nouns/nouns.html` | 184 | Four screens (home/practice/results/stats) |
| Nouns app | `public/apps/nouns/nouns.js` | 506 | Session orchestration for typed-translation cards |
| Nouns app | `public/apps/nouns/nouns.css` | 568 | Card, gender borders, shake animations |
| DerDieDas app | `public/apps/derdiedas/derdiedas.html` | 185 | Same four screens, near-identical structure |
| DerDieDas app | `public/apps/derdiedas/derdiedas.js` | 499 | Session orchestration for article-button cards |
| DerDieDas app | `public/apps/derdiedas/derdiedas.css` | 649 | Card, article buttons, shake animations |
| Data | `data/nouns/{active,archived,metadata}.json` | — | 50 A1 nouns, per-user state |
| Data | `data/derdiedas/{active,archived,metadata}.json` | — | Same 50 nouns, independent progress |

### A note on `documentation/`

The repo's `documentation/` folder also contains the original implementation plan and a v4 spec. Those describe what *was* built — this document (`PRODUCT_SPEC_FOR_REBUILD.md`) is the source of truth for the rebuild. If the older docs disagree with this one, **this one wins** because it reflects what's actually in the code today.
