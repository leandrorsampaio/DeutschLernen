// ============================================
// GERMAN LEARNING APP - LEARNING ENGINE
// ============================================
// Core learning logic shared across all apps (nouns, verbs, expressions)
// Handles data loading, word selection, progress tracking, and archiving

// ============================================
// LEARNING ENGINE CLASS
// ============================================

class LearningEngine {
  /**
   * Initialize learning engine for a specific app.
   *
   * @param {string} appName - App identifier (nouns, verbs, expressions)
   */
  constructor(appName) {
    this.appName = appName;
    this.activeWords = [];
    this.archivedWords = [];
    this.metadata = {};
    this.loaded = false;
  }

  // ============================================
  // DATA LOADING & INITIALIZATION
  // ============================================

  /**
   * Load all app data from server API.
   * Also loads from LocalStorage for immediate UI updates.
   * Automatically triggers archive check after loading.
   *
   * @returns {Promise<boolean>} True if load successful
   */
  async load() {
    try {
      // Try loading from LocalStorage first for instant UI
      const cached = getFromStorage(`${this.appName}-data`);
      if (cached && cached.activeWords) {
        this.activeWords = cached.activeWords;
        this.metadata = cached.metadata;
        // Continue loading from server in background
      }

      // Load fresh data from server
      const [activeResponse, metadataResponse] = await Promise.all([
        fetch(`/api/${this.appName}/active`),
        fetch(`/api/${this.appName}/metadata`)
      ]);

      if (!activeResponse.ok || !metadataResponse.ok) {
        throw new Error(`Network response was not ok. Status: ${activeResponse.status}, ${metadataResponse.status}`);
      }

      const active = await activeResponse.json();
      const metadata = await metadataResponse.json();

      this.activeWords = active.words;
      this.metadata = metadata;
      this.loaded = true;

      // Update LocalStorage cache
      setInStorage(`${this.appName}-data`, {
        activeWords: this.activeWords,
        metadata: this.metadata,
        lastSync: new Date().toISOString()
      });

      // Check if any words need archiving
      await this.checkArchive();

      return true;
    } catch (err) {
      console.error('Failed to load data:', err);
      if (err.message.includes('Failed to fetch')) {
        alert('Failed to connect to the server. Please ensure the server is running by executing "node server.js" in your terminal.');
      } else {
        alert('An error occurred while loading data. Please check the console for details.');
      }
      return false;
    }
  }

  /**
   * Load archived words (lazy loading - only when needed).
   * Archive data is not loaded by default to improve performance.
   *
   * @returns {Promise<boolean>} True if load successful
   */
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

  // ============================================
  // DATA PERSISTENCE
  // ============================================

