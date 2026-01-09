# **German Learning App - Frontend Implementation & Development Guide**

*This is Part 2 of the v4.0 specification. See v4-specification-part1.md for architecture, data models, and backend implementation.*

---

## **Frontend Architecture**

### **Core: Learning Engine (learning-engine.js)**

**Purpose:** Shared logic for all apps - data loading, word selection, progress tracking, statistics

**Key Features:**

* Multi-app support  
* Archive-aware  
* Weighted selection  
* Auto-save  
* LocalStorage caching

**Complete Implementation:**

```javascript
class LearningEngine {  
  constructor(appName) {  
    this.appName = appName;  
    this.activeWords = [];  
    this.archivedWords = [];  
    this.metadata = {};  
    this.loaded = false;  
  }  
    
  // Initialize: Load data from API  
  async load() {  
    try {  
      const [active, metadata] = await Promise.all([  
        fetch(`/api/${this.appName}/active`).then(r => r.json()),  
        fetch(`/api/${this.appName}/metadata`).then(r => r.json())  
      ]);  
        
      this.activeWords = active.words;  
      this.metadata = metadata;  
      this.loaded = true;  
        
      // Check if archiving needed (automatic)  
      await this.checkArchive();  
        
      return true;  
    } catch (err) {  
      console.error('Failed to load data:', err);  
      return false;  
    }  
  }  
    
  // Load archived words (lazy, only when needed)  
  async loadArchived() {  
    try {  
      const archived = await fetch(`/api/${this.appName}/archived`).then(r => r.json());  
      this.archivedWords = archived.words;  
      return true;  
    } catch (err) {  
      console.error('Failed to load archived words:', err);  
      return false;  
    }  
  }  
    
  // Check and run archive process  
  async checkArchive() {  
    try {  
      const response = await fetch(`/api/${this.appName}/archive`, {  
        method: 'POST'  
      });  
        
      if (response.ok) {  
        const result = await response.json();  
        if (result.archived > 0) {  
          console.log(`📦 Archived ${result.archived} words`);  
          await this.load();  // Reload data  
        }  
      }  
    } catch (err) {  
      console.warn('Archive check failed:', err);  
    }  
  }  
    
  // Mode 1: Select words for normal practice  
  selectForPractice(count) {  
    const learning = this.activeWords.filter(w => !w.memorized);  
      
    if (learning.length === 0) {  
      return [];  
    }  
      
    if (learning.length <= count) {  
      return learning;  
    }  
      
    return this.weightedSample(learning, count);  
  }  
    
  // Mode 2: Select recently memorized for review  
  selectForReview(count) {  
    const memorized = this.activeWords.filter(w => w.memorized);  
      
    if (memorized.length === 0) {  
      return [];  
    }  
      
    // Sort by memorizedDate (oldest first)  
    return memorized  
      .sort((a, b) => new Date(a.memorizedDate) - new Date(b.memorizedDate))  
      .slice(0, Math.min(count, memorized.length));  
  }  
    
  // Mode 3: Select archived words for review  
  async selectForArchiveReview(count) {  
    await this.loadArchived();  
      
    if (this.archivedWords.length === 0) {  
      return [];  
    }  
      
    // Prioritize never-reviewed  
    const sorted = this.archivedWords.sort((a, b) => {  
      if (!a.lastReviewDate && !b.lastReviewDate) return 0;  
      if (!a.lastReviewDate) return -1;  
      if (!b.lastReviewDate) return 1;  
      return new Date(a.lastReviewDate) - new Date(b.lastReviewDate);  
    });  
      
    return sorted.slice(0, Math.min(count, this.archivedWords.length));  
  }  
    
  // Weighted random sampling  
  weightedSample(words, count) {  
    const weighted = words.map(word => {  
      let weight = 1;  
        
      // Failed recently? 3x  
      const lastAttempt = word.attempts?.[word.attempts.length - 1];  
      if (lastAttempt && !lastAttempt.correct) {  
        weight *= 3;  
      }  
        
      // Low streak? 2x  
      if (word.streak > 0 && word.streak <= 2) {  
        weight *= 2;  
      }  
        
      // Difficulty  
      if (word.difficulty === 3) weight *= 2;  
      if (word.difficulty === 1) weight *= 0.5;  
        
      return { word, weight };  
    });  
      
    return this._weightedRandomSample(weighted, count);  
  }  
    
  // Weighted random selection algorithm  
  _weightedRandomSample(weightedItems, count) {  
    const selected = [];  
    const available = [...weightedItems];  
      
    for (let i = 0; i < count && available.length > 0; i++) {  
      const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);  
      let random = Math.random() * totalWeight;  
        
      for (let j = 0; j < available.length; j++) {  
        random -= available[j].weight;  
        if (random <= 0) {  
          selected.push(available[j].word);  
          available.splice(j, 1);  
          break;  
        }  
      }  
    }  
      
    return selected;  
  }  
    
  // Record practice attempt  
  recordAttempt(wordId, correct, timeMs) {  
    const word = this.activeWords.find(w => w.id === wordId);  
      
    if (!word) return;  
      
    if (!word.attempts) word.attempts = [];  
      
    word.attempts.push({  
      date: new Date().toISOString().split('T')[0],  
      correct,  
      ms: timeMs  
    });  
      
    if (correct) {  
      word.streak = (word.streak || 0) + 1;  
        
      if (word.streak >= 5 && !word.memorized) {  
        word.memorized = true;  
        word.memorizedDate = new Date().toISOString().split('T')[0];  
        console.log(`✨ Memorized: ${word.de}`);  
      }  
    } else {  
      word.streak = 0;  
    }  
  }  
    
  // Record archive review attempt  
  recordArchiveAttempt(wordId, correct) {  
    const word = this.archivedWords.find(w => w.id === wordId);  
      
    if (!word) return;  
      
    word.lastReviewDate = new Date().toISOString().split('T')[0];  
      
    if (!correct) {  
      word.reviewFailures = (word.reviewFailures || 0) + 1;  
        
      if (word.reviewFailures >= this.metadata.settings.unarchiveFailureThreshold) {  
        this.unarchiveWord(wordId);  
        return true;  // Signal unarchive  
      }  
    } else {  
      word.reviewFailures = 0;  
    }  
      
    return false;  
  }  
    
  // Unarchive word (move back to active)  
  async unarchiveWord(wordId) {  
    const word = this.archivedWords.find(w => w.id === wordId);  
      
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
      attempts: [{  
        date: new Date().toISOString().split('T')[0],  
        correct: false,  
        ms: 0  
      }],  
      streak: 0,  
      memorized: false,  
      memorizedDate: null  
    };  
      
    this.activeWords.push(restored);  
    this.archivedWords = this.archivedWords.filter(w => w.id !== wordId);  
      
    await this.save();  
      
    console.log(`⚠️ Unarchived: ${word.de} (failed review)`);  
  }  
    
  // Save all data  
  async save() {  
    try {  
      await Promise.all([  
        fetch(`/api/${this.appName}/active`, {  
          method: 'POST',  
          headers: { 'Content-Type': 'application/json' },  
          body: JSON.stringify({  
            version: '1.0',  
            words: this.activeWords  
          })  
        }),  
        fetch(`/api/${this.appName}/archived`, {  
          method: 'POST',  
          headers: { 'Content-Type': 'application/json' },  
          body: JSON.stringify({  
            version: '1.0',  
            words: this.archivedWords  
          })  
        })  
      ]);  
        
      return true;  
    } catch (err) {  
      console.error('Save failed:', err);  
      return false;  
    }  
  }  
    
  // Calculate statistics  
  getStats() {  
    const learning = this.activeWords.filter(w => !w.memorized);  
    const memorized = this.activeWords.filter(w => w.memorized);  
      
    const allAttempts = this.activeWords.flatMap(w => w.attempts || []);  
    const totalAttempts = allAttempts.length;  
    const totalCorrect = allAttempts.filter(a => a.correct).length;  

    // Calculate streak distribution for active, non-memorized words
    const streakDistribution = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    learning.forEach(word => {
      const streak = word.streak || 0;
      if (streak >= 4) {
        streakDistribution[4]++;
      } else {
        streakDistribution[streak]++;
      }
    });
      
    return {  
      total: this.metadata.stats.totalWords,  
      active: this.activeWords.length,  
      learning: learning.length,  
      memorized: memorized.length,  
      archived: this.metadata.stats.archivedWords,  
      totalAttempts,  
      accuracy: totalAttempts > 0 ? totalCorrect / totalAttempts : 0,  
      currentStreak: this.metadata.stats.currentStreak,  
      longestStreak: this.metadata.stats.longestStreak,
      streakDistribution
    };  
  }  
    
  // Update session stats  
  async updateSessionStats(sessionResults) {  
    const correct = sessionResults.filter(r => r).length;  
    const total = sessionResults.length;  
      
    this.metadata.stats.totalSessions += 1;  
    this.metadata.stats.totalCards += total;  
      
    // Update overall accuracy (running average)  
    const oldTotal = this.metadata.stats.totalCards - total;  
    const oldAccuracy = this.metadata.stats.overallAccuracy;  
    this.metadata.stats.overallAccuracy =   
      (oldAccuracy * oldTotal + correct) / this.metadata.stats.totalCards;  
      
    // Update word counts  
    this.metadata.stats.activeWords = this.activeWords.length;  
    this.metadata.stats.memorizedWords = this.activeWords.filter(w => w.memorized).length;  
      
    await fetch(`/api/${this.appName}/metadata`, {  
      method: 'POST',  
      headers: { 'Content-Type': 'application/json' },  
      body: JSON.stringify(this.metadata)  
    });  
  }

}
```

