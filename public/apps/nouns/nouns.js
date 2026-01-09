// ============================================
// NOUNS APP - MAIN APPLICATION LOGIC
// ============================================
// Handles practice sessions, card display, user interactions, and progress tracking

// ============================================
// GLOBAL STATE
// ============================================

let engine; // Learning engine instance
let currentSession = []; // Words in current practice session
let currentCardIndex = 0; // Current position in session
let sessionResults = []; // Array of boolean (correct/incorrect) per card
let sessionMode = 'practice'; // Current mode: 'practice', 'review', 'archive'
let cardStartTime = 0; // Timestamp when card was shown (for response time tracking)

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the nouns app on page load.
 * Creates learning engine and loads data from server.
 */
async function init() {
  // Show home screen initially
  showScreen('home-screen');

  // Create learning engine for nouns app
  engine = new LearningEngine('nouns');

  // Load all data (active words, metadata)
  const loaded = await engine.load();

  if (!loaded) {
    alert('Failed to load data. Please refresh the page and try again.');
    return;
  }

  // Update statistics on home screen
  updateHomeStats();

  // Attach all event listeners
  attachEventListeners();
}

// ============================================
// HOME SCREEN - STATISTICS & MODE SELECTION
// ============================================

/**
 * Update home screen statistics display.
 * Shows counts of learning, memorized, and archived words.
 * Disables mode buttons if no words are available.
 */
function updateHomeStats() {
  const stats = engine.getStats();
  const settings = engine.metadata.settings;

  // Update count displays
  document.getElementById('learning-count').textContent = stats.learning;
  document.getElementById('memorized-count').textContent = stats.memorized;
  document.getElementById('archived-count').textContent = stats.archived;

  // Update button text with session length from settings
  document.getElementById('start-practice').textContent = `Practice New Words (${settings.sessionLength} cards)`;
  document.getElementById('start-review').textContent = `Review Recently Memorized (10 cards)`;
  document.getElementById('start-archive-review').textContent = `Review Archive (10 cards)`;


  // Disable buttons if no words available for that mode
  document.getElementById('start-practice').disabled = stats.learning === 0;
  document.getElementById('start-review').disabled = stats.memorized === 0;
  document.getElementById('start-archive-review').disabled = stats.archived === 0;
}

// ============================================
// EVENT LISTENERS
// ============================================

/**
 * Attach all event listeners for buttons and interactions.
 * Called once during initialization.
 */
function attachEventListeners() {
  // Home screen buttons
  document.getElementById('start-practice').addEventListener('click', () => {
    const sessionLength = engine.metadata.settings.sessionLength || 15;
    startSession('practice', sessionLength);
  });
  document.getElementById('start-review').addEventListener('click', () => startSession('review', 10));
  document.getElementById('start-archive-review').addEventListener('click', () => startSession('archive', 10));
  document.getElementById('view-stats').addEventListener('click', showStatistics);
  document.getElementById('export-data').addEventListener('click', exportData);

  // Practice screen buttons
  document.getElementById('quit-session').addEventListener('click', quitSession);

  // Results screen buttons
  document.getElementById('try-again').addEventListener('click', () => {
    const sessionLength = sessionMode === 'practice' ? (engine.metadata.settings.sessionLength || 15) : 10;
    startSession(sessionMode, sessionLength);
  });
  document.getElementById('return-home').addEventListener('click', returnHome);

  // Statistics screen buttons
  document.getElementById('stats-back').addEventListener('click', returnHome);
}

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Start a new practice session.
 * Selects words based on mode and displays first card.
 *
 * @param {string} mode - Practice mode ('practice', 'review', 'archive')
 * @param {number} count - Number of cards in session
 */
