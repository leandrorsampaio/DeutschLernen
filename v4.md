# **German Learning App \- Development Specification v4.0**

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

Simple, maintainable architecture optimized for solo developer use with multi-app extensibility from Day 1\.

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

* JSON files (active \+ archived per app)  
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
├── Nouns App (Phase 1\)  
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
├── server.js                           \# Express API server (\~100 lines)  
├── package.json                        \# Dependencies (express only)  
├── README.md                           \# Setup instructions  
├── public/  
│   ├── index.html                      \# App launcher screen  
│   ├── style.css                       \# Global styles (\~300 lines)  
│   ├── launcher.js                     \# App selection logic (\~100 lines)  
│   ├── core/  
│   │   ├── learning-engine.js          \# Shared learning logic (\~300 lines)  
│   │   └── utils.js                    \# Utility functions (\~150 lines)  
│   └── apps/  
│       ├── nouns/  
│       │   ├── nouns.html              \# Noun practice interface (\~200 lines)  
│       │   ├── nouns.css               \# Noun-specific styles (\~200 lines)  
│       │   └── nouns.js                \# Noun practice logic (\~400 lines)  
│       ├── verbs/                      \# Future Phase 2  
│       │   ├── verbs.html  
│       │   ├── verbs.css  
│       │   └── verbs.js  
│       └── expressions/                \# Future Phase 3  
│           ├── expressions.html  
│           ├── expressions.css  
│           └── expressions.js  
└── data/  
    ├── nouns/  
    │   ├── active.json                 \# Currently learning \+ recently memorized  
    │   ├── archived.json               \# Mastered 90+ days ago  
    │   └── metadata.json               \# App stats and settings  
    ├── verbs/                          \# Future  
    │   ├── active.json  
    │   ├── archived.json  
    │   └── metadata.json  
    └── expressions/                    \# Future  
        ├── active.json  
        ├── archived.json

        └── metadata.json

**Total Phase 1 Code Estimate:** \~1,400 lines **Estimated Build Time:** 16-19 hours

---

## **Data Models**

### **Active Words (active.json)**

**Purpose:** Words currently being learned OR recently memorized (less than 90 days)

**Structure:**

json  
{  
  "version": "1.0",  
  "lastUpdated": "2026-01-06T10:30:00Z",  
  "words": \[  
    {  
      "id": 1,  
      "de": "Hund",  
      "article": "der",  
      "plural": "Hunde",  
      "en": \["dog", "hound"\],  
      "pt": \["cão", "cachorro"\],  
      "example": "Ich habe einen Hund.",  
      "examplePt": "Eu tenho um cachorro.",  
      "level": "A1",  
      "difficulty": 2,  
      "falseFriend": false,  
      "warning": "",  
      "attempts": \[  
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
      \],  
      "streak": 2,  
      "memorized": false,  
      "memorizedDate": null  
    },  
    {  
      "id": 2,  
      "de": "Katze",  
      "article": "die",  
      "plural": "Katzen",  
      "en": \["cat"\],  
      "pt": \["gato", "gata"\],  
      "example": "Die Katze schläft auf dem Sofa.",  
      "examplePt": "O gato dorme no sofá.",  
      "level": "A1",  
      "difficulty": 2,  
      "falseFriend": false,  
      "warning": "",  
      "attempts": \[  
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
      \],  
      "streak": 5,  
      "memorized": true,  
      "memorizedDate": "2026-01-06"  
    }  
  \]

}

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
* `level` (string): Goethe CEFR level \- "A1", "A2", "B1", "B2"  
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