**Lines of Code:** ~320 lines

---

### **Utility Functions (utils.js)**

**Purpose:** Common helper functions used across all apps

**Implementation:**

```javascript
// Levenshtein distance for typo tolerance  
function levenshtein(a, b) {  
  const matrix = [];  
    
  for (let i = 0; i <= b.length; i++) {  
    matrix[i] = [i];  
  }  
    
  for (let j = 0; j <= a.length; j++) {  
    matrix[0][j] = j;  
  }  
    
  for (let i = 1; i <= b.length; i++) {  
    for (let j = 1; j <= a.length; j++) {  
      if (b.charAt(i - 1) === a.charAt(j - 1)) {  
        matrix[i][j] = matrix[i - 1][j - 1];  
      } else {  
        matrix[i][j] = Math.min(  
          matrix[i - 1][j - 1] + 1,  
          matrix[i][j - 1] + 1,  
          matrix[i - 1][j] + 1  
        );  
      }  
    }  
  }  
    
  return matrix[b.length][a.length];  
}

// Normalize input for comparison  
function normalizeInput(text) {  
  return text  
    .toLowerCase()  
    .trim()  
    .replace(/^(the|a|an|o|a|os|as)\s+/i, '')  // Remove articles  
    .replace(/\s+/g, ' ');  // Normalize spaces  
}

// Check if answer is correct (with typo tolerance)  
function isCorrectAnswer(userInput, correctAnswers) {  
  const normalized = normalizeInput(userInput);  
    
  return correctAnswers.some(answer => {  
    const normalizedAnswer = normalizeInput(answer);  
      
    // Exact match  
    if (normalized === normalizedAnswer) return true;  
      
    // Typo tolerance: 1 character difference  
    if (levenshtein(normalized, normalizedAnswer) <= 1) return true;  
      
    return false;  
  });  
}

// Shuffle array (Fisher-Yates)  
function shuffle(array) {  
  const shuffled = [...array];  
  for (let i = shuffled.length - 1; i > 0; i--) {  
    const j = Math.floor(Math.random() * (i + 1));  
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];  
  }  
  return shuffled;  
}

// Format time (ms to seconds)  
function formatTime(ms) {  
  const seconds = Math.floor(ms / 1000);  
  if (seconds < 60) return `${seconds}s`;  
  const minutes = Math.floor(seconds / 60);  
  const remainingSeconds = seconds % 60;  
  return `${minutes}m ${remainingSeconds}s`;  
}

// Calculate days between dates  
function daysBetween(date1, date2) {  
  const oneDay = 1000 * 60 * 60 * 24;  
  const diff = Math.abs(date2 - date1);  
  return Math.floor(diff / oneDay);  
}

// Get today's date (ISO format)  
function todayISO() {  
  return new Date().toISOString().split('T')[0];  
}

// Debounce function  
function debounce(func, wait) {  
  let timeout;  
  return function executedFunction(...args) {  
    const later = () => {  
      clearTimeout(timeout);  
      func(...args);  
    };  
    clearTimeout(timeout);  
    timeout = setTimeout(later, wait);  
  };

}
```