async function startSession(mode, count) {
  sessionMode = mode;
  currentCardIndex = 0;
  sessionResults = [];

  // Select words based on mode using learning engine
  if (mode === 'practice') {
    currentSession = engine.selectForPractice(count);
  } else if (mode === 'review') {
    currentSession = engine.selectForReview(count);
  } else if (mode === 'archive') {
    currentSession = await engine.selectForArchiveReview(count);
  }

  // Check if words are available
  if (currentSession.length === 0) {
    alert('No words available for this mode. Try a different practice mode.');
    return;
  }

  // Update session mode display
  const modeNames = {
    'practice': 'Practice',
    'review': 'Review Recently Memorized',
    'archive': 'Archive Review'
  };
  document.getElementById('session-mode').textContent = modeNames[mode];

  // Show practice screen and first card
  showScreen('practice-screen');
  showCard(currentSession[currentCardIndex]);
}

/**
 * Quit current session.
 * Saves progress and returns to home screen.
 */
function quitSession() {
  if (confirm('Quit session? Your progress will be saved.')) {
    engine.save();
    returnHome();
  }
}

// ============================================
// CARD DISPLAY
// ============================================

/**
 * Display a word card (front side with question).
 * Shows German word with article and plural, prompts for translation.
 *
 * @param {Object} word - Word object to display
 */
function showCard(word) {
  const card = document.getElementById('card');

  // Get gender class for color coding (der=blue, die=red, das=green)
  const genderClass = getGenderClass(word.article);

  // Reset card styling
  card.className = `card card--${genderClass}`;

  // Build card front HTML
  card.innerHTML = `
    <div class="card__front">
      <div class="card__word">${word.article} ${word.de}</div>
      <div class="card__plural">${word.plural}</div>
      <input
        type="text"
        class="card__input"
        id="answer-input"
        placeholder="Type translation (English or Portuguese)..."
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
      />
      <button class="button button--primary button--large" id="check-answer">Check Answer</button>
    </div>
  `;

  // Focus input for immediate typing
  const input = document.getElementById('answer-input');
  input.focus();

  // Attach event listeners
  document.getElementById('check-answer').addEventListener('click', checkAnswer);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
  });

  // Update progress bar
  updateProgressBar();

  // Start timer for response time tracking
  cardStartTime = Date.now();
}

/**
 * Check user's answer and provide feedback.
 * Uses utility function for typo tolerance and article removal.
 */
function checkAnswer() {
  const input = document.getElementById('answer-input');
  const userAnswer = input.value.trim();

  // Require non-empty answer
  if (!userAnswer) {
    input.focus();
    return;
  }

  const word = currentSession[currentCardIndex];

  // Combine English and Portuguese translations
  const allAnswers = [...word.en, ...word.pt];

  // Check if answer is correct (with typo tolerance)
  const correct = isCorrectAnswer(userAnswer, allAnswers);

  // Calculate response time
  const timeMs = Date.now() - cardStartTime;

  // Record attempt in learning engine
  if (sessionMode === 'archive') {
    // Archive review has special handling (unarchive on multiple failures)
    const unarchived = engine.recordArchiveAttempt(word.id, correct);
    if (unarchived) {
      alert(`⚠️ Word unarchived: ${word.de}\nYou'll see it in normal practice now.`);
    }
  } else {
    // Normal practice or review mode
    engine.recordAttempt(word.id, correct, timeMs);
  }

  // Store result for session statistics
  sessionResults.push(correct);

  // Show feedback (card back)
  showCardBack(word, correct);
}

/**
 * Show card back with feedback and full word information.
 * Animates card with shake effect, then displays answer details.
 *
 * @param {Object} word - Word object
 * @param {boolean} correct - Whether answer was correct
 */
