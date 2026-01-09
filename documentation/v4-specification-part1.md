# **German Learning App - Development Specification v4.0**

## **Document Information**

* **Version:** 4.0  
* **Last Updated:** 2026-01-06  
* **Status:** Ready for Implementation  
* **Target User:** Solo developer, personal use, local deployment

---

## **Project Overview**

### **Primary Goal**

Build a local German vocabulary learning application for personal use by an intermediate learner (B1/B2 level) who needs to activate passive vocabulary, fix article/plural mistakes, and build systematic daily practice habits.

### **User Context**

* Lives in Germany for 9 years  
* Works in English, thinks bilingually (EN/PT-BR)  
* Married to German native speaker  
* Has grammar foundation but makes A1 mistakes with articles/plurals  
* Needs vocabulary activation, not acquisition  
* Will practice conversation with wife separately  
* Solo user (programmer, can debug issues)  
* Powerful MacBook (performance not a concern)  
* Local-only deployment (web-based in browser)

### **Technical Approach**

Simple, maintainable architecture optimized for solo developer use with multi-app extensibility from Day 1.

---

## **Technology Stack**

### **Frontend**

* Plain HTML5  
* Vanilla CSS3  
* Vanilla JavaScript (ES6+)  
* No build process  
* No frameworks

### **Backend**

* Node.js  
* Express (minimal API server)  
* File system for persistence

### **Data Storage**

* JSON files (active + archived per app)  
* LocalStorage for instant UI  
* Hybrid sync approach

### **Development**

* Edit files, refresh browser  
* No webpack, no bundlers  
* Simple, debuggable

---

## **Architecture Overview**

### **Multi-App Plugin System**

Core System (Shared)  
├── Learning engine (weighted selection, progress tracking)  
├── Statistics calculator  
├── Data persistence layer  
└── Archive management

App Plugins (Specific)  
├── Nouns App (Phase 1)  
│   ├── Article/plural display  
│   ├── Gender color coding  
│   └── Translation validation  
├── Verbs App (Future)  
│   ├── Conjugation tables  
│   ├── Tense selection  
│   └── Auxiliary verb handling  
└── Expressions App (Future)  
    ├── Context hints  
    ├── Formality markers

    └── Usage examples

### **Design Principles**

* Single responsibility per file  
* Shared core, specific plugins  
* Data independence per app  
* No premature optimization  
* Built for change

---

## **File Structure**

german-learning-app/  
├── server.js                           # Express API server (~100 lines)  
├── package.json                        # Dependencies (express only)  
├── README.md                           # Setup instructions  
├── public/  
│   ├── index.html                      # App launcher screen  
│   ├── style.css                       # Global styles (~300 lines)  
│   ├── launcher.js                     # App selection logic (~100 lines)  
│   ├── core/  
│   │   ├── learning-engine.js          # Shared learning logic (~300 lines)  
│   │   └── utils.js                    # Utility functions (~150 lines)  
│   └── apps/  
│       ├── nouns/  
│       │   ├── nouns.html              # Noun practice interface (~200 lines)  
│       │   ├── nouns.css               # Noun-specific styles (~200 lines)  
│       │   └── nouns.js                # Noun practice logic (~400 lines)  
│       ├── verbs/                      # Future Phase 2  
│       │   ├── verbs.html  
│       │   ├── verbs.css  
│       │   └── verbs.js  
│       └── expressions/                # Future Phase 3  
│           ├── expressions.html  
│           ├── expressions.css  
│           └── expressions.js  
└── data/  
    ├── nouns/  
    │   ├── active.json                 # Currently learning + recently memorized  
    │   ├── archived.json               # Mastered 90+ days ago  
    │   └── metadata.json               # App stats and settings  
    ├── verbs/                          # Future  
    │   ├── active.json  
    │   ├── archived.json  
    │   └── metadata.json  
    └── expressions/                    # Future  
        ├── active.json  
        ├── archived.json

        └── metadata.json

**Total Phase 1 Code Estimate:** ~1,400 lines **Estimated Build Time:** 16-19 hours

---

## **Data Models**

### **Active Words (active.json)**

**Purpose:** Words currently being learned OR recently memorized (less than 90 days)

**Structure:**