**Lines of Code:** ~100 lines

---

### **App Launcher (index.html + launcher.js)**

**Purpose:** Multi-app selection screen

**index.html:**

```html
<!DOCTYPE html>  
<html lang="en">  
<head>  
  <meta charset="UTF-8">  
  <meta name="viewport" content="width=device-width, initial-scale=1.0">  
  <title>German Learning</title>  
  <link rel="stylesheet" href="style.css">  
</head>  
<body>  
  <div class="launcher">  
    <header class="launcher__header">  
      <h1 class="launcher__title">German Learning</h1>  
      <p class="launcher__subtitle">Choose your practice mode</p>  
    </header>  
      
    <div class="launcher__apps">  
      <a href="apps/nouns/nouns.html" class="launcher__app launcher__app--nouns">  
        <div class="launcher__app-icon">📚</div>  
        <h2 class="launcher__app-name">Nouns</h2>  
        <p class="launcher__app-desc">Articles, plurals, vocabulary</p>  
        <div class="launcher__app-stats" id="nouns-stats">Loading...</div>  
      </a>  
        
      <div class="launcher__app launcher__app--disabled" title="Coming soon">  
        <div class="launcher__app-icon">🏃</div>  
        <h2 class="launcher__app-name">Verbs</h2>  
        <p class="launcher__app-desc">Conjugations, tenses</p>  
        <div class="launcher__app-stats">Coming soon</div>  
      </div>  
        
      <div class="launcher__app launcher__app--disabled" title="Coming soon">  
        <div class="launcher__app-icon">💬</div>  
        <h2 class="launcher__app-name">Expressions</h2>  
        <p class="launcher__app-desc">Common phrases, idioms</p>  
        <div class="launcher__app-stats">Coming soon</div>  
      </div>  
    </div>  
  </div>  
    
  <script src="core/learning-engine.js"></script>  
  <script src="core/utils.js"></script>  
  <script src="launcher.js"></script>  
</body>

</html>
```

**launcher.js:**

```javascript
async function loadAppStats() {  
  try {  
    const response = await fetch('/api/nouns/metadata');  
    const metadata = await response.json();  
      
    const statsEl = document.getElementById('nouns-stats');  
    statsEl.textContent = `${metadata.stats.memorizedWords} memorized • ${metadata.stats.activeWords} active`;  
  } catch (err) {  
    console.error('Failed to load stats:', err);  
  }  
}

loadAppStats();
```

**Lines of Code:** ~60 lines HTML + ~15 lines JS

---

### **Nouns App (Phase 1 - Full Implementation)**

#### **nouns.html**

