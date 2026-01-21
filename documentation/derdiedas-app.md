# Der Die Das App - Documentation

## Overview

The **Der Die Das** app is a focused practice tool for learning German grammatical gender (articles). Unlike the Nouns app which tests vocabulary translations, this app specifically tests article recall through button-based selection.

**Added:** 2026-01-21
**Status:** Active
**Location:** `public/apps/derdiedas/`

---

## Purpose

German articles (der/die/das) are one of the most challenging aspects for learners because:
- There's no consistent rule to predict gender
- Memorization through repetition is the most effective method
- Quick recognition is key for fluent speech

This app isolates article practice from translation practice, allowing focused training on gender recall.

---

## How It Works

### Gameplay Flow

1. **Card Display:** Shows only the German noun (e.g., "Hund") - no article shown
2. **User Selection:** Four buttons available:
   - `der` (masculine - blue)
   - `die` (feminine - red)
   - `das` (neutral - green)
   - `I don't know` (counts as incorrect)
3. **Immediate Feedback:** Card flips to show:
   - Correct article with noun and plural
   - Correct/Incorrect indicator
   - Full translations (EN/PT)
   - Example sentence
4. **Progress Tracking:** Same 5-correct-in-a-row memorization system

### Key Differences from Nouns App

| Aspect | Nouns App | Der Die Das App |
|--------|-----------|-----------------|
| Input method | Type translation | Click article button |
| Card front shows | Article + noun + plural | Just the noun |
| Tests | Vocabulary (translation recall) | Grammar (article recall) |
| Time per card | 5-10 seconds | 2-3 seconds |
| "I don't know" | Not available | Available (prevents guessing) |

---

## Data Structure

### Location
```
data/derdiedas/
├── active.json      # Words being learned
├── archived.json    # Mastered words (90+ days)
└── metadata.json    # Settings and statistics
```