```json
{  
  "version": "1.0",  
  "lastUpdated": "2026-01-06T10:30:00Z",  
  "words": [  
    {  
      "id": 1,  
      "de": "Hund",  
      "article": "der",  
      "plural": "Hunde",  
      "en": ["dog", "hound"],  
      "pt": ["cão", "cachorro"],  
      "example": "Ich habe einen Hund.",  
      "examplePt": "Eu tenho um cachorro.",  
      "level": "A1",  
      "difficulty": 2,  
      "falseFriend": false,  
      "warning": "",  
      "attempts": [  
        {  
          "date": "2026-01-06",  
          "correct": true,  
          "ms": 3200  
        },  
        {  
          "date": "2026-01-06",  
          "correct": true,  
          "ms": 2800  
        }  
      ],  
      "streak": 2,  
      "memorized": false,  
      "memorizedDate": null  
    },  
    {  
      "id": 2,  
      "de": "Katze",  
      "article": "die",  
      "plural": "Katzen",  
      "en": ["cat"],  
      "pt": ["gato", "gata"],  
      "example": "Die Katze schläft auf dem Sofa.",  
      "examplePt": "O gato dorme no sofá.",  
      "level": "A1",  
      "difficulty": 2,  
      "falseFriend": false,  
      "warning": "",  
      "attempts": [  
        {  
          "date": "2026-01-05",  
          "correct": true,  
          "ms": 2500  
        },  
        {  
          "date": "2026-01-05",  
          "correct": true,  
          "ms": 2300  
        },  
        {  
          "date": "2026-01-05",  
          "correct": true,  
          "ms": 2100  
        },  
        {  
          "date": "2026-01-05",  
          "correct": true,  
          "ms": 1900  
        },  
        {  
          "date": "2026-01-06",  
          "correct": true,  
          "ms": 1800  
        }  
      ],  
      "streak": 5,  
      "memorized": true,  
      "memorizedDate": "2026-01-06"  
    }  
  ]

}
```

**Field Definitions:**

**Static Word Data:**

* `id` (integer): Unique identifier, never changes  
* `de` (string): German word without article  
* `article` (string): "der", "die", or "das"  
* `plural` (string): Plural form with article (e.g., "die Hunde")  
* `en` (array): Accepted English translations  
* `pt` (array): Accepted Portuguese (PT-BR) translations  
* `example` (string): Example sentence in German with word in context  
* `examplePt` (string): Portuguese translation of example  
* `level` (string): Goethe CEFR level - "A1", "A2", "B1", "B2"  
* `difficulty` (integer): Subjective difficulty rating 1-3  
  * 1: Easy (user finds simple)  
  * 2: Medium (default for all new words)  
  * 3: Hard (user consistently struggles)  
* `falseFriend` (boolean): True if word has common false cognate issues  
* `warning` (string): Contextual warning about false friends or usage

**Dynamic Progress Data:**

* `attempts` (array): Full history of all practice attempts  
  * `date` (string): ISO date string "YYYY-MM-DD"  
  * `correct` (boolean): Whether answer was correct  
  * `ms` (integer): Time taken to answer in milliseconds  
* `streak` (integer): Current consecutive correct answers (resets to 0 on failure)  
* `memorized` (boolean): True when streak reaches 5  
* `memorizedDate` (string): ISO date when word was first memorized

**Retention Logic:** Words stay in `active.json` if:

* `memorized: false` (still learning), OR  
* `memorized: true` AND memorizedDate is less than 90 days ago

---

### **Archived Words (archived.json)**

**Purpose:** Words mastered for 90+ days, removed from daily practice pool

**Structure:**

```json
{  
  "version": "1.0",  
  "lastUpdated": "2026-04-15T08:00:00Z",  
  "words": [  
    {  
      "id": 100,  
      "de": "Haus",  
      "article": "das",  
      "plural": "Häuser",  
      "en": ["house"],  
      "pt": ["casa"],  
      "example": "Das Haus ist groß.",  
      "examplePt": "A casa é grande.",  
      "level": "A1",  
      "difficulty": 1,  
      "falseFriend": false,  
      "warning": "",  
      "totalAttempts": 12,  
      "totalCorrect": 11,  
      "accuracy": 0.92,  
      "memorizedDate": "2026-01-15",  
      "archivedDate": "2026-04-15",  
      "lastReviewDate": null,  
      "reviewFailures": 0  
    }  
  ]

}
```