```html
<!DOCTYPE html>  
<html lang="en">  
<head>  
  <meta charset="UTF-8">  
  <meta name="viewport" content="width=device-width, initial-scale=1.0">  
  <title>Nouns Practice</title>  
  <link rel="stylesheet" href="../../style.css">  
  <link rel="stylesheet" href="nouns.css">  
</head>  
<body>  
  <!-- Home Screen -->  
  <div id="home-screen" class="screen">  
    <div class="noun-home">  
      <header class="noun-home__header">  
        <a href="../../index.html" class="noun-home__back">← Back</a>  
        <h1 class="noun-home__title">Noun Practice</h1>  
      </header>  
        
      <div class="noun-home__stats">  
        <div class="stat">  
          <div class="stat__value" id="learning-count">-</div>  
          <div class="stat__label">Learning</div>  
        </div>  
        <div class="stat">  
          <div class="stat__value" id="memorized-count">-</div>  
          <div class="stat__label">Recently Memorized</div>  
        </div>  
        <div class="stat">  
          <div class="stat__value" id="archived-count">-</div>  
          <div class="stat__label">Archived</div>  
        </div>  
      </div>  
        
      <div class="noun-home__modes">  
        <button class="button button--primary button--large" id="start-practice">  
          Practice New Words (15 cards)  
        </button>  
          
        <button class="button button--large" id="start-review">  
          Review Recently Memorized (10 cards)  
        </button>  
          
        <button class="button button--large" id="start-archive-review">  
          Review Archive (10 cards)  
        </button>  
      </div>  
        
      <div class="noun-home__actions">  
        <button class="button button--secondary" id="view-stats">View Statistics</button>  
        <button class="button button--secondary" id="export-data">Export Backup</button>  
      </div>  
    </div>  
  </div>  
    
  <!-- Practice Screen -->  
  <div id="practice-screen" class="screen screen--hidden">  
    <div class="session">  
      <header class="session__header">  
        <button class="session__quit" id="quit-session">✕ Quit</button>  
        <div class="session__mode" id="session-mode">Practice</div>  
      </header>  
        
      <div class="session__card-container">  
        <div id="card" class="card">  
          <!-- Card content inserted by JS -->  
        </div>  
      </div>  
        
      <div class="progress-container">  
        <div class="progress-container__label" id="progress-label">Card 1 of 15</div>  
        <div class="progress-container__bar">  
          <div class="progress-container__fill" id="progress-fill"></div>  
        </div>  
      </div>  
    </div>  
  </div>  
    
  <!-- Results Screen -->  
  <div id="results-screen" class="screen screen--hidden">  
    <div class="results">  
      <h1 class="results__title">Session Complete!</h1>  
        
      <div class="results__score">  
        <div class="results__score-number" id="score-number">12 out of 15</div>  
        <div class="results__accuracy" id="accuracy">80%</div>  
      </div>  
        
      <div class="results__message" id="results-message">Great job! 👏</div>  
        
      <div class="results__actions">  
        <button class="button button--primary" id="try-again">Try Again</button>  
        <button class="button" id="return-home">Return to Home</button>  
      </div>  
    </div>  
  </div>  
    
  <!-- Statistics Screen -->  
  <div id="stats-screen" class="screen screen--hidden">  
    <div class="stats">  
      <header class="stats__header">  
        <button class="stats__back" id="stats-back">← Back</button>  
        <h1 class="stats__title">Statistics</h1>  
      </header>  
        
      <div class="stats__metrics">  
        <div class="stats__metric">  
          <div class="stats__metric-label">Current Streak</div>  
          <div class="stats__metric-value" id="current-streak">-</div>  
        </div>  
        <div class="stats__metric">  
          <div class="stats__metric-label">Longest Streak</div>  
          <div class="stats__metric-value" id="longest-streak">-</div>  
        </div>  
        <div class="stats__metric">  
          <div class="stats__metric-label">Overall Accuracy</div>  
          <div class="stats__metric-value" id="overall-accuracy">-</div>  
        </div>  
        <div class="stats__metric">  
          <div class="stats__metric-label">Total Sessions</div>  
          <div class="stats__metric-value" id="total-sessions">-</div>  
        </div>  
      </div>  

      <!-- Streak Distribution -->
      <div class="stats__streak-distribution">
        <h2 class="stats__section-title">Active Words by Streak</h2>
        <div class="streak-bar" id="streak-bar">
          <div class="streak-bar__segment" id="streak-0" style="--color: #E0E0E0; --width: 20%;">
            <span class="streak-bar__label">0</span>
            <span class="streak-bar__value">0</span>
          </div>
          <div class="streak-bar__segment" id="streak-1" style="--color: #FFCDD2; --width: 20%;">
            <span class="streak-bar__label">1</span>
            <span class="streak-bar__value">0</span>
          </div>
          <div class="streak-bar__segment" id="streak-2" style="--color: #FFF59D; --width: 20%;">
            <span class="streak-bar__label">2</span>
            <span class="streak-bar__value">0</span>
          </div>
          <div class="streak-bar__segment" id="streak-3" style="--color: #C8E6C9; --width: 20%;">
            <span class="streak-bar__label">3</span>
            <span class="streak-bar__value">0</span>
          </div>
          <div class="streak-bar__segment" id="streak-4" style="--color: #BBDEFB; --width: 20%;">
            <span class="streak-bar__label">4+</span>
            <span class="streak-bar__value">0</span>
          </div>
        </div>
      </div>
        
      <!-- Calendar placeholder -->  
      <div class="stats__calendar" id="calendar">  
        <!-- Calendar generated by JS -->  
      </div>  
    </div>  
  </div>  
    
  <script src="../../core/learning-engine.js"></script>  
  <script src="../../core/utils.js"></script>  
  <script src="nouns.js"></script>  
</body>

</html>
```

**Lines of Code:** ~150 lines

---

#### **nouns.js (Core Logic)**

```javascript
// Global state  
let engine;  
let currentSession = [];  
let currentCardIndex = 0;  
let sessionResults = [];  
let sessionMode = 'practice';  // 'practice', 'review', 'archive'  
let cardStartTime = 0;

// Initialize  
async function init() {  
  showScreen('home-screen');  
    
  engine = new LearningEngine('nouns');  
  const loaded = await engine.load();  
    
  if (!loaded) {  
    alert('Failed to load data. Please refresh.');  
    return;  
  }  
    
  updateHomeStats();  
  attachEventListeners();  
}

// Update home screen stats  
function updateHomeStats() {  
  const stats = engine.getStats();  
    
  document.getElementById('learning-count').textContent = stats.learning;  
  document.getElementById('memorized-count').textContent = stats.memorized;  
  document.getElementById('archived-count').textContent = stats.archived;  
    
  // Disable buttons if no words available  
  document.getElementById('start-practice').disabled = stats.learning === 0;  
  document.getElementById('start-review').disabled = stats.memorized === 0;  
  document.getElementById('start-archive-review').disabled = stats.archived === 0;  
}

// Event listeners  
function attachEventListeners() {  
  document.getElementById('start-practice').addEventListener('click', () => startSession('practice', 15));  
  document.getElementById('start-review').addEventListener('click', () => startSession('review', 10));  
  document.getElementById('start-archive-review').addEventListener('click', () => startSession('archive', 10));  
  document.getElementById('view-stats').addEventListener('click', showStatistics);  
  document.getElementById('export-data').addEventListener('click', exportData);  
  document.getElementById('quit-session').addEventListener('click', quitSession);  
  document.getElementById('try-again').addEventListener('click', () => startSession(sessionMode, currentSession.length));  
  document.getElementById('return-home').addEventListener('click', returnHome);  
  document.getElementById('stats-back').addEventListener('click', returnHome);  
}

// Start practice session  
async function startSession(mode, count) {  
  sessionMode = mode;  
  currentCardIndex = 0;  
  sessionResults = [];  
    
  // Select words based on mode  
  if (mode === 'practice') {  
    currentSession = engine.selectForPractice(count);  
  } else if (mode === 'review') {  
    currentSession = engine.selectForReview(count);  
  } else if (mode === 'archive') {  
    currentSession = await engine.selectForArchiveReview(count);  
  }  
    
  if (currentSession.length === 0) {  
    alert('No words available for this mode.');  
    return;  
  }  
    
  // Update session header  
  const modeNames = {  
    'practice': 'Practice',  
    'review': 'Review Recently Memorized',  
    'archive': 'Archive Review'  
  };  
  document.getElementById('session-mode').textContent = modeNames[mode];  
    
  showScreen('practice-screen');  
  showCard(currentSession[currentCardIndex]);  
}

// Show card  
function showCard(word) {  
  const card = document.getElementById('card');  
  const genderClass = word.article === 'der' ? 'masculine' :   
                      word.article === 'die' ? 'feminine' : 'neutral';  
    
  card.className = `card card--${genderClass}`;  
  card.innerHTML = `  
    <div class="card__front">  
      <div class="card__word">${word.article} ${word.de}</div>  
      <div class="card__plural">${word.plural}</div>  
      <input   
        type="text"   
        class="card__input"   
        id="answer-input"   
        placeholder="Type translation..."  
        autocomplete="off"  
        autocorrect="off"  
        autocapitalize="off"  
        spellcheck="false"  
      />  
      <button class="button button--primary" id="check-answer">Check</button>  
    </div>  
  `;  
    
  // Focus input  
  const input = document.getElementById('answer-input');  
  input.focus();  
    
  // Event listeners  
  document.getElementById('check-answer').addEventListener('click', checkAnswer);  
  input.addEventListener('keypress', (e) => {  
    if (e.key === 'Enter') checkAnswer();  
  });  
    
  // Update progress bar  
  updateProgressBar();  
    
  // Start timer  
  cardStartTime = Date.now();  
}

// Check answer  
function checkAnswer() {  
  const input = document.getElementById('answer-input');  
  const userAnswer = input.value.trim();  
    
  if (!userAnswer) {  
    input.focus();  
    return;  
  }  
    
  const word = currentSession[currentCardIndex];  
  const allAnswers = [...word.en, ...word.pt];  
  const correct = isCorrectAnswer(userAnswer, allAnswers);  
    
  const timeMs = Date.now() - cardStartTime;  
    
  // Record attempt  
  if (sessionMode === 'archive') {  
    const unarchived = engine.recordArchiveAttempt(word.id, correct);  
    if (unarchived) {  
      alert(`⚠️ Word unarchived: ${word.de}\nYou'll see it in normal practice now.`);  
    }  
  } else {  
    engine.recordAttempt(word.id, correct, timeMs);  
  }  
    
  sessionResults.push(correct);  
    
  // Show feedback  
  showCardBack(word, correct);  
}

