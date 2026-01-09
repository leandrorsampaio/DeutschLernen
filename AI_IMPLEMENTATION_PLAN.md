# German Learning App - AI Implementation Plan

## Overview
This plan is designed for AI agent execution to implement a local German vocabulary learning application as specified in v4.md. The application features a multi-app plugin architecture with Phase 1 focusing on noun learning.

## Project Specifications
- **Target:** Personal German vocabulary learning (B1/B2 level)
- **Architecture:** Vanilla JS frontend + Node.js/Express backend
- **Storage:** JSON files with LocalStorage sync
- **Deployment:** Local-only web application

## Phase 1: Core Infrastructure & Nouns App

### 1. Project Setup & Dependencies
**Task ID:** `setup-project`
**Estimated Time:** 30 minutes

```bash
# Create project structure
mkdir -p german-learning-app/public/{core,apps/nouns,apps/verbs,apps/expressions}
mkdir -p german-learning-app/data/{nouns,verbs,expressions}
cd german-learning-app

# Initialize npm and install dependencies
npm init -y
npm install express

# Create initial file structure
touch server.js
touch public/index.html
touch public/style.css
touch public/launcher.js
touch public/core/learning-engine.js
touch public/core/utils.js
touch public/apps/nouns/nouns.html
touch public/apps/nouns/nouns.css
touch public/apps/nouns/nouns.js
```

### 2. Backend API Server Implementation
**Task ID:** `implement-server`
**Estimated Time:** 2 hours
**Dependencies:** setup-project

**Files to create:**
- `server.js` (~100 lines)

**Key Features:**
- Express server with static file serving
- RESTful API endpoints for CRUD operations
- Data directory auto-creation
- File-based JSON persistence
- Error handling and validation

**API Endpoints Required:**
```
GET    /api/:app/active     - Load active words
GET    /api/:app/archived   - Load archived words  
GET    /api/:app/metadata   - Load app metadata
POST   /api/:app/active     - Save active words
POST   /api/:app/archived   - Save archived words
POST   /api/:app/metadata   - Save app metadata
POST   /api/:app/archive    - Move words to archive
POST   /api/:app/unarchive  - Move words back to active
```

### 3. Core Learning Engine
**Task ID:** `implement-learning-engine`
**Estimated Time:** 3 hours
**Dependencies:** implement-server

**Files to create:**
- `public/core/learning-engine.js` (~300 lines)

**Key Features:**
- Weighted word selection algorithm
- Progress tracking and statistics calculation
- Memory management (memorized/non-memorized)
- Archive automation (90+ days)
- Session management (15 cards default)
- Answer validation with typo tolerance

**Core Functions Required:**
```javascript
class LearningEngine {
  constructor(appName)
  async loadData()
  async saveData() 
  selectWordsForSession(count, mode)
  validateAnswer(userAnswer, correctAnswers)
  recordAttempt(wordId, correct, timeMs)
  calculateStats()
  checkForMemorized()
  archiveOldWords()
  unarchiveFailedWords()
}
```

### 4. Utility Functions
**Task ID:** `implement-utils`
**Estimated Time:** 1 hour
**Dependencies:** None

**Files to create:**
- `public/core/utils.js` (~150 lines)

**Key Features:**
- Date/time formatting
- Text normalization and comparison
- Array shuffling and selection
- LocalStorage management
- Validation helpers
- Color/gender utilities for German articles

**Core Functions Required:**
```javascript
// Text processing
normalizeText(text)
calculateSimilarity(str1, str2)
isTypoTolerant(input, target)

// German language helpers
getGenderColor(article)
formatGermanNoun(article, noun, plural)

// Data helpers
shuffleArray(array)
selectWeightedRandom(items, weights)
formatDate(date)
calculateStreak(attempts)
```

### 5. App Launcher Interface
**Task ID:** `implement-launcher`
**Estimated Time:** 2 hours
**Dependencies:** implement-utils

**Files to create:**
- `public/index.html` (~100 lines)
- `public/launcher.js` (~100 lines)
- `public/style.css` (~300 lines)

**Key Features:**
- App selection screen
- Statistics dashboard
- Session mode selection
- Responsive design
- Error handling and loading states

**Interface Elements:**
- App tiles (Nouns, Verbs, Expressions)
- Statistics summary
- Quick start buttons
- Settings access

### 6. Nouns App Implementation
**Task ID:** `implement-nouns-app`
**Estimated Time:** 5 hours
**Dependencies:** implement-learning-engine

**Files to create:**
- `public/apps/nouns/nouns.html` (~200 lines)
- `public/apps/nouns/nouns.js` (~400 lines)
- `public/apps/nouns/nouns.css` (~200 lines)

**Key Features:**
- Practice session interface
- Three modes: Normal, Review, Archive Review
- Card-based UI with flip animations
- Progress tracking and visual feedback
- Results screen with detailed statistics
- Gender color coding (der=blue, die=red, das=green)

**Session Flow:**
1. Mode selection screen
2. Practice session (15 cards)
3. Card presentation with article/plural
4. Answer input with validation
5. Immediate feedback (correct/incorrect)
6. Card back with translations and examples
7. Progress indication
8. Results summary

### 7. Initial Data Setup
**Task ID:** `create-initial-data`
**Estimated Time:** 1 hour
**Dependencies:** implement-server

**Files to create:**
- `data/nouns/active.json` (50 A1 level German nouns)
- Initial metadata and archived files

**Data Structure Requirements:**
- Complete word entries with articles, plurals, translations
- English and Portuguese translations
- Example sentences
- Difficulty ratings and CEFR levels
- Empty attempt history (will be populated during use)