**Field Definitions:**

**Static Data:** Same as active.json

**Compressed Progress Data:**

* `totalAttempts` (integer): Count of all attempts (replaces full attempts array)  
* `totalCorrect` (integer): Count of correct attempts  
* `accuracy` (decimal): totalCorrect / totalAttempts  
* `memorizedDate` (string): When word was first memorized  
* `archivedDate` (string): When word was moved to archive  
* `lastReviewDate` (string): Last time word appeared in archive review  
* `reviewFailures` (integer): Number of failures in archive review sessions

**Note:** Detailed attempts array is removed to save space. Only summary statistics retained.

---

### **Metadata (metadata.json)**

**Purpose:** App-level settings, statistics, and configuration

**Structure:**

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
    "totalWords": 500,  
    "activeWords": 450,  
    "memorizedWords": 35,  
    "archivedWords": 50,  
    "startDate": "2026-01-06",  
    "totalSessions": 87,  
    "totalCards": 1305,  
    "overallAccuracy": 0.84,  
    "currentStreak": 12,  
    "longestStreak": 18,  
    "averageSessionTime": 480  
  },  
  "lastArchiveCheck": "2026-01-06T10:30:00Z",  
  "lastBackup": "2026-01-05T22:00:00Z"  
}  
```

**Field Definitions:**

**Settings:**  
- `archiveThresholdDays` (integer): Days before memorized word is archived (default: 90)  
- `reviewInterval` (integer): Suggested days between archive reviews (default: 30)  
- `sessionLength` (integer): Number of cards per practice session (default: 15)  
- `unarchiveFailureThreshold` (integer): Failures before archived word returns to active (default: 2)

**Statistics:**  
- `totalWords` (integer): All words across active + archived  
- `activeWords` (integer): Words in active.json  
- `memorizedWords` (integer): Active words with memorized: true  
- `archivedWords` (integer): Words in archived.json  
- `startDate` (string): First day of using the app  
- `totalSessions` (integer): All completed practice sessions  
- `totalCards` (integer): All cards answered across all sessions  
- `overallAccuracy` (decimal): All-time correct/total ratio  
- `currentStreak` (integer): Consecutive days with at least one session  
- `longestStreak` (integer): Best streak ever achieved  
- `averageSessionTime` (integer): Mean session duration in seconds

**Tracking:**  
- `lastArchiveCheck` (string): When archive process last ran  
- `lastBackup` (string): When data was last exported

---

## Archive System

### Automatic Archiving

**Trigger Points:**  
1. On app startup (runs once per day)  
2. After completing a practice session  
3. Manual trigger via "Check Archive" button (optional)

**Process:**  
```  
1. Load active.json  
2. Get today's date  
3. For each word where memorized = true:  
   a. Calculate days since memorizedDate  
   b. If days >= 90:  
      - Compress word data (remove detailed attempts)  
      - Move to archived.json  
      - Remove from active.json  
4. Save both files  
5. Update metadata.json stats

6. Log result: "📦 Archived 3 words"
```

**Timing:** Runs in background, takes 5-10ms, user never notices

**Algorithm:**

```javascript
async function checkAndArchive(appName) {  
  const active = await loadFile(`data/${appName}/active.json`);  
  const archived = await loadFile(`data/${appName}/archived.json`);  
  const metadata = await loadFile(`data/${appName}/metadata.json`);  
    
  const threshold = metadata.settings.archiveThresholdDays;  
  const today = new Date();  
    
  const toArchive = [];  
  const remaining = [];  
    
  active.words.forEach(word => {  
    if (word.memorized && word.memorizedDate) {  
      const memorizedDate = new Date(word.memorizedDate);  
      const daysSince = Math.floor((today - memorizedDate) / (1000 * 60 * 60 * 24));  
        
      if (daysSince >= threshold) {  
        toArchive.push(compressWord(word));  
      } else {  
        remaining.push(word);  
      }  
    } else {  
      remaining.push(word);  
    }  
  });  
    
  if (toArchive.length > 0) {  
    archived.words.push(...toArchive);  
    active.words = remaining;  
      
    await saveFile(`data/${appName}/active.json`, active);  
    await saveFile(`data/${appName}/archived.json`, archived);  
      
    metadata.stats.activeWords = remaining.length;  
    metadata.stats.archivedWords = archived.words.length;  
    metadata.lastArchiveCheck = new Date().toISOString();  
      
    await saveFile(`data/${appName}/metadata.json`, metadata);  
      
    return toArchive.length;  
  }  
    
  return 0;  
}