// Show card back with feedback  
function showCardBack(word, correct) {  
  const card = document.getElementById('card');  
    
  // Animate shake  
  card.classList.add(correct ? 'card--shake-correct' : 'card--shake-incorrect');  
    
  setTimeout(() => {  
    card.classList.remove('card--shake-correct', 'card--shake-incorrect');  
      
    // Show back of card  
    card.innerHTML = `  
      <div class="card-back">  
        <div class="card-back__header">  
          <div class="card-back__word">${word.article} ${word.de} → ${word.plural}</div>  
          <div class="card-back__result ${correct ? 'correct' : 'incorrect'}">  
            ${correct ? '✓ Correct' : '✗ Incorrect'}  
          </div>  
        </div>  
          
        <div class="card-back__translations">  
          <strong>Translations:</strong><br>  
          ${word.en.join(', ')}<br>  
          ${word.pt.join(', ')}  
        </div>  
          
        ${word.warning ? `<div class="card-back__warning">⚠️ ${word.warning}</div>` : ''}  
          
        <div class="card-back__example">  
          <strong>Example:</strong><br>  
          ${word.example}<br>  
          <em>(${word.examplePt})</em>  
        </div>  
          
        <button class="button button--primary button--large" id="next-card">  
          ${currentCardIndex < currentSession.length - 1 ? 'Next Card →' : 'Finish'}  
        </button>  
      </div>  
    `;  
      
    document.getElementById('next-card').addEventListener('click', nextCard);  
    document.getElementById('next-card').focus();  
  }, 500);  
}

// Next card or finish session  
async function nextCard() {  
  currentCardIndex++;  
    
  if (currentCardIndex < currentSession.length) {  
    showCard(currentSession[currentCardIndex]);  
  } else {  
    await finishSession();  
  }  
}

// Finish session  
async function finishSession() {  
  // Save data  
  await engine.save();  
  await engine.updateSessionStats(sessionResults);  
    
  // Show results  
  showResults();  
}

// Show results screen  
function showResults() {  
  const correct = sessionResults.filter(r => r).length;  
  const total = sessionResults.length;  
  const accuracy = Math.round((correct / total) * 100);  
    
  document.getElementById('score-number').textContent = `${correct} out of ${total} correct`;  
  document.getElementById('accuracy').textContent = `${accuracy}%`;  
    
  // Message based on performance  
  let message = '';  
  if (correct >= total - 2) message = 'Excellent! 🌟';  
  else if (correct >= total - 5) message = 'Great job! 👏';  
  else if (correct >= total - 8) message = 'Good effort! 💪';  
  else message = 'Keep practicing! 📚';  
    
  document.getElementById('results-message').textContent = message;  
    
  showScreen('results-screen');  
}

// Update progress bar  
function updateProgressBar() {  
  const current = currentCardIndex + 1;  
  const total = currentSession.length;  
  const percentage = (current / total) * 100;  
    
  document.getElementById('progress-label').textContent = `Card ${current} of ${total}`;  
  document.getElementById('progress-fill').style.width = `${percentage}%`;  
}

// Show statistics  
async function showStatistics() {  
  const stats = engine.getStats();  
    
  document.getElementById('current-streak').textContent = `${stats.currentStreak} days`;  
  document.getElementById('longest-streak').textContent = `${stats.longestStreak} days`;  
  document.getElementById('overall-accuracy').textContent = `${Math.round(stats.accuracy * 100)}%`;  
  document.getElementById('total-sessions').textContent = engine.metadata.stats.totalSessions;  

  // Update streak distribution bar
  const { streakDistribution, learning } = stats;
  const totalLearning = learning > 0 ? learning : 1; // Avoid division by zero

  for (let i = 0; i <= 4; i++) {
    const segment = document.getElementById(`streak-${i}`);
    const value = streakDistribution[i] || 0;
    const percentage = (value / totalLearning) * 100;

    segment.style.setProperty('--width', `${percentage}%`);
    segment.querySelector('.streak-bar__value').textContent = value;
  }
    
  // TODO: Generate calendar visualization  
    
  showScreen('stats-screen');  
}