  /**
   * Save all data to server and LocalStorage.
   * Called after each practice session and significant changes.
   *
   * @returns {Promise<boolean>} True if save successful
   */
  async save() {
    try {
      // Save to server (primary storage)
      const responses = await Promise.all([
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

      for (const response of responses) {
        if (!response.ok) {
          throw new Error(`Failed to save data to server. Status: ${response.status}`);
        }
      }

      // Update LocalStorage cache
      setInStorage(`${this.appName}-data`, {
        activeWords: this.activeWords,
        metadata: this.metadata,
        lastSync: new Date().toISOString()
      });

      return true;
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save your progress to the server. Please check the console for details.');
      return false;
    }
  }

  // ============================================
  // WORD SELECTION & WEIGHTING
  // ============================================

  /**
   * Select words for normal practice session using weighted random sampling.
   * Failed words and low-streak words get higher priority.
   *
   * Mode 1: Normal Practice
   * - Only non-memorized words
   * - Weighted by recent failures, streak, difficulty
   *
   * @param {number} count - Number of words to select (default 15)
   * @returns {Array} Selected word objects
   */
  selectForPractice(count = 15) {
    // Filter to only non-memorized words
    const learning = this.activeWords.filter(w => !w.memorized);

    if (learning.length === 0) {
      return [];
    }

    // If we have fewer words than requested, return all
    if (learning.length <= count) {
      return learning;
    }

    // Apply weighted selection
    return this.weightedSample(learning, count);
  }

  /**
   * Select recently memorized words for review (Mode 2).
   * Prioritizes oldest memorizations (closest to archive threshold).
   *
   * @param {number} count - Number of words to select (default 10)
   * @returns {Array} Selected memorized words
   */
  selectForReview(count = 10) {
    // Filter to only memorized words
    const memorized = this.activeWords.filter(w => w.memorized);

    if (memorized.length === 0) {
      return [];
    }

    // Sort by memorizedDate (oldest first = closest to archiving)
    return memorized
      .sort((a, b) => new Date(a.memorizedDate) - new Date(b.memorizedDate))
      .slice(0, Math.min(count, memorized.length));
  }

  /**
   * Select archived words for review (Mode 3).
   * Prioritizes words never reviewed before.
   *
   * @param {number} count - Number of words to select (default 10)
   * @returns {Promise<Array>} Selected archived words
   */
  async selectForArchiveReview(count = 10) {
    // Load archived words if not already loaded
    await this.loadArchived();

    if (this.archivedWords.length === 0) {
      return [];
    }

    // Prioritize words that have never been reviewed
    const sorted = this.archivedWords.sort((a, b) => {
      if (!a.lastReviewDate && !b.lastReviewDate) return 0;
      if (!a.lastReviewDate) return -1; // Never reviewed comes first
      if (!b.lastReviewDate) return 1;
      return new Date(a.lastReviewDate) - new Date(b.lastReviewDate);
    });

    return sorted.slice(0, Math.min(count, this.archivedWords.length));
  }

  /**
   * Apply weighted random sampling to word list.
   * Words with higher weights are more likely to be selected.
   *
   * Weight factors:
   * - Recently failed: 3x weight
   * - Low streak (1-2): 2x weight
   * - High difficulty: 2x weight
   * - Low difficulty: 0.5x weight
   *
   * @param {Array} words - Words to sample from
   * @param {number} count - Number to select
   * @returns {Array} Weighted random selection
   */
  weightedSample(words, count) {
    const weighted = words.map(word => {
      let weight = 1;

      // Recently failed? Prioritize for practice (3x weight)
      const lastAttempt = word.attempts?.[word.attempts.length - 1];
      if (lastAttempt && !lastAttempt.correct) {
        weight *= 3;
      }

      // Low streak? Needs more practice (2x weight)
      if (word.streak > 0 && word.streak <= 2) {
        weight *= 2;
      }

      // Adjust for difficulty level
      if (word.difficulty === 3) weight *= 2;   // Hard words
      if (word.difficulty === 1) weight *= 0.5; // Easy words

      return { word, weight };
    });

    return this._weightedRandomSample(weighted, count);
  }

  /**
   * Weighted random selection algorithm.
   * Implements probability-based selection without duplicates.
   *
   * @param {Array} weightedItems - Array of {word, weight} objects
   * @param {number} count - Number of items to select
   * @returns {Array} Selected words
   */
  _weightedRandomSample(weightedItems, count) {
    const selected = [];
    const available = [...weightedItems];

    for (let i = 0; i < count && available.length > 0; i++) {
      // Calculate total weight of remaining items
      const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
      let random = Math.random() * totalWeight;

      // Select item based on weighted probability
      for (let j = 0; j < available.length; j++) {
        random -= available[j].weight;
        if (random <= 0) {
          selected.push(available[j].word);
          available.splice(j, 1); // Remove to prevent duplicates
          break;
        }
      }
    }

    return selected;
  }

  // ============================================
  // PROGRESS TRACKING
  // ============================================

  /**
   * Record a practice attempt for a word.
   * Updates attempts history, streak, and memorization status.
   *
   * @param {number} wordId - ID of word practiced
   * @param {boolean} correct - Whether answer was correct
   * @param {number} timeMs - Time taken in milliseconds
   */
  recordAttempt(wordId, correct, timeMs) {
    const word = this.activeWords.find(w => w.id === wordId);

    if (!word) return;

    // Initialize attempts array if needed
    if (!word.attempts) word.attempts = [];

    // Add attempt to history
    word.attempts.push({
      date: todayISO(),
      correct,
      ms: timeMs
    });

    // Update streak
    if (correct) {
      word.streak = (word.streak || 0) + 1;

      // Check if word is now memorized (5 correct in a row)
      if (word.streak >= 5 && !word.memorized) {
        word.memorized = true;
        word.memorizedDate = todayISO();
      }
    } else {
      // Incorrect answer resets streak
      word.streak = 0;
      // Also unmemorize if was previously memorized
      if (word.memorized) {
        word.memorized = false;
        word.memorizedDate = null;
      }
    }
  }

  /**
   * Record archive review attempt.
   * Tracks failures to determine if word needs unarchiving.
   *
   * @param {number} wordId - ID of archived word
   * @param {boolean} correct - Whether answer was correct
   * @returns {boolean} True if word was unarchived
   */
  recordArchiveAttempt(wordId, correct) {
    const word = this.archivedWords.find(w => w.id === wordId);

    if (!word) return false;

    // Update last review date
    word.lastReviewDate = todayISO();

    if (!correct) {
      // Increment failure counter
      word.reviewFailures = (word.reviewFailures || 0) + 1;

      // Unarchive if failed threshold reached (default 2 failures)
      if (word.reviewFailures >= this.metadata.settings.unarchiveFailureThreshold) {
        this.unarchiveWord(wordId);
        return true; // Signal that word was unarchived
      }
    } else {
      // Reset failure counter on correct answer
      word.reviewFailures = 0;
    }

    return false;
  }

  // ============================================
  // STATISTICS CALCULATION
  // ============================================

  /**
   * Calculate current learning statistics.
   * Used for dashboard display and progress tracking.
   *
   * @returns {Object} Statistics object with counts and metrics
   */
  getStats() {
    const learning = this.activeWords.filter(w => !w.memorized);
    const memorized = this.activeWords.filter(w => w.memorized);

    // Calculate accuracy from all attempts
    const allAttempts = this.activeWords.flatMap(w => w.attempts || []);
    const totalAttempts = allAttempts.length;
    const totalCorrect = allAttempts.filter(a => a.correct).length;

    return {
      total: this.metadata.stats.totalWords,
      active: this.activeWords.length,
      learning: learning.length,
      memorized: memorized.length,
      archived: this.metadata.stats.archivedWords,
      totalAttempts,
      accuracy: totalAttempts > 0 ? totalCorrect / totalAttempts : 0,
      currentStreak: this.metadata.stats.currentStreak,
      longestStreak: this.metadata.stats.longestStreak
    };
  }

  /**
   * Update session statistics after completing practice.
   * Updates metadata with session results and recalculates running averages.
   *
   * @param {Array<boolean>} sessionResults - Array of correct/incorrect per card
   */
  async updateSessionStats(sessionResults) {
    const correct = sessionResults.filter(r => r).length;
    const total = sessionResults.length;

    // Increment session counter
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

    // Save updated metadata
    await fetch(`/api/${this.appName}/metadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.metadata)
    });
  }

  // ============================================
  // ARCHIVE MANAGEMENT
  // ============================================

  /**
   * Check and trigger automatic archiving process.
   * Calls server API to move old memorized words to archive.
   * Runs automatically on load and after each session.
   */
  async checkArchive() {
    try {
      const response = await fetch(`/api/${this.appName}/archive`, {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.archived > 0) {
          // Reload data to reflect archived words
          await this.load();
        }
      }
    } catch (err) {
      console.warn('Archive check failed:', err);
    }
  }

  /**
   * Unarchive a word back to active learning.
   * Called when user fails archived word multiple times.
   * Word is decompressed and learning progress is reset.
   *
   * @param {number} wordId - ID of word to unarchive
   */
  async unarchiveWord(wordId) {
    const word = this.archivedWords.find(w => w.id === wordId);

    if (!word) return;

    // Decompress: restore full structure from archived format
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
      // Reset learning progress
      attempts: [{
        date: todayISO(),
        correct: false,
        ms: 0
      }],
      streak: 0,
      memorized: false,
      memorizedDate: null
    };

    // Move from archived to active
    this.activeWords.push(restored);
    this.archivedWords = this.archivedWords.filter(w => w.id !== wordId);

    // Save changes
    await this.save();
  }
}