function compressWord(word) {  
  return {  
    id: word.id,  
    de: word.de,  
    article: word.article,  
    plural: word.plural,  
    en: word.en,  
    pt: word.pt,  
    example: word.example,  
    examplePt: word.examplePt,  
    level: word.level,  
    difficulty: word.difficulty,  
    falseFriend: word.falseFriend,  
    warning: word.warning,  
    totalAttempts: word.attempts.length,  
    totalCorrect: word.attempts.filter(a => a.correct).length,  
    accuracy: word.attempts.filter(a => a.correct).length / word.attempts.length,  
    memorizedDate: word.memorizedDate,  
    archivedDate: new Date().toISOString().split('T')[0],  
    lastReviewDate: null,  
    reviewFailures: 0  
  };  
}  
```

### Manual Unarchiving

**When:** User fails archived word 2+ times during archive review

**Process:**  
```  
1. User practices archive review  
2. Gets word wrong  
3. Increment reviewFailures counter  
4. If reviewFailures >= 2:  
   a. Decompress word (restore full data structure)  
   b. Reset: memorized = false, streak = 0  
   c. Add failure attempt to history  
   d. Move to active.json  
   e. Remove from archived.json

5. Log: "⚠️ Unarchived: [word] (failed review)"
```

**Algorithm:**

```javascript
async function unarchiveWord(appName, wordId) {  
  const active = await loadFile(`data/${appName}/active.json`);  
  const archived = await loadFile(`data/${appName}/archived.json`);  
    
  const word = archived.words.find(w => w.id === wordId);  
    
  if (!word) return;  
    
  // Decompress: restore full structure  
  const restored = {  
    id: word.id,  
    de: word.de,  
    article: word.article,  
    plural: word.plural,  
    en: word.en,  
    pt: word.pt,  
    example: word.example,  
    examplePt: word.examplePt,  
    level: word.level,  
    difficulty: word.difficulty,  
    falseFriend: word.falseFriend,  
    warning: word.warning,  
    attempts: [  
      {  
        date: new Date().toISOString().split('T')[0],  
        correct: false,  
        ms: 0  
      }  
    ],  
    streak: 0,  
    memorized: false,  
    memorizedDate: null  
  };  
    
  active.words.push(restored);  
  archived.words = archived.words.filter(w => w.id !== wordId);  
    
  await saveFile(`data/${appName}/active.json`, active);  
  await saveFile(`data/${appName}/archived.json`, archived);  
}  
```

---

## Practice Modes

### Mode 1: Normal Practice (Default)

**Purpose:** Daily vocabulary learning

**Word Pool:** Only words from `active.json` where `memorized: false`

**Selection Strategy:** Weighted random sampling

**Weighting Factors:**  
- Failed recently (last attempt incorrect): 3x weight  
- Low streak (currentStreak 1-2): 2x weight  
- High difficulty (difficulty = 3): 2x weight  
- Low difficulty (difficulty = 1): 0.5x weight

**Session Length:** 15 cards (configurable in metadata)

**Example:**  
```  
Word A: Failed last time + difficulty 3 = 3x * 2x = 6x more likely  
Word B: Streak 2 + difficulty 2 = 2x * 1x = 2x more likely  