**Initial Word List (A1 Level):**
Hund, Katze, Haus, Auto, Tisch, Stuhl, Bett, Tür, Fenster, Wasser, Brot, Milch, Kaffee, Tee, Apfel, Mann, Frau, Kind, Vater, Mutter, Bruder, Schwester, Freund, Tag, Nacht, Jahr, Monat, Woche, Zeit, Geld, Stadt, Land, Straße, Weg, Arbeit, Schule, Buch, Name, Hand, Kopf, Auge, Ohr, Mund, Nase, Fuß, Herz, Leben, Welt, Mensch, Sache

### 8. Testing & Validation
**Task ID:** `comprehensive-testing`
**Estimated Time:** 3 hours
**Dependencies:** All previous tasks

**Testing Areas:**
- Server startup and API endpoints
- Data persistence and sync
- Learning algorithm accuracy
- UI interactions and animations
- Session flow completion
- Statistics calculation
- Archive/unarchive functionality

**Test Scenarios:**
- Complete practice session with mixed correct/incorrect answers
- Review mode with memorized words
- Archive mode functionality
- Data persistence across browser refreshes
- Error handling for corrupt data
- Performance with 50+ words

### 9. Documentation & Setup Instructions
**Task ID:** `create-documentation`
**Estimated Time:** 1 hour
**Dependencies:** comprehensive-testing

**Files to create:**
- `README.md` (setup and usage instructions)
- `package.json` (with proper scripts)

## Implementation Order & Dependencies

```
setup-project
    ├── implement-server
    ├── implement-utils
    └── create-documentation
        
implement-server
    ├── implement-learning-engine
    └── create-initial-data
        
implement-learning-engine
    ├── implement-launcher
    └── implement-nouns-app
        
implement-launcher + implement-nouns-app + create-initial-data
    └── comprehensive-testing
```

## Critical Implementation Notes

### Data Persistence Strategy
- **Primary:** JSON files on server filesystem
- **Secondary:** LocalStorage for immediate UI updates
- **Sync:** Automatic save after each session
- **Backup:** Manual export functionality

### Learning Algorithm Weights
- **Failed words:** 3x weight
- **Low streak (0-1):** 2x weight  
- **Medium streak (2-4):** 1x weight
- **High streak (5+):** 0.5x weight
- **Never practiced:** 2x weight

### Answer Validation Rules
- Case insensitive matching
- Leading/trailing whitespace ignored
- Articles in answers ignored ("the dog" = "dog")
- Typo tolerance: 1 character difference allowed
- Multiple correct answers supported
- Both English and Portuguese accepted

### Memory Thresholds
- **Memorized:** 5 consecutive correct answers
- **Archive:** 90+ days since last practice
- **Unarchive:** 2+ failures in archive review

### UI/UX Requirements
- **Gender Color Coding:** der=blue, die=red, das=green
- **Response Time:** < 200ms for answer validation
- **Visual Feedback:** Green/red shakes for correct/incorrect
- **Progress Indication:** Real-time card counter and progress bar
- **Keyboard Navigation:** Enter to submit, Space for next card

## Quality Assurance Checklist

### Code Quality
- [ ] All functions have clear single responsibilities
- [ ] Error handling implemented for all async operations
- [ ] Consistent naming conventions throughout
- [ ] No hardcoded values (use configuration objects)
- [ ] Comments for complex algorithm logic only

### Performance
- [ ] JSON files load in < 100ms
- [ ] UI interactions respond in < 200ms
- [ ] Memory usage stable during long sessions
- [ ] No memory leaks in word selection algorithms

### Usability
- [ ] All user actions provide immediate feedback
- [ ] Error messages are clear and actionable
- [ ] Keyboard shortcuts work as expected
- [ ] Mobile responsive (though primarily desktop-focused)

### Data Integrity
- [ ] Word IDs are unique and never reused
- [ ] Timestamps are consistently formatted (ISO 8601)
- [ ] JSON structure validation on load/save
- [ ] Graceful handling of corrupted data files

## Future Extension Points

### Phase 2 Preparation
- Plugin architecture allows easy addition of Verbs app
- Data structure supports conjugation tables
- Learning engine supports different question types

### Phase 3 Preparation  
- Expression context handling ready
- Multi-word phrase support in validation
- Formality level tracking capability

## Success Criteria

### Phase 1 Complete When:
- [ ] User can practice 50 German nouns successfully
- [ ] Learning algorithm adapts to user performance
- [ ] Statistics accurately reflect learning progress
- [ ] All three modes (Normal, Review, Archive) functional
- [ ] Data persists correctly across sessions
- [ ] No critical bugs in core functionality

### Performance Benchmarks:
- Server startup: < 5 seconds
- Data loading: < 2 seconds for 50 words
- Answer validation: < 100ms
- Session completion: < 30 seconds for 15 cards

## Deployment Instructions

### Development Environment:
```bash
cd german-learning-app
npm start              # Starts server on port 3000
```

### Browser Access:
- Open http://localhost:3000
- Select "Nouns App" from launcher
- Choose practice mode and begin learning

### Troubleshooting:
- Check console for JavaScript errors
- Verify data files exist in /data/nouns/
- Ensure server.js runs without port conflicts
- Test with different browsers for compatibility

---

**Total Estimated Implementation Time:** 16-19 hours  
**Total Estimated Lines of Code:** ~1,400 lines  
**Primary Completion Criteria:** Functional noun learning app with persistence and three practice modes