### Word Schema

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
  "warning": "",
  "attempts": [],
  "streak": 0,
  "memorized": false,
  "memorizedDate": null
}
```

**Notes:**
- `falseFriend` field removed (not relevant for article practice)
- `level` set to "A1" for all words
- Same progress tracking fields as Nouns app

---

## Practice Modes

### Mode 1: Normal Practice (15 cards)
- Pool: Words where `memorized: false`
- Selection: Weighted random (failed words get 3x priority)
- Goal: Learn new articles

### Mode 2: Review Recently Memorized (10 cards)
- Pool: Words where `memorized: true` and `memorizedDate < 90 days`
- Selection: Oldest memorized first
- Goal: Reinforce before archiving

### Mode 3: Archive Review (10 cards)
- Pool: Words from `archived.json`
- Selection: Never-reviewed first
- Goal: Maintain long-term memory
- Special: 2+ failures unarchives the word

---

## Progress System

### Memorization Rules
- **5 correct in a row** = word becomes memorized
- **Any incorrect answer** = streak resets to 0
- **"I don't know" button** = counts as incorrect (streak resets)

### Archive Rules
- **90 days memorized** = word moves to archive
- **2 failures in archive review** = word returns to active

---

## UI Components

### Card Front
```
┌─────────────────────────────────┐
│                                 │
│            Hund                 │
│                                 │
│   [der]    [die]    [das]       │
│                                 │
│        [I don't know]           │
│                                 │
└─────────────────────────────────┘
```

### Card Back (after answer)
```
┌─────────────────────────────────┐
│ der Hund → die Hunde    ✓ Correct │
│─────────────────────────────────│
│ Translations:                    │
│ 🇬🇧 dog, hound                   │
│ 🇧🇷 cão, cachorro                │
│                                  │
│ Example:                         │
│ Der Hund spielt im Garten.      │
│ (O cachorro brinca no jardim.)  │
│                                  │
│         [Next Card →]            │
└──────────────────────────────────┘
```

### Gender Color Coding
- **der** (masculine): Blue (`--color-masculine`)
- **die** (feminine): Red (`--color-feminine`)
- **das** (neutral): Green (`--color-neutral`)

---

## File Structure

```
public/apps/derdiedas/
├── derdiedas.html    # Main HTML structure
├── derdiedas.css     # App-specific styles
└── derdiedas.js      # App logic and interactions
```

### derdiedas.html (~190 lines)
- Home screen with stats and mode buttons
- Practice screen with card container
- Results screen with score display
- Statistics screen with metrics

### derdiedas.css (~400 lines)
- Article button styles with gender colors
- Card animations (shake correct/incorrect)
- Responsive design for mobile
- Accessibility support

### derdiedas.js (~300 lines)
- `showCard()` - Displays noun with article buttons
- `checkAnswer()` - Validates selection against word.article
- `showCardBack()` - Displays full word info after answer
- Reuses LearningEngine from core

---

## Initial Data

The app was initialized with **50 A1 nouns** copied from the Nouns app:
- All progress reset (attempts: [], streak: 0, memorized: false)
- `falseFriend` field removed
- `level` set to "A1" for all words

### Word Distribution by Gender
| Article | Count | Examples |
|---------|-------|----------|
| der (masculine) | 20 | Hund, Tisch, Mann, Vater, Tag |
| die (feminine) | 17 | Katze, Tür, Frau, Nacht, Stadt |
| das (neutral) | 13 | Haus, Auto, Bett, Kind, Buch |

---

## Adding New Words

1. Open `data/derdiedas/active.json`
2. Copy an existing word structure
3. Update all fields:
   - Increment `id`
   - Set `de`, `article`, `plural`
   - Add `en` and `pt` translations
   - Add example sentence
   - Set `level` to appropriate CEFR level
   - Set `difficulty` (1-3, default 2)
   - Leave progress fields empty/zero
4. Save and refresh browser

**Example new word:**
```json
{
  "id": 51,
  "de": "Baum",
  "article": "der",
  "plural": "die Bäume",
  "en": ["tree"],
  "pt": ["árvore"],
  "example": "Der Baum ist sehr alt.",
  "examplePt": "A árvore é muito velha.",
  "level": "A1",
  "difficulty": 2,
  "warning": "",
  "attempts": [],
  "streak": 0,
  "memorized": false,
  "memorizedDate": null
}
```

---

## Resetting Progress

### Reset only Der Die Das progress (keep words):
```javascript
// In browser console or script
const data = await fetch('/api/derdiedas/active').then(r => r.json());
data.words.forEach(w => {
  w.attempts = [];
  w.streak = 0;
  w.memorized = false;
  w.memorizedDate = null;
});
await fetch('/api/derdiedas/active', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(data)
});
```

### Reset everything (delete all data):
```bash
rm -rf data/derdiedas/
# Restart server - files will be recreated empty
```

---

## Statistics Tracked

- **Learning:** Words with `memorized: false`
- **Recently Memorized:** Words with `memorized: true`
- **Archived:** Words in `archived.json`
- **Overall Accuracy:** Correct answers / Total answers
- **Current Streak:** Consecutive days practiced
- **Total Sessions:** Number of completed sessions
- **Streak Distribution:** Visual bar showing words at each streak level (0-4+)

---

## Tips for Effective Practice

1. **Daily Practice:** Short daily sessions beat long weekly sessions
2. **Don't Guess:** Use "I don't know" if unsure - wrong guesses can create false memories
3. **Focus on Failures:** The weighted selection will show failed words more often
4. **Review Before Archive:** Check "Review Recently Memorized" weekly
5. **Combine with Nouns App:** Use Der Die Das for article drill, Nouns for vocabulary

---

## Technical Notes

### Shared Code
The app reuses these core components:
- `core/learning-engine.js` - Word selection, progress tracking
- `core/utils.js` - Helper functions (getGenderClass, todayISO, etc.)

### API Endpoints
Same RESTful API as other apps:
- `GET /api/derdiedas/active` - Load active words
- `GET /api/derdiedas/archived` - Load archived words
- `GET /api/derdiedas/metadata` - Load settings and stats
- `POST /api/derdiedas/active` - Save active words
- `POST /api/derdiedas/archived` - Save archived words
- `POST /api/derdiedas/metadata` - Save metadata
- `GET /api/derdiedas/export` - Download backup

### Launcher Integration
The app appears on the main launcher (`index.html`) with:
- Icon: 🎯
- Name: "Der Die Das"
- Description: "Practice German articles"
- Live statistics display