Word C: Streak 4 + difficulty 1 = 1x * 0.5x = 0.5x less likely
```

**Algorithm:**

```javascript
function selectWordsForPractice(activeWords, count) {  
  const learning = activeWords.filter(w => !w.memorized);  
    
  const weighted = learning.map(word => {  
    let weight = 1;  
      
    // Failed recently?  
    const lastAttempt = word.attempts[word.attempts.length - 1];  
    if (lastAttempt && !lastAttempt.correct) {  
      weight *= 3;  
    }  
      
    // Low streak?  
    if (word.streak > 0 && word.streak <= 2) {  
      weight *= 2;  
    }  
      
    // Difficulty adjustment  
    if (word.difficulty === 3) weight *= 2;  
    if (word.difficulty === 1) weight *= 0.5;  
      
    return { word, weight };  
  });  
    
  return weightedRandomSample(weighted, count);

}
```

**UI Flow:**

1. User clicks "Start Practice" on noun home  
2. System selects 15 weighted random words  
3. Practice session begins  
4. Progress bar shows "Card 1 of 15"  
5. After 15 cards: Results screen

---

### **Mode 2: Review Recently Memorized**

**Purpose:** Reinforce words memorized within last 90 days before they archive

**Word Pool:** Only words from `active.json` where `memorized: true`

**Selection Strategy:** Oldest first (by memorizedDate)

**Session Length:** 10 cards (shorter than normal practice)

**Frequency:** Once per week (suggested, not enforced)

**Algorithm:**

```javascript
function selectWordsForReview(activeWords, count) {  
  const recentlyMemorized = activeWords.filter(w => w.memorized);  
    
  // Prioritize words closest to being archived (oldest memorizations)  
  return recentlyMemorized  
    .sort((a, b) => new Date(a.memorizedDate) - new Date(b.memorizedDate))  
    .slice(0, count);

}
```

**UI Flow:**

1. User clicks "Review Recently Memorized" on noun home  
2. System selects 10 oldest memorized words  
3. Practice session begins (same as normal practice)  
4. Results screen shows review performance

**Why This Mode:**

* Catches words that were "lucky" memorizations  
* Prevents forgetting before archive  
* Low time investment (5-7 minutes)

---

### **Mode 3: Archive Review**

**Purpose:** Periodic maintenance of long-term memory

**Word Pool:** Words from `archived.json`

**Selection Strategy:** Random OR prioritize never-reviewed

**Session Length:** 10 cards

**Frequency:** Once per month (suggested, not enforced)

**Failure Handling:**

* If word failed 2+ times in review → automatically unarchive  
* Word returns to active.json with streak reset to 0

**Algorithm:**

```javascript
async function selectWordsForArchiveReview(archivedWords, count) {  
  // Option A: Prioritize never-reviewed  
  const sorted = archivedWords.sort((a, b) => {  
    if (!a.lastReviewDate) return -1;  
    if (!b.lastReviewDate) return 1;  
    return new Date(a.lastReviewDate) - new Date(b.lastReviewDate);  
  });  
    
  return sorted.slice(0, count);  
    
  // Option B: Pure random  
  // return shuffle(archivedWords).slice(0, count);  
}

function handleArchiveReviewResult(word, correct) {  
  if (!correct) {  
    word.reviewFailures = (word.reviewFailures || 0) + 1;  
      
    if (word.reviewFailures >= 2) {  
      unarchiveWord(word.id);  
      console.log(`⚠️ Unarchived: ${word.de} (failed ${word.reviewFailures} times)`);  
    }  
  } else {  
    word.reviewFailures = 0;  
    word.lastReviewDate = new Date().toISOString().split('T')[0];  
  }

}
```

**UI Flow:**

1. User clicks "Review Archive" on noun home  
2. System loads archived.json (first time, lazy loading)  
3. Selects 10 words (prioritize never-reviewed)  
4. Practice session begins  
5. If word failed 2+ times: automatic unarchive notification  
6. Results screen

**Why This Mode:**

* Prevents long-term forgetting  
* Low time investment (5-7 minutes)  
* Automatic recovery for forgotten words  
* Only needed monthly

---

## **Backend API (Node.js + Express)**

### **Server Setup (server.js)**

**Complete Implementation:**

```javascript
const express = require('express');  
const fs = require('fs').promises;  
const path = require('path');

const app = express();  
const PORT = 3000;  
const DATA_DIR = path.join(__dirname, 'data');

app.use(express.json({ limit: '10mb' }));  
app.use(express.static('public'));