// Export data  
async function exportData() {  
  try {  
    const response = await fetch('/api/nouns/export');  
    const blob = await response.blob();  
    const url = window.URL.createObjectURL(blob);  
    const a = document.createElement('a');  
    a.href = url;  
    a.download = `nouns-backup-${todayISO()}.json`;  
    document.body.appendChild(a);  
    a.click();  
    window.URL.revokeObjectURL(url);  
    document.body.removeChild(a);  
  } catch (err) {  
    alert('Export failed. Please try again.');  
    console.error('Export error:', err);  
  }  
}

// Quit session  
function quitSession() {  
  if (confirm('Quit session? Progress will be saved.')) {  
    engine.save();  
    returnHome();  
  }  
}

// Return to home  
function returnHome() {  
  updateHomeStats();  
  showScreen('home-screen');  
}

// Show screen helper  
function showScreen(screenId) {  
  document.querySelectorAll('.screen').forEach(screen => {  
    screen.classList.add('screen--hidden');  
  });  
  document.getElementById(screenId).classList.remove('screen--hidden');  
}

// Start app

init();
```

**Lines of Code:** ~400 lines

---

## **Styling (CSS)**

### **Global Styles (style.css)**

**Purpose:** Shared styles across all apps

```css
/* Reset */  
* {  
  margin: 0;  
  padding: 0;  
  box-sizing: border-box;  
}

/* Variables */  
:root {  
  --color-primary: #4CAF50;  
  --color-secondary: #2196F3;  
  --color-danger: #F44336;  
    
  --color-masculine: #2196F3;  
  --color-feminine: #F44336;  
  --color-neutral: #4CAF50;  
    
  --color-text: #212121;  
  --color-text-secondary: #757575;  
  --color-background: #fafafa;  
  --color-surface: #ffffff;  
  --color-border: #e0e0e0;  
    
  --spacing-xs: 8px;  
  --spacing-sm: 16px;  
  --spacing-md: 24px;  
  --spacing-lg: 32px;  
  --spacing-xl: 48px;  
    
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;  
    
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);  
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);  
  --shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15);  
}

/* Base */  
body {  
  font-family: var(--font-family);  
  color: var(--color-text);  
  background-color: var(--color-background);  
  line-height: 1.6;  
}

/* Utility */  
.screen {  
  min-height: 100vh;  
  display: flex;  
  align-items: center;  
  justify-content: center;  
  padding: var(--spacing-md);  
}

.screen--hidden {  
  display: none;  
}

/* Buttons */  
.button {  
  padding: 12px 24px;  
  font-size: 16px;  
  font-weight: 600;  
  border: 2px solid var(--color-border);  
  border-radius: 8px;  
  background: var(--color-surface);  
  color: var(--color-text);  
  cursor: pointer;  
  transition: all 0.2s;  
}

.button:hover {  
  transform: translateY(-2px);  
  box-shadow: var(--shadow-md);  
}

.button:active {  
  transform: translateY(0);  
}

.button:disabled {  
  opacity: 0.5;  
  cursor: not-allowed;  
}

.button--primary {  
  background: var(--color-primary);  
  border-color: var(--color-primary);  
  color: white;  
}

.button--secondary {  
  background: var(--color-secondary);  
  border-color: var(--color-secondary);  
  color: white;  
}

.button--large {  
  padding: 16px 32px;  
  font-size: 18px;  
  width: 100%;  
  max-width: 400px;  
  margin: var(--spacing-sm) 0;  
}

/* Launcher */  
.launcher {  
  max-width: 900px;  
  width: 100%;  
  text-align: center;  
}

.launcher__header {  
  margin-bottom: var(--spacing-xl);  
}

.launcher__title {  
  font-size: 48px;  
  margin-bottom: var(--spacing-sm);  
}

.launcher__subtitle {  
  font-size: 18px;  
  color: var(--color-text-secondary);  
}

.launcher__apps {  
  display: grid;  
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));  
  gap: var(--spacing-md);  
  margin-top: var(--spacing-lg);  
}

.launcher__app {  
  background: var(--color-surface);  
  border: 2px solid var(--color-border);  
  border-radius: 12px;  
  padding: var(--spacing-lg);  
  text-decoration: none;  
  color: var(--color-text);  
  transition: all 0.3s;  
  cursor: pointer;  
}

.launcher__app:hover {  
  transform: translateY(-4px);  
  box-shadow: var(--shadow-lg);  
  border-color: var(--color-primary);  
}

.launcher__app--disabled {  
  opacity: 0.5;  
  cursor: not-allowed;  
}

.launcher__app--disabled:hover {  
  transform: none;  
  box-shadow: none;  
  border-color: var(--color-border);  
}

.launcher__app-icon {  
  font-size: 48px;  
  margin-bottom: var(--spacing-sm);  
}

.launcher__app-name {  
  font-size: 24px;  
  margin-bottom: var(--spacing-xs);  
}

.launcher__app-desc {  
  font-size: 14px;  
  color: var(--color-text-secondary);  
  margin-bottom: var(--spacing-sm);  
}

.launcher__app-stats {  
  font-size: 12px;  
  color: var(--color-text-secondary);  
  font-weight: 600;

}
```

**Lines of Code:** ~200 lines

---

### **Noun-Specific Styles (nouns.css)**

```css
/* Noun Home */  
.noun-home {  
  max-width: 600px;  
  width: 100%;  
}

.noun-home__header {  
  display: flex;  
  align-items: center;  
  justify-content: space-between;  
  margin-bottom: var(--spacing-lg);  
}

.noun-home__back {  
  color: var(--color-primary);  
  text-decoration: none;  
  font-weight: 600;  
}

.noun-home__title {  
  font-size: 32px;  
}

.noun-home__stats {  
  display: grid;  
  grid-template-columns: repeat(3, 1fr);  
  gap: var(--spacing-md);  
  margin-bottom: var(--spacing-xl);  
}