function showCardBack(word, correct) {
  const card = document.getElementById('card');

  // Animate card with shake effect
  card.classList.add(correct ? 'card--shake-correct' : 'card--shake-incorrect');

  // After animation, show card back
  setTimeout(() => {
    card.classList.remove('card--shake-correct', 'card--shake-incorrect');

    // Build card back HTML with full word information
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
          🇬🇧 ${word.en.join(', ')}<br>
          🇧🇷 ${word.pt.join(', ')}
        </div>

        ${word.warning ? `<div class="card-back__warning">⚠️ ${word.warning}</div>` : ''}

        <div class="card-back__example">
          <strong>Example:</strong><br>
          ${word.example}<br>
          <em>(${word.examplePt})</em>
        </div>

        <button class="button button--primary button--large" id="next-card">
          ${currentCardIndex < currentSession.length - 1 ? 'Next Card →' : 'Finish Session'}
        </button>
      </div>
    `;

    // Attach event listener for next card
    document.getElementById('next-card').addEventListener('click', nextCard);
    document.getElementById('next-card').focus();
  }, 500); // Match animation duration
}

// ============================================
// SESSION FLOW
// ============================================

/**
 * Move to next card or finish session.
 * Advances index and shows next card, or completes session if done.
 */
async function nextCard() {
  currentCardIndex++;

  if (currentCardIndex < currentSession.length) {
    // Show next card
    showCard(currentSession[currentCardIndex]);
  } else {
    // Session complete
    await finishSession();
  }
}

/**
 * Finish practice session.
 * Saves data, updates statistics, and shows results screen.
 */
async function finishSession() {
  // Save all data to server and LocalStorage
  await engine.save();

  // Update session statistics in metadata
  await engine.updateSessionStats(sessionResults);

  // Show results screen
  showResults();
}

// ============================================
// RESULTS DISPLAY
// ============================================

/**
 * Display session results with score and motivational message.
 * Calculates accuracy and provides performance feedback.
 */
function showResults() {
  const correct = sessionResults.filter(r => r).length;
  const total = sessionResults.length;
  const accuracy = Math.round((correct / total) * 100);

  // Update score display
  document.getElementById('score-number').textContent = `${correct} out of ${total} correct`;
  document.getElementById('accuracy').textContent = `${accuracy}%`;

  // Determine motivational message based on performance
  let message = '';
  if (correct === total) {
    message = 'Perfect! 🌟';
  } else if (correct >= total - 2) {
    message = 'Excellent! 🎉';
  } else if (correct >= total - 5) {
    message = 'Great job! 👏';
  } else if (correct >= total - 8) {
    message = 'Good effort! 💪';
  } else {
    message = 'Keep practicing! 📚';
  }

  document.getElementById('results-message').textContent = message;

  // Show results screen
  showScreen('results-screen');
}

// ============================================
// PROGRESS BAR
// ============================================

/**
 * Update progress bar to show session completion.
 * Displays current card number and visual progress percentage.
 */
function updateProgressBar() {
  const current = currentCardIndex + 1;
  const total = currentSession.length;
  const percentage = (current / total) * 100;

  document.getElementById('progress-label').textContent = `Card ${current} of ${total}`;
  document.getElementById('progress-fill').style.width = `${percentage}%`;
}

// ============================================
// STATISTICS SCREEN
// ============================================

/**
 * Show statistics screen with learning metrics.
 * Displays streak, accuracy, and session count.
 */
async function showStatistics() {
  const stats = engine.getStats();

  // Update metric displays
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


  // TODO: Generate calendar visualization (Phase 2)

  showScreen('stats-screen');
}

// ============================================
// DATA EXPORT
// ============================================

/**
 * Export all app data as downloadable JSON backup.
 * Triggers browser download with timestamped filename.
 */
async function exportData() {
  try {
    const response = await fetch('/api/nouns/export');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Create temporary download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `nouns-backup-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    alert('Export failed. Please try again.');
    console.error('Export error:', err);
  }
}

// ============================================
// NAVIGATION
// ============================================

/**
 * Return to home screen.
 * Updates statistics to reflect any changes.
 */
function returnHome() {
  updateHomeStats();
  showScreen('home-screen');
}

/**
 * Show specific screen and hide all others.
 * Manages screen visibility for single-page app navigation.
 *
 * @param {string} screenId - ID of screen to show
 */
function showScreen(screenId) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('screen--hidden');
  });

  // Show requested screen
  document.getElementById(screenId).classList.remove('screen--hidden');
}

// ============================================
// START APPLICATION
// ============================================

// Initialize app when page loads
init();