// Ensure data directories exist  
async function initDataDirs() {  
  const apps = ['nouns', 'verbs', 'expressions'];  
    
  for (const appName of apps) {  
    const appDir = path.join(DATA_DIR, appName);  
      
    try {  
      await fs.mkdir(appDir, { recursive: true });  
        
      // Initialize files if they don't exist  
      const activeFile = path.join(appDir, 'active.json');  
      const archivedFile = path.join(appDir, 'archived.json');  
      const metadataFile = path.join(appDir, 'metadata.json');  
        
      try {  
        await fs.access(activeFile);  
      } catch {  
        await fs.writeFile(activeFile, JSON.stringify({  
          version: "1.0",  
          lastUpdated: new Date().toISOString(),  
          words: []  
        }, null, 2));  
      }  
        
      try {  
        await fs.access(archivedFile);  
      } catch {  
        await fs.writeFile(archivedFile, JSON.stringify({  
          version: "1.0",  
          lastUpdated: new Date().toISOString(),  
          words: []  
        }, null, 2));  
      }  
        
      try {  
        await fs.access(metadataFile);  
      } catch {  
        await fs.writeFile(metadataFile, JSON.stringify({  
          version: "1.0",  
          settings: {  
            archiveThresholdDays: 90,  
            reviewInterval: 30,  
            sessionLength: 15,  
            unarchiveFailureThreshold: 2  
          },  
          stats: {  
            totalWords: 0,  
            activeWords: 0,  
            memorizedWords: 0,  
            archivedWords: 0,  
            startDate: new Date().toISOString().split('T')[0],  
            totalSessions: 0,  
            totalCards: 0,  
            overallAccuracy: 0,  
            currentStreak: 0,  
            longestStreak: 0,  
            averageSessionTime: 0  
          },  
          lastArchiveCheck: new Date().toISOString(),  
          lastBackup: null  
        }, null, 2));  
      }  
    } catch (err) {  
      console.error(`Failed to init ${appName}:`, err);  
    }  
  }  
}

// Load active words  
app.get('/api/:app/active', async (req, res) => {  
  const appName = req.params.app;  
  const file = path.join(DATA_DIR, appName, 'active.json');  
    
  try {  
    const data = await fs.readFile(file, 'utf8');  
    res.json(JSON.parse(data));  
  } catch (err) {  
    res.status(500).json({ error: 'Failed to load active words' });  
  }  
});

// Load archived words  
app.get('/api/:app/archived', async (req, res) => {  
  const appName = req.params.app;  
  const file = path.join(DATA_DIR, appName, 'archived.json');  
    
  try {  
    const data = await fs.readFile(file, 'utf8');  
    res.json(JSON.parse(data));  
  } catch (err) {  
    res.status(500).json({ error: 'Failed to load archived words' });  
  }  
});

// Load metadata  
app.get('/api/:app/metadata', async (req, res) => {  
  const appName = req.params.app;  
  const file = path.join(DATA_DIR, appName, 'metadata.json');  
    
  try {  
    const data = await fs.readFile(file, 'utf8');  
    res.json(JSON.parse(data));  
  } catch (err) {  
    res.status(500).json({ error: 'Failed to load metadata' });  
  }  
});

// Save active words  
app.post('/api/:app/active', async (req, res) => {  
  const appName = req.params.app;  
  const file = path.join(DATA_DIR, appName, 'active.json');  
    
  try {  
    req.body.lastUpdated = new Date().toISOString();  
    await fs.writeFile(file, JSON.stringify(req.body, null, 2));  
    res.json({ success: true });  
  } catch (err) {  
    res.status(500).json({ error: 'Failed to save active words' });  
  }  
});

// Save archived words  
app.post('/api/:app/archived', async (req, res) => {  
  const appName = req.params.app;  
  const file = path.join(DATA_DIR, appName, 'archived.json');  
    
  try {  
    req.body.lastUpdated = new Date().toISOString();  
    await fs.writeFile(file, JSON.stringify(req.body, null, 2));  
    res.json({ success: true });  
  } catch (err) {  
    res.status(500).json({ error: 'Failed to save archived words' });  
  }  
});

// Save metadata  
app.post('/api/:app/metadata', async (req, res) => {  
  const appName = req.params.app;  
  const file = path.join(DATA_DIR, appName, 'metadata.json');  
    
  try {  
    await fs.writeFile(file, JSON.stringify(req.body, null, 2));  
    res.json({ success: true });  
  } catch (err) {  
    res.status(500).json({ error: 'Failed to save metadata' });  
  }  
});