json  
{  
  "version": "1.0",  
  "lastUpdated": "2026-04-15T08:00:00Z",  
  "words": \[  
    {  
      "id": 100,  
      "de": "Haus",  
      "article": "das",  
      "plural": "Häuser",  
      "en": \["house"\],  
      "pt": \["casa"\],  
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
  \]

}

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

json  
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
\`\`\`

\*\*Field Definitions:\*\*

\*\*Settings:\*\*  
\- \`archiveThresholdDays\` (integer): Days before memorized word is archived (default: 90)  
\- \`reviewInterval\` (integer): Suggested days between archive reviews (default: 30)  
\- \`sessionLength\` (integer): Number of cards per practice session (default: 15)  
\- \`unarchiveFailureThreshold\` (integer): Failures before archived word returns to active (default: 2)

\*\*Statistics:\*\*  
\- \`totalWords\` (integer): All words across active \+ archived  
\- \`activeWords\` (integer): Words in active.json  
\- \`memorizedWords\` (integer): Active words with memorized: true  
\- \`archivedWords\` (integer): Words in archived.json  
\- \`startDate\` (string): First day of using the app  
\- \`totalSessions\` (integer): All completed practice sessions  
\- \`totalCards\` (integer): All cards answered across all sessions  
\- \`overallAccuracy\` (decimal): All-time correct/total ratio  
\- \`currentStreak\` (integer): Consecutive days with at least one session  
\- \`longestStreak\` (integer): Best streak ever achieved  
\- \`averageSessionTime\` (integer): Mean session duration in seconds

\*\*Tracking:\*\*  
\- \`lastArchiveCheck\` (string): When archive process last ran  
\- \`lastBackup\` (string): When data was last exported

\---

\#\# Archive System

\#\#\# Automatic Archiving

\*\*Trigger Points:\*\*  
1. On app startup (runs once per day)  
2. After completing a practice session  
3. Manual trigger via "Check Archive" button (optional)

\*\*Process:\*\*  
\`\`\`  
1. Load active.json  
2. Get today's date  
3. For each word where memorized \= true:  
   a. Calculate days since memorizedDate  
   b. If days \>= 90:  
      \- Compress word data (remove detailed attempts)  
      \- Move to archived.json  
      \- Remove from active.json  
4. Save both files  
5. Update metadata.json stats

6. Log result: "📦 Archived 3 words"

**Timing:** Runs in background, takes 5-10ms, user never notices

**Algorithm:**

javascript  
async function checkAndArchive(appName) {  
  const active \= await loadFile(\`data/${appName}/active.json\`);  
  const archived \= await loadFile(\`data/${appName}/archived.json\`);  
  const metadata \= await loadFile(\`data/${appName}/metadata.json\`);  
    
  const threshold \= metadata.settings.archiveThresholdDays;  
  const today \= new Date();  
    
  const toArchive \= \[\];  
  const remaining \= \[\];  
    
  active.words.forEach(word \=\> {  
    if (word.memorized && word.memorizedDate) {  
      const memorizedDate \= new Date(word.memorizedDate);  
      const daysSince \= Math.floor((today \- memorizedDate) / (1000 \* 60 \* 60 \* 24));  
        
      if (daysSince \>= threshold) {  
        toArchive.push(compressWord(word));  
      } else {  
        remaining.push(word);  
      }  
    } else {  
      remaining.push(word);  
    }  
  });  
    
  if (toArchive.length \> 0) {  
    archived.words.push(...toArchive);  
    active.words \= remaining;  
      
    await saveFile(\`data/${appName}/active.json\`, active);  
    await saveFile(\`data/${appName}/archived.json\`, archived);  
      
    metadata.stats.activeWords \= remaining.length;  
    metadata.stats.archivedWords \= archived.words.length;  
    metadata.lastArchiveCheck \= new Date().toISOString();  
      
    await saveFile(\`data/${appName}/metadata.json\`, metadata);  
      
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
    totalCorrect: word.attempts.filter(a \=\> a.correct).length,  
    accuracy: word.attempts.filter(a \=\> a.correct).length / word.attempts.length,  
    memorizedDate: word.memorizedDate,  
    archivedDate: new Date().toISOString().split('T')\[0\],  
    lastReviewDate: null,  
    reviewFailures: 0  
  };  
}  
\`\`\`

\#\#\# Manual Unarchiving

\*\*When:\*\* User fails archived word 2+ times during archive review

\*\*Process:\*\*  
\`\`\`  
1\. User practices archive review  
2\. Gets word wrong  
3\. Increment reviewFailures counter  
4\. If reviewFailures \>= 2:  
   a. Decompress word (restore full data structure)  
   b. Reset: memorized \= false, streak \= 0  
   c. Add failure attempt to history  
   d. Move to active.json  
   e. Remove from archived.json

5\. Log: "⚠️ Unarchived: \[word\] (failed review)"

**Algorithm:**

javascript  
async function unarchiveWord(appName, wordId) {  
  const active \= await loadFile(\`data/${appName}/active.json\`);  
  const archived \= await loadFile(\`data/${appName}/archived.json\`);  
    
  const word \= archived.words.find(w \=\> w.id \=== wordId);  
    
  if (\!word) return;  
    
  *// Decompress: restore full structure*  
  const restored \= {  
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
    attempts: \[  
      {  
        date: new Date().toISOString().split('T')\[0\],  
        correct: false,  
        ms: 0  
      }  
    \],  
    streak: 0,  
    memorized: false,  
    memorizedDate: null  
  };  
    
  active.words.push(restored);  
  archived.words \= archived.words.filter(w \=\> w.id \!== wordId);  
    
  await saveFile(\`data/${appName}/active.json\`, active);  
  await saveFile(\`data/${appName}/archived.json\`, archived);  
}  
\`\`\`

\---

\#\# Practice Modes

\#\#\# Mode 1: Normal Practice (Default)

\*\*Purpose:\*\* Daily vocabulary learning

\*\*Word Pool:\*\* Only words from \`active.json\` where \`memorized: false\`

\*\*Selection Strategy:\*\* Weighted random sampling

\*\*Weighting Factors:\*\*  
\- Failed recently (last attempt incorrect): 3x weight  
\- Low streak (currentStreak 1-2): 2x weight  
\- High difficulty (difficulty \= 3): 2x weight  
\- Low difficulty (difficulty \= 1): 0.5x weight

\*\*Session Length:\*\* 15 cards (configurable in metadata)

\*\*Example:\*\*  
\`\`\`  
Word A: Failed last time \+ difficulty 3 \= 3x \* 2x \= 6x more likely  
Word B: Streak 2 \+ difficulty 2 \= 2x \* 1x \= 2x more likely  

Word C: Streak 4 \+ difficulty 1 \= 1x \* 0.5x \= 0.5x less likely

**Algorithm:**

javascript  
function selectWordsForPractice(activeWords, count) {  
  const learning \= activeWords.filter(w \=\> \!w.memorized);  
    
  const weighted \= learning.map(word \=\> {  
    let weight \= 1;  
      
    *// Failed recently?*  
    const lastAttempt \= word.attempts\[word.attempts.length \- 1\];  
    if (lastAttempt && \!lastAttempt.correct) {  
      weight \*= 3;  
    }  
      
    *// Low streak?*  
    if (word.streak \> 0 && word.streak \<= 2) {  
      weight \*= 2;  
    }  
      
    *// Difficulty adjustment*  
    if (word.difficulty \=== 3) weight \*= 2;  
    if (word.difficulty \=== 1) weight \*= 0.5;  
      
    return { word, weight };  
  });  
    
  return weightedRandomSample(weighted, count);

}

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

javascript  
function selectWordsForReview(activeWords, count) {  
  const recentlyMemorized \= activeWords.filter(w \=\> w.memorized);  
    
  *// Prioritize words closest to being archived (oldest memorizations)*  
  return recentlyMemorized  
    .sort((a, b) \=\> new Date(a.memorizedDate) \- new Date(b.memorizedDate))  
    .slice(0, count);

}

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

javascript  
async function selectWordsForArchiveReview(archivedWords, count) {  
  *// Option A: Prioritize never-reviewed*  
  const sorted \= archivedWords.sort((a, b) \=\> {  
    if (\!a.lastReviewDate) return \-1;  
    if (\!b.lastReviewDate) return 1;  
    return new Date(a.lastReviewDate) \- new Date(b.lastReviewDate);  
  });  
    
  return sorted.slice(0, count);  
    
  *// Option B: Pure random*  
  *// return shuffle(archivedWords).slice(0, count);*  
}

function handleArchiveReviewResult(word, correct) {  
  if (\!correct) {  
    word.reviewFailures \= (word.reviewFailures || 0) \+ 1;  
      
    if (word.reviewFailures \>= 2) {  
      unarchiveWord(word.id);  
      console.log(\`⚠️ Unarchived: ${word.de} (failed ${word.reviewFailures} times)\`);  
    }  
  } else {  
    word.reviewFailures \= 0;  
    word.lastReviewDate \= new Date().toISOString().split('T')\[0\];  
  }

}

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

## **Backend API (Node.js \+ Express)**

### **Server Setup (server.js)**

**Complete Implementation:**

javascript  
const express \= require('express');  
const fs \= require('fs').promises;  
const path \= require('path');

const app \= express();  
const PORT \= 3000;  
const DATA\_DIR \= path.join(\_\_dirname, 'data');

app.use(express.json({ limit: '10mb' }));  
app.use(express.static('public'));

*// Ensure data directories exist*  
async function initDataDirs() {  
  const apps \= \['nouns', 'verbs', 'expressions'\];  
    
  for (const appName of apps) {  
    const appDir \= path.join(DATA\_DIR, appName);  
      
    try {  
      await fs.mkdir(appDir, { recursive: true });  
        
      *// Initialize files if they don't exist*  
      const activeFile \= path.join(appDir, 'active.json');  
      const archivedFile \= path.join(appDir, 'archived.json');  
      const metadataFile \= path.join(appDir, 'metadata.json');  
        
      try {  
        await fs.access(activeFile);  
      } catch {  
        await fs.writeFile(activeFile, JSON.stringify({  
          version: "1.0",  
          lastUpdated: new Date().toISOString(),  
          words: \[\]  
        }, null, 2));  
      }  
        
      try {  
        await fs.access(archivedFile);  
      } catch {  
        await fs.writeFile(archivedFile, JSON.stringify({  
          version: "1.0",  
          lastUpdated: new Date().toISOString(),  
          words: \[\]  
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
            startDate: new Date().toISOString().split('T')\[0\],  
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
      console.error(\`Failed to init ${appName}:\`, err);  
    }  
  }  
}

*// Load active words*  
app.get('/api/:app/active', async (req, res) \=\> {  
  const appName \= req.params.app;  
  const file \= path.join(DATA\_DIR, appName, 'active.json');  
    
  try {  
    const data \= await fs.readFile(file, 'utf8');  
    res.json(JSON.parse(data));  
  } catch (err) {  
    res.status(500).json({ error: 'Failed to load active words' });  
  }  
});

*// Load archived words*  
app.get('/api/:app/archived', async (req, res) \=\> {  
  const appName \= req.params.app;  
  const file \= path.join(DATA\_DIR, appName, 'archived.json');  
    
  try {  
    const data \= await fs.readFile(file, 'utf8');  
    res.json(JSON.parse(data));  
  } catch (err) {  
    res.status(500).json({ error: 'Failed to load archived words' });  
  }  
});

*// Load metadata*  
app.get('/api/:app/metadata', async (req, res) \=\> {  
  const appName \= req.params.app;  
  const file \= path.join(DATA\_DIR, appName, 'metadata.json');  
    
  try {  
    const data \= await fs.readFile(file, 'utf8');  
    res.json(JSON.parse(data));  
  } catch (err) {  
    res.status(500).json({ error: 'Failed to load metadata' });  
  }  
});

*// Save active words*  
app.post('/api/:app/active', async (req, res) \=\> {  
  const appName \= req.params.app;  
  const file \= path.join(DATA\_DIR, appName, 'active.json');  
    
  try {  
    req.body.lastUpdated \= new Date().toISOString();  
    await fs.writeFile(file, JSON.stringify(req.body, null, 2));  
    res.json({ success: true });  
  } catch (err) {  
    res.status(500).json({ error: 'Failed to save active words' });  
  }  
});

*// Save archived words*  
app.post('/api/:app/archived', async (req, res) \=\> {  
  const appName \= req.params.app;  
  const file \= path.join(DATA\_DIR, appName, 'archived.json');  
    
  try {  
    req.body.lastUpdated \= new Date().toISOString();  
    await fs.writeFile(file, JSON.stringify(req.body, null, 2));  
    res.json({ success: true });  
  } catch (err) {  
    res.status(500).json({ error: 'Failed to save archived words' });  
  }  
});

*// Save metadata*  
app.post('/api/:app/metadata', async (req, res) \=\> {  
  const appName \= req.params.app;  
  const file \= path.join(DATA\_DIR, appName, 'metadata.json');  
    
  try {  
    await fs.writeFile(file, JSON.stringify(req.body, null, 2));  
    res.json({ success: true });  
  } catch (err) {  
    res.status(500).json({ error: 'Failed to save metadata' });  
  }  
});

*// Trigger archive process*  
app.post('/api/:app/archive', async (req, res) \=\> {  
  const appName \= req.params.app;  
    
  try {  
    const archivedCount \= await runArchiveProcess(appName);  
    res.json({ success: true, archived: archivedCount });  
  } catch (err) {  
    res.status(500).json({ error: 'Archive process failed' });  
  }  
});

*// Export for backup*  
app.get('/api/:app/export', async (req, res) \=\> {  
  const appName \= req.params.app;  
    
  try {  
    const active \= await fs.readFile(path.join(DATA\_DIR, appName, 'active.json'), 'utf8');  
    const archived \= await fs.readFile(path.join(DATA\_DIR, appName, 'archived.json'), 'utf8');  
    const metadata \= await fs.readFile(path.join(DATA\_DIR, appName, 'metadata.json'), 'utf8');  
      
    const exportData \= {  
      active: JSON.parse(active),  
      archived: JSON.parse(archived),  
      metadata: JSON.parse(metadata),  
      exportDate: new Date().toISOString()  
    };  
      
    res.setHeader('Content-Type', 'application/json');  
    res.setHeader('Content-Disposition', \`attachment; filename="${appName}\-backup-${new Date().toISOString().split('T')\[0\]}.json"\`);  
    res.send(JSON.stringify(exportData, null, 2));  
  } catch (err) {  
    res.status(500).json({ error: 'Export failed' });  
  }  
});

*// Archive process helper*  
async function runArchiveProcess(appName) {  
  const activePath \= path.join(DATA\_DIR, appName, 'active.json');  
  const archivedPath \= path.join(DATA\_DIR, appName, 'archived.json');  
  const metadataPath \= path.join(DATA\_DIR, appName, 'metadata.json');  
    
  const activeData \= JSON.parse(await fs.readFile(activePath, 'utf8'));  
  const archivedData \= JSON.parse(await fs.readFile(archivedPath, 'utf8'));  
  const metadata \= JSON.parse(await fs.readFile(metadataPath, 'utf8'));  
    
  const threshold \= metadata.settings.archiveThresholdDays;  
  const today \= new Date();  
    
  const toArchive \= \[\];  
  const remaining \= \[\];  
    
  activeData.words.forEach(word \=\> {  
    if (word.memorized && word.memorizedDate) {  
      const memorizedDate \= new Date(word.memorizedDate);  
      const daysSince \= Math.floor((today \- memorizedDate) / (1000 \* 60 \* 60 \* 24));  
        
      if (daysSince \>= threshold) {  
        const compressed \= {  
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
          totalCorrect: word.attempts.filter(a \=\> a.correct).length,  
          accuracy: word.attempts.filter(a \=\> a.correct).length / word.attempts.length,  
          memorizedDate: word.memorizedDate,  
          archivedDate: new Date().toISOString().split('T')\[0\],  
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
    
  if (toArchive.length \> 0) {  
    archivedData.words.push(...toArchive);  
    activeData.words \= remaining;  
      
    await fs.writeFile(activePath, JSON.stringify(activeData, null, 2));  
    await fs.writeFile(archivedPath, JSON.stringify(archivedData, null, 2));  
      
    metadata.stats.activeWords \= remaining.length;  
    metadata.stats.archivedWords \= archivedData.words.length;  
    metadata.lastArchiveCheck \= new Date().toISOString();  
      
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));  
      
    console.log(\`📦 Archived ${toArchive.length} words for ${appName}\`);  
  }  
    
  return toArchive.length;  
}

*// Start server*  
initDataDirs().then(() \=\> {  
  app.listen(PORT, () \=\> {  
    console.log(\`\\n🚀 German Learning App running at http://localhost:${PORT}\\n\`);  
    console.log('Press Ctrl+C to stop\\n');  
  });  
}).catch(err \=\> {  
  console.error('Failed to initialize:', err);  
  process.exit(1);

});

**Lines of Code:** \~280 lines

---

## **Frontend Architecture**

### **Core: Learning Engine (learning-engine.js)**

**Purpose:** Shared logic for all apps \- data loading, word selection, progress tracking, statistics

**Key Features:**

* Multi-app support  
* Archive-aware  
* Weighted selection  
* Auto-save  
* LocalStorage caching

**Complete Implementation:**

javascript  
class LearningEngine {  
  constructor(appName) {  
    this.appName \= appName;  
    this.activeWords \= \[\];  
    this.archivedWords \= \[\];  
    this.metadata \= {};  
    this.loaded \= false;  
  }  
    
  *// Initialize: Load data from API*  
  async load() {  
    try {  
      const \[active, metadata\] \= await Promise.all(\[  
        fetch(\`/api/${this.appName}/active\`).then(r \=\> r.json()),  
        fetch(\`/api/${this.appName}/metadata\`).then(r \=\> r.json())  
      \]);  
        
      this.activeWords \= active.words;  
      this.metadata \= metadata;  
      this.loaded \= true;  
        
      *// Check if archiving needed (automatic)*  
      await this.checkArchive();  
        
      return true;  
    } catch (err) {  
      console.error('Failed to load data:', err);  
      return false;  
    }  
  }  
    
  *// Load archived words (lazy, only when needed)*  
  async loadArchived() {  
    try {  
      const archived \= await fetch(\`/api/${this.appName}/archived\`).then(r \=\> r.json());  
      this.archivedWords \= archived.words;  
      return true;  
    } catch (err) {  
      console.error('Failed to load archived words:', err);  
      return false;  
    }  
  }  
    
  *// Check and run archive process*  
  async checkArchive() {  
    try {  
      const response \= await fetch(\`/api/${this.appName}/archive\`, {  
        method: 'POST'  
      });  
        
      if (response.ok) {  
        const result \= await response.json();  
        if (result.archived \> 0) {  
          console.log(\`📦 Archived ${result.archived} words\`);  
          await this.load();  *// Reload data*  
        }  
      }  
    } catch (err) {  
      console.warn('Archive check failed:', err);  
    }  
  }  
    
  *// Mode 1: Select words for normal practice*  
  selectForPractice(count) {  
    const learning \= this.activeWords.filter(w \=\> \!w.memorized);  
      
    if (learning.length \=== 0) {  
      return \[\];  
    }  
      
    if (learning.length \<= count) {  
      return learning;  
    }  
      
    return this.weightedSample(learning, count);  
  }  
    
  *// Mode 2: Select recently memorized for review*  
  selectForReview(count) {  
    const memorized \= this.activeWords.filter(w \=\> w.memorized);  
      
    if (memorized.length \=== 0) {  
      return \[\];  
    }  
      
    *// Sort by memorizedDate (oldest first)*  
    return memorized  
      .sort((a, b) \=\> new Date(a.memorizedDate) \- new Date(b.memorizedDate))  
      .slice(0, Math.min(count, memorized.length));  
  }  
    
  *// Mode 3: Select archived words for review*  
  async selectForArchiveReview(count) {  
    await this.loadArchived();  
      
    if (this.archivedWords.length \=== 0) {  
      return \[\];  
    }  
      
    *// Prioritize never-reviewed*  
    const sorted \= this.archivedWords.sort((a, b) \=\> {  
      if (\!a.lastReviewDate && \!b.lastReviewDate) return 0;  
      if (\!a.lastReviewDate) return \-1;  
      if (\!b.lastReviewDate) return 1;  
      return new Date(a.lastReviewDate) \- new Date(b.lastReviewDate);  
    });  
      
    return sorted.slice(0, Math.min(count, this.archivedWords.length));  
  }  
    
  *// Weighted random sampling*  
  weightedSample(words, count) {  
    const weighted \= words.map(word \=\> {  
      let weight \= 1;  
        
      *// Failed recently? 3x*  
      const lastAttempt \= word.attempts?.\[word.attempts.length \- 1\];  
      if (lastAttempt && \!lastAttempt.correct) {  
        weight \*= 3;  
      }  
        
      *// Low streak? 2x*  
      if (word.streak \> 0 && word.streak \<= 2) {  
        weight \*= 2;  
      }  
        
      *// Difficulty*  
      if (word.difficulty \=== 3) weight \*= 2;  
      if (word.difficulty \=== 1) weight \*= 0.5;  
        
      return { word, weight };  
    });  
      
    return this.\_weightedRandomSample(weighted, count);  
  }  
    
  *// Weighted random selection algorithm*  
  \_weightedRandomSample(weightedItems, count) {  
    const selected \= \[\];  
    const available \= \[...weightedItems\];  
      
    for (let i \= 0; i \< count && available.length \> 0; i\++) {  
      const totalWeight \= available.reduce((sum, item) \=\> sum \+ item.weight, 0);  
      let random \= Math.random() \* totalWeight;  
        
      for (let j \= 0; j \< available.length; j\++) {  
        random \-= available\[j\].weight;  
        if (random \<= 0) {  
          selected.push(available\[j\].word);  
          available.splice(j, 1);  
          break;  
        }  
      }  
    }  
      
    return selected;  
  }  
    
  *// Record practice attempt*  
  recordAttempt(wordId, correct, timeMs) {  
    const word \= this.activeWords.find(w \=\> w.id \=== wordId);  
      
    if (\!word) return;  
      
    if (\!word.attempts) word.attempts \= \[\];  
      
    word.attempts.push({  
      date: new Date().toISOString().split('T')\[0\],  
      correct,  
      ms: timeMs  
    });  
      
    if (correct) {  
      word.streak \= (word.streak || 0) \+ 1;  
        
      if (word.streak \>= 5 && \!word.memorized) {  
        word.memorized \= true;  
        word.memorizedDate \= new Date().toISOString().split('T')\[0\];  
        console.log(\`✨ Memorized: ${word.de}\`);  
      }  
    } else {  
      word.streak \= 0;  
    }  
  }  
    
  *// Record archive review attempt*  
  recordArchiveAttempt(wordId, correct) {  
    const word \= this.archivedWords.find(w \=\> w.id \=== wordId);  
      
    if (\!word) return;  
      
    word.lastReviewDate \= new Date().toISOString().split('T')\[0\];  
      
    if (\!correct) {  
      word.reviewFailures \= (word.reviewFailures || 0) \+ 1;  
        
      if (word.reviewFailures \>= this.metadata.settings.unarchiveFailureThreshold) {  
        this.unarchiveWord(wordId);  
        return true;  *// Signal unarchive*  
      }  
    } else {  
      word.reviewFailures \= 0;  
    }  
      
    return false;  
  }  
    
  *// Unarchive word (move back to active)*  
  async unarchiveWord(wordId) {  
    const word \= this.archivedWords.find(w \=\> w.id \=== wordId);  
      
    if (\!word) return;  
      
    *// Decompress: restore full structure*  
    const restored \= {  
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
      attempts: \[{  
        date: new Date().toISOString().split('T')\[0\],  
        correct: false,  
        ms: 0  
      }\],  
      streak: 0,  
      memorized: false,  
      memorizedDate: null  
    };  
      
    this.activeWords.push(restored);  
    this.archivedWords \= this.archivedWords.filter(w \=\> w.id \!== wordId);  
      
    await this.save();  
      
    console.log(\`⚠️ Unarchived: ${word.de} (failed review)\`);  
  }  
    
  *// Save all data*  
  async save() {  
    try {  
      await Promise.all(\[  
        fetch(\`/api/${this.appName}/active\`, {  
          method: 'POST',  
          headers: { 'Content-Type': 'application/json' },  
          body: JSON.stringify({  
            version: '1.0',  
            words: this.activeWords  
          })  
        }),  
        fetch(\`/api/${this.appName}/archived\`, {  
          method: 'POST',  
          headers: { 'Content-Type': 'application/json' },  
          body: JSON.stringify({  
            version: '1.0',  
            words: this.archivedWords  
          })  
        })  
      \]);  
        
      return true;  
    } catch (err) {  
      console.error('Save failed:', err);  
      return false;  
    }  
  }  
    
  *// Calculate statistics*  
  getStats() {  
    const learning \= this.activeWords.filter(w \=\> \!w.memorized);  
    const memorized \= this.activeWords.filter(w \=\> w.memorized);  
      
    const allAttempts \= this.activeWords.flatMap(w \=\> w.attempts || \[\]);  
    const totalAttempts \= allAttempts.length;  
    const totalCorrect \= allAttempts.filter(a \=\> a.correct).length;  
      
    return {  
      total: this.metadata.stats.totalWords,  
      active: this.activeWords.length,  
      learning: learning.length,  
      memorized: memorized.length,  
      archived: this.metadata.stats.archivedWords,  
      totalAttempts,  
      accuracy: totalAttempts \> 0 ? totalCorrect / totalAttempts : 0,  
      currentStreak: this.metadata.stats.currentStreak,  
      longestStreak: this.metadata.stats.longestStreak  
    };  
  }  
    
  *// Update session stats*  
  async updateSessionStats(sessionResults) {  
    const correct \= sessionResults.filter(r \=\> r).length;  
    const total \= sessionResults.length;  
      
    this.metadata.stats.totalSessions \+= 1;  
    this.metadata.stats.totalCards \+= total;  
      
    *// Update overall accuracy (running average)*  
    const oldTotal \= this.metadata.stats.totalCards \- total;  
    const oldAccuracy \= this.metadata.stats.overallAccuracy;  
    this.metadata.stats.overallAccuracy \=   
      (oldAccuracy \* oldTotal \+ correct) / this.metadata.stats.totalCards;  
      
    *// Update word counts*  
    this.metadata.stats.activeWords \= this.activeWords.length;  
    this.metadata.stats.memorizedWords \= this.activeWords.filter(w \=\> w.memorized).length;  
      
    await fetch(\`/api/${this.appName}/metadata\`, {  
      method: 'POST',  
      headers: { 'Content-Type': 'application/json' },  
      body: JSON.stringify(this.metadata)  
    });  
  }

}

**Lines of Code:** \~320 lines

---

### **Utility Functions (utils.js)**

**Purpose:** Common helper functions used across all apps

**Implementation:**

javascript  
*// Levenshtein distance for typo tolerance*  
function levenshtein(a, b) {  
  const matrix \= \[\];  
    
  for (let i \= 0; i \<= b.length; i\++) {  
    matrix\[i\] \= \[i\];  
  }  
    
  for (let j \= 0; j \<= a.length; j\++) {  
    matrix\[0\]\[j\] \= j;  
  }  
    
  for (let i \= 1; i \<= b.length; i\++) {  
    for (let j \= 1; j \<= a.length; j\++) {  
      if (b.charAt(i \- 1) \=== a.charAt(j \- 1)) {  
        matrix\[i\]\[j\] \= matrix\[i \- 1\]\[j \- 1\];  
      } else {  
        matrix\[i\]\[j\] \= Math.min(  
          matrix\[i \- 1\]\[j \- 1\] \+ 1,  
          matrix\[i\]\[j \- 1\] \+ 1,  
          matrix\[i \- 1\]\[j\] \+ 1  
        );  
      }  
    }  
  }  
    
  return matrix\[b.length\]\[a.length\];  
}

*// Normalize input for comparison*  
function normalizeInput(text) {  
  return text  
    .toLowerCase()  
    .trim()  
    .replace(/^(the|a|an|o|a|os|as)\\s+/i, '')  *// Remove articles*  
    .replace(/\\s+/g, ' ');  *// Normalize spaces*  
}

*// Check if answer is correct (with typo tolerance)*  
function isCorrectAnswer(userInput, correctAnswers) {  
  const normalized \= normalizeInput(userInput);  
    
  return correctAnswers.some(answer \=\> {  
    const normalizedAnswer \= normalizeInput(answer);  
      
    *// Exact match*  
    if (normalized \=== normalizedAnswer) return true;  
      
    *// Typo tolerance: 1 character difference*  
    if (levenshtein(normalized, normalizedAnswer) \<= 1) return true;  
      
    return false;  
  });  
}

*// Shuffle array (Fisher-Yates)*  
function shuffle(array) {  
  const shuffled \= \[...array\];  
  for (let i \= shuffled.length \- 1; i \> 0; i\--) {  
    const j \= Math.floor(Math.random() \* (i \+ 1));  
    \[shuffled\[i\], shuffled\[j\]\] \= \[shuffled\[j\], shuffled\[i\]\];  
  }  
  return shuffled;  
}

*// Format time (ms to seconds)*  
function formatTime(ms) {  
  const seconds \= Math.floor(ms / 1000);  
  if (seconds \< 60) return \`${seconds}s\`;  
  const minutes \= Math.floor(seconds / 60);  
  const remainingSeconds \= seconds % 60;  
  return \`${minutes}m ${remainingSeconds}s\`;  
}

*// Calculate days between dates*  
function daysBetween(date1, date2) {  
  const oneDay \= 1000 \* 60 \* 60 \* 24;  
  const diff \= Math.abs(date2 \- date1);  
  return Math.floor(diff / oneDay);  
}

*// Get today's date (ISO format)*  
function todayISO() {  
  return new Date().toISOString().split('T')\[0\];  
}

*// Debounce function*  
function debounce(func, wait) {  
  let timeout;  
  return function executedFunction(...args) {  
    const later \= () \=\> {  
      clearTimeout(timeout);  
      func(...args);  
    };  
    clearTimeout(timeout);  
    timeout \= setTimeout(later, wait);  
  };

}

**Lines of Code:** \~100 lines

---

### **App Launcher (index.html \+ launcher.js)**

**Purpose:** Multi-app selection screen

**index.html:**

html  
\<\!DOCTYPE html\>  
\<html lang\="en"\>  
\<head\>  
  \<meta charset\="UTF-8"\>  
  \<meta name\="viewport" content\="width=device-width, initial-scale=1.0"\>  
  \<title\>German Learning\</title\>  
  \<link rel\="stylesheet" href\="style.css"\>  
\</head\>  
\<body\>  
  \<div class\="launcher"\>  
    \<header class\="launcher\_\_header"\>  
      \<h1 class\="launcher\_\_title"\>German Learning\</h1\>  
      \<p class\="launcher\_\_subtitle"\>Choose your practice mode\</p\>  
    \</header\>  
      
    \<div class\="launcher\_\_apps"\>  
      \<a href\="apps/nouns/nouns.html" class\="launcher\_\_app launcher\_\_app--nouns"\>  
        \<div class\="launcher\_\_app-icon"\>📚\</div\>  
        \<h2 class\="launcher\_\_app-name"\>Nouns\</h2\>  
        \<p class\="launcher\_\_app-desc"\>Articles, plurals, vocabulary\</p\>  
        \<div class\="launcher\_\_app-stats" id\="nouns-stats"\>Loading...\</div\>  
      \</a\>  
        
      \<div class\="launcher\_\_app launcher\_\_app--disabled" title\="Coming soon"\>  
        \<div class\="launcher\_\_app-icon"\>🏃\</div\>  
        \<h2 class\="launcher\_\_app-name"\>Verbs\</h2\>  
        \<p class\="launcher\_\_app-desc"\>Conjugations, tenses\</p\>  
        \<div class\="launcher\_\_app-stats"\>Coming soon\</div\>  
      \</div\>  
        
      \<div class\="launcher\_\_app launcher\_\_app--disabled" title\="Coming soon"\>  
        \<div class\="launcher\_\_app-icon"\>💬\</div\>  
        \<h2 class\="launcher\_\_app-name"\>Expressions\</h2\>  
        \<p class\="launcher\_\_app-desc"\>Common phrases, idioms\</p\>  
        \<div class\="launcher\_\_app-stats"\>Coming soon\</div\>  
      \</div\>  
    \</div\>  
  \</div\>  
    
  \<script src\="core/learning-engine.js"\>\</script\>  
  \<script src\="core/utils.js"\>\</script\>  
  \<script src\="launcher.js"\>\</script\>  
\</body\>

\</html\>

**launcher.js:**

javascript  
async function loadAppStats() {  
  try {  
    const response \= await fetch('/api/nouns/metadata');  
    const metadata \= await response.json();  
      
    const statsEl \= document.getElementById('nouns-stats');  
    statsEl.textContent \= \`${metadata.stats.memorizedWords} memorized • ${metadata.stats.activeWords} active\`;  
  } catch (err) {  
    console.error('Failed to load stats:', err);  
  }  
}

loadAppStats();

**Lines of Code:** \~60 lines HTML \+ \~15 lines JS

---

### **Nouns App (Phase 1 \- Full Implementation)**

#### **nouns.html**

html  
\<\!DOCTYPE html\>  
\<html lang\="en"\>  
\<head\>  
  \<meta charset\="UTF-8"\>  
  \<meta name\="viewport" content\="width=device-width, initial-scale=1.0"\>  
  \<title\>Nouns Practice\</title\>  
  \<link rel\="stylesheet" href\="../../style.css"\>  
  \<link rel\="stylesheet" href\="nouns.css"\>  
\</head\>  
\<body\>  
  *\<\!-- Home Screen \--\>*  
  \<div id\="home-screen" class\="screen"\>  
    \<div class\="noun-home"\>  
      \<header class\="noun-home\_\_header"\>  
        \<a href\="../../index.html" class\="noun-home\_\_back"\>← Back\</a\>  
        \<h1 class\="noun-home\_\_title"\>Noun Practice\</h1\>  
      \</header\>  
        
      \<div class\="noun-home\_\_stats"\>  
        \<div class\="stat"\>  
          \<div class\="stat\_\_value" id\="learning-count"\>-\</div\>  
          \<div class\="stat\_\_label"\>Learning\</div\>  
        \</div\>  
        \<div class\="stat"\>  
          \<div class\="stat\_\_value" id\="memorized-count"\>-\</div\>  
          \<div class\="stat\_\_label"\>Recently Memorized\</div\>  
        \</div\>  
        \<div class\="stat"\>  
          \<div class\="stat\_\_value" id\="archived-count"\>-\</div\>  
          \<div class\="stat\_\_label"\>Archived\</div\>  
        \</div\>  
      \</div\>  
        
      \<div class\="noun-home\_\_modes"\>  
        \<button class\="button button--primary button--large" id\="start-practice"\>  
          Practice New Words (15 cards)  
        \</button\>  
          
        \<button class\="button button--large" id\="start-review"\>  
          Review Recently Memorized (10 cards)  
        \</button\>  
          
        \<button class\="button button--large" id\="start-archive-review"\>  
          Review Archive (10 cards)  
        \</button\>  
      \</div\>  
        
      \<div class\="noun-home\_\_actions"\>  
        \<button class\="button button--secondary" id\="view-stats"\>View Statistics\</button\>  
        \<button class\="button button--secondary" id\="export-data"\>Export Backup\</button\>  
      \</div\>  
    \</div\>  
  \</div\>  
    
  *\<\!-- Practice Screen \--\>*  
  \<div id\="practice-screen" class\="screen screen--hidden"\>  
    \<div class\="session"\>  
      \<header class\="session\_\_header"\>  
        \<button class\="session\_\_quit" id\="quit-session"\>✕ Quit\</button\>  
        \<div class\="session\_\_mode" id\="session-mode"\>Practice\</div\>  
      \</header\>  
        
      \<div class\="session\_\_card-container"\>  
        \<div id\="card" class\="card"\>  
          *\<\!-- Card content inserted by JS \--\>*  
        \</div\>  
      \</div\>  
        
      \<div class\="progress-container"\>  
        \<div class\="progress-container\_\_label" id\="progress-label"\>Card 1 of 15\</div\>  
        \<div class\="progress-container\_\_bar"\>  
          \<div class\="progress-container\_\_fill" id\="progress-fill"\>\</div\>  
        \</div\>  
      \</div\>  
    \</div\>  
  \</div\>  
    
  *\<\!-- Results Screen \--\>*  
  \<div id\="results-screen" class\="screen screen--hidden"\>  
    \<div class\="results"\>  
      \<h1 class\="results\_\_title"\>Session Complete\!\</h1\>  
        
      \<div class\="results\_\_score"\>  
        \<div class\="results\_\_score-number" id\="score-number"\>12 out of 15\</div\>  
        \<div class\="results\_\_accuracy" id\="accuracy"\>80%\</div\>  
      \</div\>  
        
      \<div class\="results\_\_message" id\="results-message"\>Great job\! 👏\</div\>  
        
      \<div class\="results\_\_actions"\>  
        \<button class\="button button--primary" id\="try-again"\>Try Again\</button\>  
        \<button class\="button" id\="return-home"\>Return to Home\</button\>  
      \</div\>  
    \</div\>  
  \</div\>  
    
  *\<\!-- Statistics Screen \--\>*  
  \<div id\="stats-screen" class\="screen screen--hidden"\>  
    \<div class\="stats"\>  
      \<header class\="stats\_\_header"\>  
        \<button class\="stats\_\_back" id\="stats-back"\>← Back\</button\>  
        \<h1 class\="stats\_\_title"\>Statistics\</h1\>  
      \</header\>  
        
      \<div class\="stats\_\_metrics"\>  
        \<div class\="stats\_\_metric"\>  
          \<div class\="stats\_\_metric-label"\>Current Streak\</div\>  
          \<div class\="stats\_\_metric-value" id\="current-streak"\>-\</div\>  
        \</div\>  
        \<div class\="stats\_\_metric"\>  
          \<div class\="stats\_\_metric-label"\>Longest Streak\</div\>  
          \<div class\="stats\_\_metric-value" id\="longest-streak"\>-\</div\>  
        \</div\>  
        \<div class\="stats\_\_metric"\>  
          \<div class\="stats\_\_metric-label"\>Overall Accuracy\</div\>  
          \<div class\="stats\_\_metric-value" id\="overall-accuracy"\>-\</div\>  
        \</div\>  
        \<div class\="stats\_\_metric"\>  
          \<div class\="stats\_\_metric-label"\>Total Sessions\</div\>  
          \<div class\="stats\_\_metric-value" id\="total-sessions"\>-\</div\>  
        \</div\>  
      \</div\>  
        
      *\<\!-- Calendar placeholder \--\>*  
      \<div class\="stats\_\_calendar" id\="calendar"\>  
        *\<\!-- Calendar generated by JS \--\>*  
      \</div\>  
    \</div\>  
  \</div\>  
    
  \<script src\="../../core/learning-engine.js"\>\</script\>  
  \<script src\="../../core/utils.js"\>\</script\>  
  \<script src\="nouns.js"\>\</script\>  
\</body\>

\</html\>

**Lines of Code:** \~150 lines

---

#### **nouns.js (Core Logic)**

javascript  
*// Global state*  
let engine;  
let currentSession \= \[\];  
let currentCardIndex \= 0;  
let sessionResults \= \[\];  
let sessionMode \= 'practice';  *// 'practice', 'review', 'archive'*  
let cardStartTime \= 0;

*// Initialize*  
async function init() {  
  showScreen('home-screen');  
    
  engine \= new LearningEngine('nouns');  
  const loaded \= await engine.load();  
    
  if (\!loaded) {  
    alert('Failed to load data. Please refresh.');  
    return;  
  }  
    
  updateHomeStats();  
  attachEventListeners();  
}

*// Update home screen stats*  
function updateHomeStats() {  
  const stats \= engine.getStats();  
    
  document.getElementById('learning-count').textContent \= stats.learning;  
  document.getElementById('memorized-count').textContent \= stats.memorized;  
  document.getElementById('archived-count').textContent \= stats.archived;  
    
  *// Disable buttons if no words available*  
  document.getElementById('start-practice').disabled \= stats.learning \=== 0;  
  document.getElementById('start-review').disabled \= stats.memorized \=== 0;  
  document.getElementById('start-archive-review').disabled \= stats.archived \=== 0;  
}

*// Event listeners*  
function attachEventListeners() {  
  document.getElementById('start-practice').addEventListener('click', () \=\> startSession('practice', 15));  
  document.getElementById('start-review').addEventListener('click', () \=\> startSession('review', 10));  
  document.getElementById('start-archive-review').addEventListener('click', () \=\> startSession('archive', 10));  
  document.getElementById('view-stats').addEventListener('click', showStatistics);  
  document.getElementById('export-data').addEventListener('click', exportData);  
  document.getElementById('quit-session').addEventListener('click', quitSession);  
  document.getElementById('try-again').addEventListener('click', () \=\> startSession(sessionMode, currentSession.length));  
  document.getElementById('return-home').addEventListener('click', returnHome);  
  document.getElementById('stats-back').addEventListener('click', returnHome);  
}

*// Start practice session*  
async function startSession(mode, count) {  
  sessionMode \= mode;  
  currentCardIndex \= 0;  
  sessionResults \= \[\];  
    
  *// Select words based on mode*  
  if (mode \=== 'practice') {  
    currentSession \= engine.selectForPractice(count);  
  } else if (mode \=== 'review') {  
    currentSession \= engine.selectForReview(count);  
  } else if (mode \=== 'archive') {  
    currentSession \= await engine.selectForArchiveReview(count);  
  }  
    
  if (currentSession.length \=== 0) {  
    alert('No words available for this mode.');  
    return;  
  }  
    
  *// Update session header*  
  const modeNames \= {  
    'practice': 'Practice',  
    'review': 'Review Recently Memorized',  
    'archive': 'Archive Review'  
  };  
  document.getElementById('session-mode').textContent \= modeNames\[mode\];  
    
  showScreen('practice-screen');  
  showCard(currentSession\[currentCardIndex\]);  
}

*// Show card*  
function showCard(word) {  
  const card \= document.getElementById('card');  
  const genderClass \= word.article \=== 'der' ? 'masculine' :   
                      word.article \=== 'die' ? 'feminine' : 'neutral';  
    
  card.className \= \`card card--${genderClass}\`;  
  card.innerHTML \= \`  
    \<div class="card\_\_front"\>  
      \<div class="card\_\_word"\>${word.article} ${word.de}\</div\>  
      \<div class="card\_\_plural"\>${word.plural}\</div\>  
      \<input   
        type="text"   
        class="card\_\_input"   
        id="answer-input"   
        placeholder="Type translation..."  
        autocomplete="off"  
        autocorrect="off"  
        autocapitalize="off"  
        spellcheck="false"  
      /\>  
      \<button class="button button--primary" id="check-answer"\>Check\</button\>  
    \</div\>  
  \`;  
    
  *// Focus input*  
  const input \= document.getElementById('answer-input');  
  input.focus();  
    
  *// Event listeners*  
  document.getElementById('check-answer').addEventListener('click', checkAnswer);  
  input.addEventListener('keypress', (e) \=\> {  
    if (e.key \=== 'Enter') checkAnswer();  
  });  
    
  *// Update progress bar*  
  updateProgressBar();  
    
  *// Start timer*  
  cardStartTime \= Date.now();  
}

*// Check answer*  
function checkAnswer() {  
  const input \= document.getElementById('answer-input');  
  const userAnswer \= input.value.trim();  
    
  if (\!userAnswer) {  
    input.focus();  
    return;  
  }  
    
  const word \= currentSession\[currentCardIndex\];  
  const allAnswers \= \[...word.en, ...word.pt\];  
  const correct \= isCorrectAnswer(userAnswer, allAnswers);  
    
  const timeMs \= Date.now() \- cardStartTime;  
    
  *// Record attempt*  
  if (sessionMode \=== 'archive') {  
    const unarchived \= engine.recordArchiveAttempt(word.id, correct);  
    if (unarchived) {  
      alert(\`⚠️ Word unarchived: ${word.de}\\nYou'll see it in normal practice now.\`);  
    }  
  } else {  
    engine.recordAttempt(word.id, correct, timeMs);  
  }  
    
  sessionResults.push(correct);  
    
  *// Show feedback*  
  showCardBack(word, correct);  
}

*// Show card back with feedback*  
function showCardBack(word, correct) {  
  const card \= document.getElementById('card');  
    
  *// Animate shake*  
  card.classList.add(correct ? 'card--shake-correct' : 'card--shake-incorrect');  
    
  setTimeout(() \=\> {  
    card.classList.remove('card--shake-correct', 'card--shake-incorrect');  
      
    *// Show back of card*  
    card.innerHTML \= \`  
      \<div class="card-back"\>  
        \<div class="card-back\_\_header"\>  
          \<div class="card-back\_\_word"\>${word.article} ${word.de} → ${word.plural}\</div\>  
          \<div class="card-back\_\_result ${correct ? 'correct' : 'incorrect'}"\>  
            ${correct ? '✓ Correct' : '✗ Incorrect'}  
          \</div\>  
        \</div\>  
          
        \<div class="card-back\_\_translations"\>  
          \<strong\>Translations:\</strong\>\<br\>  
          ${word.en.join(', ')}\<br\>  
          ${word.pt.join(', ')}  
        \</div\>  
          
        ${word.warning ? \`\<div class="card-back\_\_warning"\>⚠️ ${word.warning}\</div\>\` : ''}  
          
        \<div class="card-back\_\_example"\>  
          \<strong\>Example:\</strong\>\<br\>  
          ${word.example}\<br\>  
          \<em\>(${word.examplePt})\</em\>  
        \</div\>  
          
        \<button class="button button--primary button--large" id="next-card"\>  
          ${currentCardIndex \< currentSession.length \- 1 ? 'Next Card →' : 'Finish'}  
        \</button\>  
      \</div\>  
    \`;  
      
    document.getElementById('next-card').addEventListener('click', nextCard);  
    document.getElementById('next-card').focus();  
  }, 500);  
}

*// Next card or finish session*  
async function nextCard() {  
  currentCardIndex\++;  
    
  if (currentCardIndex \< currentSession.length) {  
    showCard(currentSession\[currentCardIndex\]);  
  } else {  
    await finishSession();  
  }  
}

*// Finish session*  
async function finishSession() {  
  *// Save data*  
  await engine.save();  
  await engine.updateSessionStats(sessionResults);  
    
  *// Show results*  
  showResults();  
}

*// Show results screen*  
function showResults() {  
  const correct \= sessionResults.filter(r \=\> r).length;  
  const total \= sessionResults.length;  
  const accuracy \= Math.round((correct / total) \* 100);  
    
  document.getElementById('score-number').textContent \= \`${correct} out of ${total} correct\`;  
  document.getElementById('accuracy').textContent \= \`${accuracy}%\`;  
    
  *// Message based on performance*  
  let message \= '';  
  if (correct \>= total \- 2) message \= 'Excellent\! 🌟';  
  else if (correct \>= total \- 5) message \= 'Great job\! 👏';  
  else if (correct \>= total \- 8) message \= 'Good effort\! 💪';  
  else message \= 'Keep practicing\! 📚';  
    
  document.getElementById('results-message').textContent \= message;  
    
  showScreen('results-screen');  
}

*// Update progress bar*  
function updateProgressBar() {  
  const current \= currentCardIndex \+ 1;  
  const total \= currentSession.length;  
  const percentage \= (current / total) \* 100;  
    
  document.getElementById('progress-label').textContent \= \`Card ${current} of ${total}\`;  
  document.getElementById('progress-fill').style.width \= \`${percentage}%\`;  
}

*// Show statistics*  
async function showStatistics() {  
  const stats \= engine.getStats();  
    
  document.getElementById('current-streak').textContent \= \`${stats.currentStreak} days\`;  
  document.getElementById('longest-streak').textContent \= \`${stats.longestStreak} days\`;  
  document.getElementById('overall-accuracy').textContent \= \`${Math.round(stats.accuracy \* 100)}%\`;  
  document.getElementById('total-sessions').textContent \= engine.metadata.stats.totalSessions;  
    
  *// TODO: Generate calendar visualization*  
    
  showScreen('stats-screen');  
}

*// Export data*  
async function exportData() {  
  try {  
    const response \= await fetch('/api/nouns/export');  
    const blob \= await response.blob();  
    const url \= window.URL.createObjectURL(blob);  
    const a \= document.createElement('a');  
    a.href \= url;  
    a.download \= \`nouns-backup-${todayISO()}.json\`;  
    document.body.appendChild(a);  
    a.click();  
    window.URL.revokeObjectURL(url);  
    document.body.removeChild(a);  
  } catch (err) {  
    alert('Export failed. Please try again.');  
    console.error('Export error:', err);  
  }  
}

*// Quit session*  
function quitSession() {  
  if (confirm('Quit session? Progress will be saved.')) {  
    engine.save();  
    returnHome();  
  }  
}

*// Return to home*  
function returnHome() {  
  updateHomeStats();  
  showScreen('home-screen');  
}

*// Show screen helper*  
function showScreen(screenId) {  
  document.querySelectorAll('.screen').forEach(screen \=\> {  
    screen.classList.add('screen--hidden');  
  });  
  document.getElementById(screenId).classList.remove('screen--hidden');  
}

*// Start app*

init();

**Lines of Code:** \~400 lines

---

## **Styling (CSS)**

### **Global Styles (style.css)**

**Purpose:** Shared styles across all apps

css  
*/\* Reset \*/*  
\* {  
  margin: 0;  
  padding: 0;  
  box-sizing: border-box;  
}

*/\* Variables \*/*  
:root {  
  \--color-primary: \#4CAF50;  
  \--color-secondary: \#2196F3;  
  \--color-danger: \#F44336;  
    
  \--color-masculine: \#2196F3;  
  \--color-feminine: \#F44336;  
  \--color-neutral: \#4CAF50;  
    
  \--color-text: \#212121;  
  \--color-text-secondary: \#757575;  
  \--color-background: \#fafafa;  
  \--color-surface: \#ffffff;  
  \--color-border: \#e0e0e0;  
    
  \--spacing-xs: 8px;  
  \--spacing-sm: 16px;  
  \--spacing-md: 24px;  
  \--spacing-lg: 32px;  
  \--spacing-xl: 48px;  
    
  \--font-family: \-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;  
    
  \--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);  
  \--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);  
  \--shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15);  
}

*/\* Base \*/*  
body {  
  font-family: var(\--font-family);  
  color: var(\--color-text);  
  background-color: var(\--color-background);  
  line-height: 1.6;  
}

*/\* Utility \*/*  
.screen {  
  min-height: 100vh;  
  display: flex;  
  align-items: center;  
  justify-content: center;  
  padding: var(\--spacing-md);  
}

.screen--hidden {  
  display: none;  
}

*/\* Buttons \*/*  
.button {  
  padding: 12px 24px;  
  font-size: 16px;  
  font-weight: 600;  
  border: 2px solid var(\--color-border);  
  border-radius: 8px;  
  background: var(\--color-surface);  
  color: var(\--color-text);  
  cursor: pointer;  
  transition: all 0.2s;  
}

.button:hover {  
  transform: translateY(\-2px);  
  box-shadow: var(\--shadow-md);  
}

.button:active {  
  transform: translateY(0);  
}

.button:disabled {  
  opacity: 0.5;  
  cursor: not-allowed;  
}

.button--primary {  
  background: var(\--color-primary);  
  border-color: var(\--color-primary);  
  color: white;  
}

.button--secondary {  
  background: var(\--color-secondary);  
  border-color: var(\--color-secondary);  
  color: white;  
}

.button--large {  
  padding: 16px 32px;  
  font-size: 18px;  
  width: 100%;  
  max-width: 400px;  
  margin: var(\--spacing-sm) 0;  
}

*/\* Launcher \*/*  
.launcher {  
  max-width: 900px;  
  width: 100%;  
  text-align: center;  
}

.launcher\_\_header {  
  margin-bottom: var(\--spacing-xl);  
}

.launcher\_\_title {  
  font-size: 48px;  
  margin-bottom: var(\--spacing-sm);  
}

.launcher\_\_subtitle {  
  font-size: 18px;  
  color: var(\--color-text-secondary);  
}

.launcher\_\_apps {  
  display: grid;  
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));  
  gap: var(\--spacing-md);  
  margin-top: var(\--spacing-lg);  
}

.launcher\_\_app {  
  background: var(\--color-surface);  
  border: 2px solid var(\--color-border);  
  border-radius: 12px;  
  padding: var(\--spacing-lg);  
  text-decoration: none;  
  color: var(\--color-text);  
  transition: all 0.3s;  
  cursor: pointer;  
}

.launcher\_\_app:hover {  
  transform: translateY(\-4px);  
  box-shadow: var(\--shadow-lg);  
  border-color: var(\--color-primary);  
}

.launcher\_\_app--disabled {  
  opacity: 0.5;  
  cursor: not-allowed;  
}

.launcher\_\_app--disabled:hover {  
  transform: none;  
  box-shadow: none;  
  border-color: var(\--color-border);  
}

.launcher\_\_app-icon {  
  font-size: 48px;  
  margin-bottom: var(\--spacing-sm);  
}

.launcher\_\_app-name {  
  font-size: 24px;  
  margin-bottom: var(\--spacing-xs);  
}

.launcher\_\_app-desc {  
  font-size: 14px;  
  color: var(\--color-text-secondary);  
  margin-bottom: var(\--spacing-sm);  
}

.launcher\_\_app-stats {  
  font-size: 12px;  
  color: var(\--color-text-secondary);  
  font-weight: 600;

}

**Lines of Code:** \~200 lines

---

### **Noun-Specific Styles (nouns.css)**

css  
*/\* Noun Home \*/*  
.noun-home {  
  max-width: 600px;  
  width: 100%;  
}

.noun-home\_\_header {  
  display: flex;  
  align-items: center;  
  justify-content: space-between;  
  margin-bottom: var(\--spacing-lg);  
}

.noun-home\_\_back {  
  color: var(\--color-primary);  
  text-decoration: none;  
  font-weight: 600;  
}

.noun-home\_\_title {  
  font-size: 32px;  
}

.noun-home\_\_stats {  
  display: grid;  
  grid-template-columns: repeat(3, 1fr);  
  gap: var(\--spacing-md);  
  margin-bottom: var(\--spacing-xl);  
}

.stat {  
  background: var(\--color-surface);  
  padding: var(\--spacing-md);  
  border-radius: 8px;  
  box-shadow: var(\--shadow-sm);  
  text-align: center;  
}

.stat\_\_value {  
  font-size: 32px;  
  font-weight: 700;  
  color: var(\--color-primary);  
}

.stat\_\_label {  
  font-size: 14px;  
  color: var(\--color-text-secondary);  
  margin-top: var(\--spacing-xs);  
}

.noun-home\_\_modes {  
  display: flex;  
  flex-direction: column;  
  align-items: center;  
  margin-bottom: var(\--spacing-lg);  
}

.noun-home\_\_actions {  
  display: flex;  
  gap: var(\--spacing-sm);  
  justify-content: center;  
}

*/\* Session \*/*  
.session {  
  max-width: 600px;  
  width: 100%;  
  position: relative;  
}

.session\_\_header {  
  display: flex;  
  justify-content: space-between;  
  align-items: center;  
  margin-bottom: var(\--spacing-lg);  
}

.session\_\_quit {  
  background: none;  
  border: none;  
  font-size: 18px;  
  color: var(\--color-text-secondary);  
  cursor: pointer;  
  padding: var(\--spacing-xs);  
}

.session\_\_mode {  
  font-size: 18px;  
  font-weight: 600;  
  color: var(\--color-primary);  
}

.session\_\_card-container {  
  margin-bottom: 120px;  
  min-height: 400px;  
  display: flex;  
  align-items: center;  
  justify-content: center;  
}

*/\* Card \*/*  
.card {  
  background: var(\--color-surface);  
  border-radius: 16px;  
  padding: var(\--spacing-xl);  
  box-shadow: var(\--shadow-lg);  
  width: 100%;  
  max-width: 500px;  
  transition: all 0.3s;  
}

.card--masculine {  
  background: linear-gradient(135deg, \#2196F3 0%, \#1976D2 100%);  
  color: white;  
}

.card--feminine {  
  background: linear-gradient(135deg, \#F44336 0%, \#D32F2F 100%);  
  color: white;  
}

.card--neutral {  
  background: linear-gradient(135deg, \#4CAF50 0%, \#388E3C 100%);  
  color: white;  
}

.card\_\_front {  
  text-align: center;  
}

.card\_\_word {  
  font-size: 48px;  
  font-weight: 700;  
  margin-bottom: var(\--spacing-sm);  
}

.card\_\_plural {  
  font-size: 24px;  
  opacity: 0.8;  
  margin-bottom: var(\--spacing-xl);  
}

.card\_\_input {  
  width: 100%;  
  padding: 16px;  
  font-size: 18px;  
  border: 2px solid rgba(255, 255, 255, 0.3);  
  border-radius: 8px;  
  background: rgba(255, 255, 255, 0.1);  
  color: white;  
  margin-bottom: var(\--spacing-md);  
}

.card\_\_input::placeholder {  
  color: rgba(255, 255, 255, 0.5);  
}

.card\_\_input:focus {  
  outline: none;  
  border-color: rgba(255, 255, 255, 0.8);  
  background: rgba(255, 255, 255, 0.2);  
}

*/\* Card Back \*/*  
.card-back {  
  color: var(\--color-text);  
}

.card-back\_\_header {  
  margin-bottom: var(\--spacing-md);  
  padding-bottom: var(\--spacing-md);  
  border-bottom: 2px solid var(\--color-border);  
}

.card-back\_\_word {  
  font-size: 24px;  
  font-weight: 700;  
}

.card-back\_\_result {  
  font-size: 18px;  
  font-weight: 600;  
  margin-top: var(\--spacing-xs);  
}

.card-back\_\_result.correct {  
  color: var(\--color-primary);  
}

.card-back\_\_result.incorrect {  
  color: var(\--color-danger);  
}

.card-back\_\_translations {  
  margin-bottom: var(\--spacing-md);  
  padding: var(\--spacing-md);  
  background: var(\--color-background);  
  border-radius: 8px;  
}

.card-back\_\_warning {  
  margin-bottom: var(\--spacing-md);  
  padding: var(\--spacing-sm);  
  background: \#FFF3CD;  
  border-left: 4px solid \#FFC107;  
  border-radius: 4px;  
  color: \#856404;  
}

.card-back\_\_example {  
  margin-bottom: var(\--spacing-lg);  
  padding: var(\--spacing-md);  
  background: var(\--color-background);  
  border-radius: 8px;  
}

*/\* Animations \*/*  
@keyframes shake-correct {  
  0%, 100% { transform: translateX(0); }  
  10%, 30%, 50%, 70%, 90% { transform: translateX(\-5px); }  
  20%, 40%, 60%, 80% { transform: translateX(5px); }  
}

@keyframes shake-incorrect {  
  0%, 100% { transform: translateX(0); }  
  10%, 30%, 50%, 70%, 90% { transform: translateX(\-8px); }  
  20%, 40%, 60%, 80% { transform: translateX(8px); }  
}

.card--shake-correct {  
  animation: shake-correct 0.5s ease-in-out;  
}

.card--shake-incorrect {  
  animation: shake-incorrect 0.6s ease-in-out;  
}

*/\* Progress Bar \*/*  
.progress-container {  
  position: fixed;  
  bottom: 0;  
  left: 0;  
  right: 0;  
  padding: var(\--spacing-md) var(\--spacing-lg);  
  background: var(\--color-surface);  
  border-top: 1px solid var(\--color-border);  
  box-shadow: 0 \-2px 8px rgba(0, 0, 0, 0.1);  
  z-index: 100;  
}

.progress-container\_\_label {  
  text-align: center;  
  font-size: 14px;  
  font-weight: 600;  
  color: var(\--color-text);  
  margin-bottom: var(\--spacing-xs);  
}

.progress-container\_\_bar {  
  width: 100%;  
  max-width: 600px;  
  margin: 0 auto;  
  height: 12px;  
  background: var(\--color-border);  
  border-radius: 6px;  
  overflow: hidden;  
}

.progress-container\_\_fill {  
  height: 100%;  
  background: var(\--color-primary);  
  transition: width 0.3s ease;  
  border-radius: 6px;  
}

*/\* Results \*/*  
.results {  
  text-align: center;  
  max-width: 500px;  
}

.results\_\_title {  
  font-size: 36px;  
  margin-bottom: var(\--spacing-lg);  
}

.results\_\_score {  
  background: var(\--color-surface);  
  padding: var(\--spacing-lg);  
  border-radius: 12px;  
  box-shadow: var(\--shadow-md);  
  margin-bottom: var(\--spacing-lg);  
}

.results\_\_score-number {  
  font-size: 32px;  
  font-weight: 700;  
  color: var(\--color-primary);  
  margin-bottom: var(\--spacing-xs);  
}

.results\_\_accuracy {  
  font-size: 24px;  
  color: var(\--color-text-secondary);  
}

.results\_\_message {  
  font-size: 28px;  
  margin-bottom: var(\--spacing-xl);  
}

.results\_\_actions {  
  display: flex;  
  flex-direction: column;  
  align-items: center;  
  gap: var(\--spacing-sm);  
}

*/\* Statistics \*/*  
.stats {  
  max-width: 900px;  
  width: 100%;  
}

.stats\_\_header {  
  display: flex;  
  align-items: center;  
  margin-bottom: var(\--spacing-lg);  
}

.stats\_\_back {  
  background: none;  
  border: none;  
  color: var(\--color-primary);  
  font-size: 18px;  
  font-weight: 600;  
  cursor: pointer;  
  padding: var(\--spacing-xs);  
}

.stats\_\_title {  
  font-size: 32px;  
  margin-left: var(\--spacing-md);  
}

.stats\_\_metrics {  
  display: grid;  
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));  
  gap: var(\--spacing-md);  
  margin-bottom: var(\--spacing-xl);  
}

.stats\_\_metric {  
  background: var(\--color-surface);  
  padding: var(\--spacing-md);  
  border-radius: 8px;  
  box-shadow: var(\--shadow-sm);  
  text-align: center;  
}

.stats\_\_metric-label {  
  font-size: 14px;  
  color: var(\--color-text-secondary);  
  margin-bottom: var(\--spacing-xs);  
}

.stats\_\_metric-value {  
  font-size: 28px;  
  font-weight: 700;  
  color: var(\--color-primary);  
}

.stats\_\_calendar {  
  background: var(\--color-surface);  
  padding: var(\--spacing-lg);  
  border-radius: 12px;  
  box-shadow: var(\--shadow-sm);  
  min-height: 300px;  
  display: flex;  
  align-items: center;  
  justify-content: center;  
  color: var(\--color-text-secondary);  
}

*/\* Responsive \*/*  
@media (max-width: 768px) {  
  .launcher\_\_title {  
    font-size: 36px;  
  }  
    
  .card\_\_word {  
    font-size: 36px;  
  }  
    
  .card\_\_plural {  
    font-size: 20px;  
  }  
    
  .noun-home\_\_stats {  
    grid-template-columns: 1fr;  
  }  
    
  .stats\_\_metrics {  
    grid-template-columns: repeat(2, 1fr);  
  }

}

**Lines of Code:** \~450 lines

---

## **Development Workflow**

### **Setup**

bash  
*\# Clone or create project directory*  
mkdir german-learning-app  
cd german-learning-app

*\# Initialize npm*  
npm init \-y

*\# Install dependencies*  
npm install express

*\# Create file structure*  
mkdir \-p public/core public/apps/nouns data/nouns

*\# Create files (use spec above for content)*  
touch server.js  
touch public/index.html  
touch public/style.css  
touch public/launcher.js  
touch public/core/learning-engine.js  
touch public/core/utils.js  
touch public/apps/nouns/nouns.html  
touch public/apps/nouns/nouns.css

touch public/apps/nouns/nouns.js

### **Running Development Server**

bash  
*\# Start server*  
node server.js

*\# Browser automatically opens to http://localhost:3000*  
*\# Or manually open: http://localhost:3000*  
\`\`\`

*\#\#\# Development Cycle*  
\`\`\`  
1. Edit files in your editor  
2. Save changes  
3. Refresh browser (Cmd/Ctrl \+ R)  
4. Test changes

5. Repeat

**No build process. No webpack. No babel. Just edit and refresh.**

---

## **Initial Data Setup**

### **Creating First 50 Words**

**Manually create:** `data/nouns/active.json`

json  
{  
  "version": "1.0",  
  "lastUpdated": "2026-01-06T00:00:00Z",  
  "words": \[  
    {  
      "id": 1,  
      "de": "Hund",  
      "article": "der",  
      "plural": "Hunde",  
      "en": \["dog", "hound"\],  
      "pt": \["cão", "cachorro"\],  
      "example": "Ich habe einen Hund.",  
      "examplePt": "Eu tenho um cachorro.",  
      "level": "A1",  
      "difficulty": 2,  
      "falseFriend": false,  
      "warning": "",  
      "attempts": \[\],  
      "streak": 0,  
      "memorized": false,  
      "memorizedDate": null  
    }  
  \]

}

**Add 49 more A1 nouns from Goethe list following same structure.**

**Recommended first 50 A1 nouns:** Hund, Katze, Haus, Auto, Tisch, Stuhl, Bett, Tür, Fenster, Wasser, Brot, Milch, Kaffee, Tee, Apfel, Mann, Frau, Kind, Vater, Mutter, Bruder, Schwester, Freund, Tag, Nacht, Jahr, Monat, Woche, Zeit, Geld, Stadt, Land, Straße, Weg, Arbeit, Schule, Buch, Name, Hand, Kopf, Auge, Ohr, Mund, Nase, Fuß, Herz, Leben, Welt, Mensch, Sache

---

## **Testing Checklist**

### **Phase 1 Testing (Before Launch)**

**Data Layer:**

* Server starts without errors  
* Data directories auto-created on first run  
* active.json loads correctly  
* archived.json loads correctly  
* metadata.json loads correctly  
* Archive process runs without errors  
* Words move from active to archived after 90 days  
* Unarchive process works (move back to active)

**Practice Session (Normal Mode):**

* Home screen displays correct stats  
* Can start practice session  
* 15 words selected from active (non-memorized)  
* Weighted selection favors failed/low-streak words  
* Card displays German word with article  
* Card shows plural form  
* Input field accepts text  
* Enter key submits answer  
* English translations accepted as correct  
* Portuguese translations accepted as correct  
* Typo tolerance works (1 char difference)  
* Case insensitivity works  
* Leading/trailing spaces ignored  
* Articles in answer ignored ("the dog" \= "dog")  
* Correct answer: green shake, shows card back  
* Incorrect answer: red shake, shows card back  
* Card back shows all translations  
* Card back shows example sentence  
* Card back shows warning (if applicable)  
* "Next Card" button advances to next card  
* Progress bar updates correctly  
* Progress bar shows "Card X of 15"  
* Progress bar fills proportionally  
* Session ends after 15 cards  
* Results screen shows correct score  
* Results screen shows accuracy percentage  
* Results screen shows appropriate message  
* Attempts recorded correctly  
* Streak increments on correct, resets on incorrect  
* Word marked memorized after 5 correct in a row  
* Data auto-saves after session

**Review Mode:**

* Button disabled if no memorized words  
* Can start review session  
* 10 words selected from recently memorized  
* Oldest memorizations prioritized  
* Session works same as normal practice  
* Results screen shows review performance

**Archive Review Mode:**

* Button disabled if no archived words  
* Can start archive review session  
* 10 words selected from archive  
* Never-reviewed words prioritized  
* Session works same as normal practice  
* Failed word increments reviewFailures  
* Word unarchived after 2 failures  
* Unarchive notification shown  
* Unarchived word appears in normal practice

**Statistics:**

* Stats screen displays current streak  
* Stats screen displays longest streak  
* Stats screen displays overall accuracy  
* Stats screen displays total sessions  
* All stats calculate correctly

**Export/Import:**

* Export button downloads JSON file  
* Export file contains active \+ archived \+ metadata  
* Export filename includes date  
* Export file is valid JSON

**UI/UX:**

* Gender colors display correctly (blue/red/green)  
* Shake animations smooth  
* Screen transitions smooth  
* Buttons responsive to clicks  
* Input field auto-focuses  
* Progress bar always visible  
* Progress bar doesn't overlap content  
* Layout responsive on mobile  
* No visual glitches or layout breaks

**Edge Cases:**

* Handles \<15 learning words gracefully  
* Handles 0 memorized words (button disabled)  
* Handles 0 archived words (button disabled)  
* Handles corrupted JSON gracefully  
* Handles missing files (auto-creates)  
* Quit session saves progress  
* Browser refresh maintains data

## **Future Enhancements (Backlog)**

### **Phase 2: Verbs App (Month 3-4)**

**Features:**

* Conjugation practice (present, past, perfect)  
* Infinitive → conjugated form  
* Irregular verb highlighting  
* Auxiliary verb selection (sein vs haben)  
* Tense selection mode  
* Conjugation tables on card back

**Estimated Effort:** 10-12 hours

### **Phase 3: Expressions App (Month 5-6)**

**Features:**

* Common phrase practice  
* Context hints (formal vs informal)  
* Usage examples with translations  
* Idiom explanations  
* Situational categories (greeting, shopping, etc.)

**Estimated Effort:** 8-10 hours

### **Phase 4: Advanced Features (Month 6+)**

**Features:**

* Calendar visualization (GitHub-style with color encoding)  
* Difficulty adjustment UI  
* Session length customization  
* Failed words review at end of session  
* Spaced repetition algorithm (SM-2 or Leitner)  
* Audio pronunciation (TTS or recorded)  
* Import from Anki/CSV  
* Mobile app (React Native port)

**Estimated Effort:** 20-30 hours

---

## **Maintenance & Backup Strategy**

### **Automatic Backups**

**Git versioning:**

bash  
cd german-learning-app  
git init  
git add data/

git commit \-m "Progress checkpoint $(date)"

**Schedule daily commits:**

bash  
*\# Add to crontab (macOS/Linux)*

0 22 \* \* \* cd \~/german-learning-app && git add data/ && git commit \-m "Daily backup $(date)"

### **Manual Backups**

**Use export button:**

1. Click "Export Backup" from noun home  
2. Save to Downloads/backups/  
3. Keep last 7 days of exports

**macOS Time Machine:**

* Automatically backs up entire project folder  
* Hourly snapshots available

### **Disaster Recovery**

**If data corrupted:**

1. Check Git history: `git log --oneline`  
2. Restore from Git: `git checkout HEAD~1 -- data/`  
3. Or restore from Time Machine  
4. Or restore from last manual export

---

## **Performance Benchmarks**

**Target Performance (MacBook):**

* App load time: \<200ms  
* Data load (500 words): \<50ms  
* Archive check: \<10ms  
* Card display: \<30ms  
* Answer validation: \<5ms  
* Save operation: \<30ms  
* Statistics calculation: \<20ms

**Memory Usage:**

* App idle: \~50MB  
* During session: \~70MB  
* With 5,000 words: \~100MB

**Acceptable because:**

* Solo user, powerful machine  
* No network latency  
* All operations instant to user  
* No optimization needed at this scale

---

## **Known Limitations**

### **Technical Limitations**

1. **Browser security:** Cannot auto-save to JSON without backend  
2. **LocalStorage limit:** 5-10MB (enough for 10,000 words)  
3. **Single-user:** No multi-user support or sync  
4. **No offline mode:** Requires server running

### **Design Limitations**

1. **No mobile app:** Web-only (mobile browser works but not optimal)  
2. **No spaced repetition:** Simple 5-in-a-row memorization (Phase 4 enhancement)  
3. **Manual word addition:** No UI for adding words (edit JSON directly)  
4. **Basic statistics:** No advanced analytics or insights

### **Acceptable Trade-offs**

These limitations are acceptable because:

* Solo user (you) can work around them  
* Reduces complexity dramatically  
* Faster to build and maintain  
* Can enhance later if needed

---

## **Success Criteria**

### **Phase 1 Success Metrics**

**Functional:**

* Can practice 15 cards without bugs  
* Words correctly marked as memorized  
* Archive system works automatically  
* Data persists between sessions  
* All three practice modes functional

**Usability:**

* Session completes in 8-12 minutes  
* Interface feels responsive (\<100ms interactions)  
* No confusion about what to do next  
* Easy to track progress

**Personal Goals:**

* Use daily for 7 consecutive days  
* Memorize 20+ words in first week  
* Feel motivated to continue  
* Find the app helpful (not annoying)

### **Long-term Success (3 Months)**

* 200+ words memorized  
* 50+ words archived  
* 50+ days practice streak  
* Notice improvement in conversations with wife  
* Feel confident with A1/A2 vocabulary

---

## **Troubleshooting**

### **Common Issues**

**Problem:** Server won't start \- "Port 3000 already in use" **Solution:** Kill existing process or use different port

bash  
*\# Find process using port 3000*  
lsof \-i :3000

*\# Kill process*  
kill \-9 \<PID\>

*\# Or use different port in server.js*

**Problem:** Data not saving **Solution:** Check file permissions and paths

bash  
*\# Check if data directory exists*  
ls \-la data/nouns/

*\# Check file permissions*

chmod \-R 755 data/

**Problem:** Archive not running **Solution:** Check console for errors, verify metadata.json format

**Problem:** Cards not displaying **Solution:** Check browser console for JavaScript errors, verify data format

**Problem:** Slow performance **Solution:** Check active.json size, should be \<500 words. Archive old words.

---