.stat {  
  background: var(--color-surface);  
  padding: var(--spacing-md);  
  border-radius: 8px;  
  box-shadow: var(--shadow-sm);  
  text-align: center;  
}

.stat__value {  
  font-size: 32px;  
  font-weight: 700;  
  color: var(--color-primary);  
}

.stat__label {  
  font-size: 14px;  
  color: var(--color-text-secondary);  
  margin-top: var(--spacing-xs);  
}

.noun-home__modes {  
  display: flex;  
  flex-direction: column;  
  align-items: center;  
  margin-bottom: var(--spacing-lg);  
}

.noun-home__actions {  
  display: flex;  
  gap: var(--spacing-sm);  
  justify-content: center;  
}

/* Session */  
.session {  
  max-width: 600px;  
  width: 100%;  
  position: relative;  
}

.session__header {  
  display: flex;  
  justify-content: space-between;  
  align-items: center;  
  margin-bottom: var(--spacing-lg);  
}

.session__quit {  
  background: none;  
  border: none;  
  font-size: 18px;  
  color: var(--color-text-secondary);  
  cursor: pointer;  
  padding: var(--spacing-xs);  
}

.session__mode {  
  font-size: 18px;  
  font-weight: 600;  
  color: var(--color-primary);  
}

.session__card-container {  
  margin-bottom: 120px;  
  min-height: 400px;  
  display: flex;  
  align-items: center;  
  justify-content: center;  
}

/* Card */  
.card {  
  background: var(--color-surface);  
  border-radius: 16px;  
  padding: var(--spacing-xl);  
  box-shadow: var(--shadow-lg);  
  width: 100%;  
  max-width: 500px;  
  transition: all 0.3s;  
}

.card--masculine {  
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);  
  color: white;  
}

.card--feminine {  
  background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%);  
  color: white;  
}

.card--neutral {  
  background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);  
  color: white;  
}

.card__front {  
  text-align: center;  
}

.card__word {  
  font-size: 48px;  
  font-weight: 700;  
  margin-bottom: var(--spacing-sm);  
}

.card__plural {  
  font-size: 24px;  
  opacity: 0.8;  
  margin-bottom: var(--spacing-xl);  
}

.card__input {  
  width: 100%;  
  padding: 16px;  
  font-size: 18px;  
  border: 2px solid rgba(255, 255, 255, 0.3);  
  border-radius: 8px;  
  background: rgba(255, 255, 255, 0.1);  
  color: white;  
  margin-bottom: var(--spacing-md);  
}

.card__input::placeholder {  
  color: rgba(255, 255, 255, 0.5);  
}

.card__input:focus {  
  outline: none;  
  border-color: rgba(255, 255, 255, 0.8);  
  background: rgba(255, 255, 255, 0.2);  
}

/* Card Back */  
.card-back {  
  color: var(--color-text);  
}

.card-back__header {  
  margin-bottom: var(--spacing-md);  
  padding-bottom: var(--spacing-md);  
  border-bottom: 2px solid var(--color-border);  
}

.card-back__word {  
  font-size: 24px;  
  font-weight: 700;  
}

.card-back__result {  
  font-size: 18px;  
  font-weight: 600;  
  margin-top: var(--spacing-xs);  
}

.card-back__result.correct {  
  color: var(--color-primary);  
}

.card-back__result.incorrect {  
  color: var(--color-danger);  
}

.card-back__translations {  
  margin-bottom: var(--spacing-md);  
  padding: var(--spacing-md);  
  background: var(--color-background);  
  border-radius: 8px;  
}

.card-back__warning {  
  margin-bottom: var(--spacing-md);  
  padding: var(--spacing-sm);  
  background: #FFF3CD;  
  border-left: 4px solid #FFC107;  
  border-radius: 4px;  
  color: #856404;  
}

.card-back__example {  
  margin-bottom: var(--spacing-lg);  
  padding: var(--spacing-md);  
  background: var(--color-background);  
  border-radius: 8px;  
}

/* Animations */  
@keyframes shake-correct {  
  0%, 100% { transform: translateX(0); }  
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }  
  20%, 40%, 60%, 80% { transform: translateX(5px); }  
}

@keyframes shake-incorrect {  
  0%, 100% { transform: translateX(0); }  
  10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }  
  20%, 40%, 60%, 80% { transform: translateX(8px); }  
}

.card--shake-correct {  
  animation: shake-correct 0.5s ease-in-out;  
}

.card--shake-incorrect {  
  animation: shake-incorrect 0.6s ease-in-out;  
}

/* Progress Bar */  
.progress-container {  
  position: fixed;  
  bottom: 0;  
  left: 0;  
  right: 0;  
  padding: var(--spacing-md) var(--spacing-lg);  
  background: var(--color-surface);  
  border-top: 1px solid var(--color-border);  
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);  
  z-index: 100;  
}

.progress-container__label {  
  text-align: center;  
  font-size: 14px;  
  font-weight: 600;  
  color: var(--color-text);  
  margin-bottom: var(--spacing-xs);  
}

.progress-container__bar {  
  width: 100%;  
  max-width: 600px;  
  margin: 0 auto;  
  height: 12px;  
  background: var(--color-border);  
  border-radius: 6px;  
  overflow: hidden;  
}

.progress-container__fill {  
  height: 100%;  
  background: var(--color-primary);  
  transition: width 0.3s ease;  
  border-radius: 6px;  
}

/* Results */  
.results {  
  text-align: center;  
  max-width: 500px;  
}

.results__title {  
  font-size: 36px;  
  margin-bottom: var(--spacing-lg);  
}

.results__score {  
  background: var(--color-surface);  
  padding: var(--spacing-lg);  
  border-radius: 12px;  
  box-shadow: var(--shadow-md);  
  margin-bottom: var(--spacing-lg);  
}

.results__score-number {  
  font-size: 32px;  
  font-weight: 700;  
  color: var(--color-primary);  
  margin-bottom: var(--spacing-xs);  
}