// Trigger archive process  
app.post('/api/:app/archive', async (req, res) => {  
  const appName = req.params.app;  
    
  try {  
    const archivedCount = await runArchiveProcess(appName);  
    res.json({ success: true, archived: archivedCount });  
  } catch (err) {  
    res.status(500).json({ error: 'Archive process failed' });  
  }  
});

// Export for backup  
app.get('/api/:app/export', async (req, res) => {  
  const appName = req.params.app;  
    
  try {  
    const active = await fs.readFile(path.join(DATA_DIR, appName, 'active.json'), 'utf8');  
    const archived = await fs.readFile(path.join(DATA_DIR, appName, 'archived.json'), 'utf8');  
    const metadata = await fs.readFile(path.join(DATA_DIR, appName, 'metadata.json'), 'utf8');  
      
    const exportData = {  
      active: JSON.parse(active),  
      archived: JSON.parse(archived),  
      metadata: JSON.parse(metadata),  
      exportDate: new Date().toISOString()  
    };  
      
    res.setHeader('Content-Type', 'application/json');  
    res.setHeader('Content-Disposition', `attachment; filename="${appName}-backup-${new Date().toISOString().split('T')[0]}.json"`);  
    res.send(JSON.stringify(exportData, null, 2));  
  } catch (err) {  
    res.status(500).json({ error: 'Export failed' });  
  }  
});

// Archive process helper  
async function runArchiveProcess(appName) {  
  const activePath = path.join(DATA_DIR, appName, 'active.json');  
  const archivedPath = path.join(DATA_DIR, appName, 'archived.json');  
  const metadataPath = path.join(DATA_DIR, appName, 'metadata.json');  
    
  const activeData = JSON.parse(await fs.readFile(activePath, 'utf8'));  
  const archivedData = JSON.parse(await fs.readFile(archivedPath, 'utf8'));  
  const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));  
    
  const threshold = metadata.settings.archiveThresholdDays;  
  const today = new Date();  
    
  const toArchive = [];  
  const remaining = [];  
    
  activeData.words.forEach(word => {  
    if (word.memorized && word.memorizedDate) {  
      const memorizedDate = new Date(word.memorizedDate);  
      const daysSince = Math.floor((today - memorizedDate) / (1000 * 60 * 60 * 24));  
        
      if (daysSince >= threshold) {  
        const compressed = {  
          id: word.id,  
          de: word.de,  
          article: word.article,  
          plural: word.plural,  
          en: word.en,  
          pt: word.pt,  
          example: word.example,  
          examplePt: word.examplePt,  
          level: word.level,  
          difficulty: word.difficulty,  
          falseFriend: word.falseFriend,  
          warning: word.warning,  
          totalAttempts: word.attempts.length,  
          totalCorrect: word.attempts.filter(a => a.correct).length,  
          accuracy: word.attempts.filter(a => a.correct).length / word.attempts.length,  
          memorizedDate: word.memorizedDate,  
          archivedDate: new Date().toISOString().split('T')[0],  
          lastReviewDate: null,  
          reviewFailures: 0  
        };  
        toArchive.push(compressed);  
      } else {  
        remaining.push(word);  
      }  
    } else {  
      remaining.push(word);  
    }  
  });  
    
  if (toArchive.length > 0) {  
    archivedData.words.push(...toArchive);  
    activeData.words = remaining;  
      
    await fs.writeFile(activePath, JSON.stringify(activeData, null, 2));  
    await fs.writeFile(archivedPath, JSON.stringify(archivedData, null, 2));  
      
    metadata.stats.activeWords = remaining.length;  
    metadata.stats.archivedWords = archivedData.words.length;  
    metadata.lastArchiveCheck = new Date().toISOString();  
      
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));  
      
    console.log(`📦 Archived ${toArchive.length} words for ${appName}`);  
  }  
    
  return toArchive.length;  
}

// Start server  
initDataDirs().then(() => {  
  app.listen(PORT, () => {  
    console.log(`\n🚀 German Learning App running at http://localhost:${PORT}\n`);  
    console.log('Press Ctrl+C to stop\n');  
  });  
}).catch(err => {  
  console.error('Failed to initialize:', err);  
  process.exit(1);

});
```

**Lines of Code:** ~280 lines

---