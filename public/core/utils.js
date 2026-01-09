// ============================================
// GERMAN LEARNING APP - UTILITY FUNCTIONS
// ============================================
// Shared helper functions used across all learning apps
// Includes text processing, validation, German language helpers, and data utilities

// ============================================
// TEXT PROCESSING & NORMALIZATION
// ============================================

/**
 * Normalize user input for comparison.
 * Removes articles, extra whitespace, and converts to lowercase.
 *
 * @param {string} text - Raw user input
 * @returns {string} Normalized text ready for comparison
 */
function normalizeInput(text) {
  return text
    .toLowerCase()
    .trim()
    // Remove common articles (English: the, a, an | Portuguese: o, a, os, as)
    .replace(/^(the|a|an|o|a|os|as)\s+/i, '')
    // Normalize multiple spaces to single space
    .replace(/\s+/g, ' ');
}

/**
 * Calculate Levenshtein distance between two strings.
 * Used for typo tolerance in answer validation.
 * Returns minimum number of edits (insertions, deletions, substitutions) needed.
 *
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Edit distance between strings
 */
function levenshtein(a, b) {
  const matrix = [];

  // Initialize first column (deletions from b)
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Initialize first row (insertions to a)
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix using dynamic programming
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        // Characters match, no edit needed
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        // Take minimum of three operations: substitute, insert, delete
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Check if user answer is correct with typo tolerance.
 * Allows 1 character difference for minor typos.
 *
 * @param {string} userInput - User's answer
 * @param {Array<string>} correctAnswers - Array of accepted answers
 * @returns {boolean} True if answer is correct or close enough
 */
function isCorrectAnswer(userInput, correctAnswers) {
  const normalized = normalizeInput(userInput);

  return correctAnswers.some(answer => {
    const normalizedAnswer = normalizeInput(answer);

    // Exact match (case-insensitive, no articles)
    if (normalized === normalizedAnswer) return true;

    // Typo tolerance: allow 1 character difference
    if (levenshtein(normalized, normalizedAnswer) <= 1) return true;

    return false;
  });
}

// ============================================
// GERMAN LANGUAGE HELPERS
// ============================================

/**
 * Get color code for German article (gender indication).
 * Visual aid to help learn der/die/das patterns.
 *
 * @param {string} article - German article (der, die, das)
 * @returns {string} Gender identifier (masculine, feminine, neutral)
 */
function getGenderClass(article) {
  switch (article) {
    case 'der':
      return 'masculine'; // Blue
    case 'die':
      return 'feminine';  // Red
    case 'das':
      return 'neutral';   // Green
    default:
      return 'neutral';
  }
}

/**
 * Format German noun with article and plural for display.
 *
 * @param {string} article - German article
 * @param {string} noun - German noun
 * @param {string} plural - Plural form
 * @returns {string} Formatted string (e.g., "der Hund → die Hunde")
 */
function formatGermanNoun(article, noun, plural) {
  return `${article} ${noun} → ${plural}`;
}

// ============================================
// ARRAY MANIPULATION
// ============================================

/**
 * Shuffle array using Fisher-Yates algorithm.
 * Creates new array to avoid mutating original.
 *
 * @param {Array} array - Array to shuffle
 * @returns {Array} New shuffled array
 */
function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Select random items from array without duplicates.
 *
 * @param {Array} array - Source array
 * @param {number} count - Number of items to select
 * @returns {Array} Array of randomly selected items
 */
function selectRandom(array, count) {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

// ============================================
// DATE & TIME UTILITIES
// ============================================

/**
 * Get current date in ISO format (YYYY-MM-DD).
 *
 * @returns {string} Today's date
 */
function todayISO() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculate days between two dates.
 *
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Number of days between dates
 */
function daysBetween(date1, date2) {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const oneDay = 1000 * 60 * 60 * 24;
  const diff = Math.abs(d2 - d1);
  return Math.floor(diff / oneDay);
}

/**
 * Format milliseconds to human-readable time.
 *
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time (e.g., "3s", "2m 30s")
 */
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Format date to readable string.
 *
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date (e.g., "Jan 9, 2026")
 */
function formatDate(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ============================================
// STATISTICS & CALCULATIONS
// ============================================

/**
 * Calculate streak from attempts array.
 * Counts consecutive correct answers from end of array.
 *
 * @param {Array} attempts - Array of attempt objects with 'correct' property
 * @returns {number} Current streak count
 */
function calculateStreak(attempts) {
  if (!attempts || attempts.length === 0) return 0;

  let streak = 0;
  // Count backwards from most recent attempt
  for (let i = attempts.length - 1; i >= 0; i--) {
    if (attempts[i].correct) {
      streak++;
    } else {
      break; // Streak broken by incorrect answer
    }
  }
  return streak;
}

/**
 * Calculate accuracy percentage from attempts.
 *
 * @param {Array} attempts - Array of attempt objects
 * @returns {number} Accuracy as decimal (0 to 1)
 */
function calculateAccuracy(attempts) {
  if (!attempts || attempts.length === 0) return 0;

  const correct = attempts.filter(a => a.correct).length;
  return correct / attempts.length;
}

/**
 * Calculate average response time from attempts.
 *
 * @param {Array} attempts - Array of attempt objects with 'ms' property
 * @returns {number} Average time in milliseconds
 */
function calculateAverageTime(attempts) {
  if (!attempts || attempts.length === 0) return 0;

  const total = attempts.reduce((sum, a) => sum + (a.ms || 0), 0);
  return Math.round(total / attempts.length);
}

// ============================================
// PERFORMANCE UTILITIES
// ============================================

/**
 * Debounce function to limit execution frequency.
 * Useful for input validation, auto-save, etc.
 *
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
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

/**
 * Throttle function to limit execution rate.
 * Ensures function runs at most once per interval.
 *
 * @param {Function} func - Function to throttle
 * @param {number} limit - Milliseconds between executions
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================
// LOCALSTORAGE HELPERS
// ============================================

/**
 * Safely get item from localStorage with JSON parsing.
 * Returns null if key doesn't exist or parsing fails.
 *
 * @param {string} key - localStorage key
 * @returns {any} Parsed value or null
 */
function getFromStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (err) {
    console.error(`Failed to read from localStorage: ${key}`, err);
    return null;
  }
}

/**
 * Safely set item in localStorage with JSON stringification.
 *
 * @param {string} key - localStorage key
 * @param {any} value - Value to store
 * @returns {boolean} True if successful
 */
function setInStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Failed to write to localStorage: ${key}`, err);
    return false;
  }
}

/**
 * Remove item from localStorage.
 *
 * @param {string} key - localStorage key
 */
function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`Failed to remove from localStorage: ${key}`, err);
  }
}

/**
 * Clear all localStorage data for this app.
 */
function clearStorage() {
  try {
    localStorage.clear();
  } catch (err) {
    console.error('Failed to clear localStorage', err);
  }
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate word object structure.
 * Ensures all required fields are present and valid.
 *
 * @param {Object} word - Word object to validate
 * @returns {boolean} True if valid
 */
function isValidWord(word) {
  if (!word || typeof word !== 'object') return false;

  // Required fields for all word types
  const requiredFields = ['id', 'de', 'en', 'pt', 'example', 'examplePt', 'level'];

  // Check all required fields exist
  return requiredFields.every(field => word.hasOwnProperty(field));
}

/**
 * Validate noun-specific fields.
 *
 * @param {Object} noun - Noun object to validate
 * @returns {boolean} True if valid noun
 */
function isValidNoun(noun) {
  if (!isValidWord(noun)) return false;

  // Nouns require article and plural
  return noun.hasOwnProperty('article') &&
         noun.hasOwnProperty('plural') &&
         ['der', 'die', 'das'].includes(noun.article);
}

// ============================================
// EXPORTS (for module systems)
// ============================================
// Note: These are commented out since we're using plain script tags
// Uncomment if switching to ES6 modules

/*
export {
  normalizeInput,
  levenshtein,
  isCorrectAnswer,
  getGenderClass,
  formatGermanNoun,
  shuffle,
  selectRandom,
  todayISO,
  daysBetween,
  formatTime,
  formatDate,
  calculateStreak,
  calculateAccuracy,
  calculateAverageTime,
  debounce,
  throttle,
  getFromStorage,
  setInStorage,
  removeFromStorage,
  clearStorage,
  isValidWord,
  isValidNoun
};
*/