.results__accuracy {  
  font-size: 24px;  
  color: var(--color-text-secondary);  
}

.results__message {  
  font-size: 28px;  
  margin-bottom: var(--spacing-xl);  
}

.results__actions {  
  display: flex;  
  flex-direction: column;  
  align-items: center;  
  gap: var(--spacing-sm);  
}

/* Statistics */  
.stats {  
  max-width: 900px;  
  width: 100%;  
}

.stats__header {  
  display: flex;  
  align-items: center;  
  margin-bottom: var(--spacing-lg);  
}

.stats__back {  
  background: none;  
  border: none;  
  color: var(--color-primary);  
  font-size: 18px;  
  font-weight: 600;  
  cursor: pointer;  
  padding: var(--spacing-xs);  
}

.stats__title {  
  font-size: 32px;  
  margin-left: var(--spacing-md);  
}

.stats__metrics {  
  display: grid;  
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));  
  gap: var(--spacing-md);  
  margin-bottom: var(--spacing-xl);  
}

.stats__metric {  
  background: var(--color-surface);  
  padding: var(--spacing-md);  
  border-radius: 8px;  
  box-shadow: var(--shadow-sm);  
  text-align: center;  
}

.stats__metric-label {  
  font-size: 14px;  
  color: var(--color-text-secondary);  
  margin-bottom: var(--spacing-xs);  
}

.stats__metric-value {  
  font-size: 28px;  
  font-weight: 700;  
  color: var(--color-primary);  
}

.stats__section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--color-border);
}

.stats__streak-distribution {
  margin-bottom: var(--spacing-xl);
}

.streak-bar {
  display: flex;
  width: 100%;
  height: 40px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #f0f0f0;
}

.streak-bar__segment {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: var(--width);
  background-color: var(--color);
  color: #333;
  font-weight: 600;
  font-size: var(--font-size-sm);
  transition: width 0.5s ease-in-out;
  position: relative;
}

.streak-bar__segment:not(:last-child) {
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}

.streak-bar__label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.5);
}

.streak-bar__value {
  font-size: var(--font-size-base);
  font-weight: 700;
}

.stats__calendar {  
  background: var(--color-surface);  
  padding: var(--spacing-lg);  
  border-radius: 12px;  
  box-shadow: var(--shadow-sm);  
  min-height: 300px;  
  display: flex;  
  align-items: center;  
  justify-content: center;  
  color: var(--color-text-secondary);  
}

/* Responsive */  
@media (max-width: 768px) {  
  .launcher__title {  
    font-size: 36px;  
  }  
    
  .card__word {  
    font-size: 36px;  
  }  
    
  .card__plural {  
    font-size: 20px;  
  }  
    
  .noun-home__stats {  
    grid-template-columns: 1fr;  
  }  
    
  .stats__metrics {  
    grid-template-columns: repeat(2, 1fr);  
  }

}
```

**Lines of Code:** ~450 lines

---

## **Development Workflow**

### **Setup**

```bash
# Clone or create project directory  
mkdir german-learning-app  
cd german-learning-app

# Initialize npm  
npm init -y

# Install dependencies  
npm install express

# Create file structure  
mkdir -p public/core public/apps/nouns data/nouns

# Create files (use spec above for content)  
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

### **Running Development Server**

```bash
# Start server  
node server.js

# Browser automatically opens to http://localhost:3000  
# Or manually open: http://localhost:3000
```

### Development Cycle  
```  
1. Edit files in your editor  
2. Save changes  
3. Refresh browser (Cmd/Ctrl + R)  
4. Test changes

5. Repeat
```

**No build process. No webpack. No babel. Just edit and refresh.**

---

## **Initial Data Setup**

### **Creating First 50 Words**

**Manually create:** `data/nouns/active.json`

```json
{  
  "version": "1.0",  
  "lastUpdated": "2026-01-06T00:00:00Z",  
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
      "attempts": [],  
      "streak": 0,  
      "memorized": false,  
      "memorizedDate": null  
    }  
  ]

}
```

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
* Articles in answer ignored ("the dog" = "dog")  
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
* Export file contains active + archived + metadata  
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

* Handles <15 learning words gracefully  
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

```bash
cd german-learning-app  
git init  
git add data/

git commit -m "Progress checkpoint $(date)"
```

**Schedule daily commits:**

```bash
# Add to crontab (macOS/Linux)

0 22 * * * cd ~/german-learning-app && git add data/ && git commit -m "Daily backup $(date)"
```

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

* App load time: <200ms  
* Data load (500 words): <50ms  
* Archive check: <10ms  
* Card display: <30ms  
* Answer validation: <5ms  
* Save operation: <30ms  
* Statistics calculation: <20ms

**Memory Usage:**

* App idle: ~50MB  
* During session: ~70MB  
* With 5,000 words: ~100MB

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
* Interface feels responsive (<100ms interactions)  
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

**Problem:** Server won't start - "Port 3000 already in use" **Solution:** Kill existing process or use different port

```bash
# Find process using port 3000  
lsof -i :3000

# Kill process  
kill -9 <PID>

# Or use different port in server.js
```

**Problem:** Data not saving **Solution:** Check file permissions and paths

```bash
# Check if data directory exists  
ls -la data/nouns/

# Check file permissions

chmod -R 755 data/
```

**Problem:** Archive not running **Solution:** Check console for errors, verify metadata.json format

**Problem:** Cards not displaying **Solution:** Check browser console for JavaScript errors, verify data format

**Problem:** Slow performance **Solution:** Check active.json size, should be <500 words. Archive old words.

---

**END OF SPECIFICATION v4.0**

**Total Document Length:** ~25,000 words **Total Code Examples:** ~1,400 lines **Estimated Build Time:** 16-19 hours **Ready for Implementation:** Yes

---

**Next Steps:**

1. Review this specification  
2. Set up project structure  
3. Start with server.js and core files  
4. Build nouns app iteratively  
5. Test thoroughly  
6. Add 50 A1 words  
7. Use daily and iterate

Good luck! 🚀