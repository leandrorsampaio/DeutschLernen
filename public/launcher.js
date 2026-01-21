// ============================================
// GERMAN LEARNING APP - LAUNCHER
// ============================================
// Main app selection screen
// Loads and displays statistics for each available app

// ============================================
// INITIALIZATION
// ============================================

/**
 * Load statistics for all apps and display on launcher.
 */
async function init() {
  await loadAppStats();
}

// ============================================
// STATISTICS LOADING
// ============================================

/**
 * Load statistics for all apps and display on launcher.
 * Loads stats for nouns and derdiedas apps.
 */
async function loadAppStats() {
  // Load stats for both apps in parallel
  await Promise.all([
    loadNounsStats(),
    loadDerDieDasStats()
  ]);
}

/**
 * Load and display statistics for nouns app.
 */
async function loadNounsStats() {
  const statsEl = document.getElementById('nouns-stats');

  try {
    const response = await fetch('/api/nouns/metadata');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const metadata = await response.json();
    displayStats(statsEl, metadata);
  } catch (err) {
    console.error('Failed to load nouns stats:', err);
    statsEl.textContent = 'Failed to load stats';
    statsEl.style.color = 'var(--color-danger)';
  }
}

/**
 * Load and display statistics for Der Die Das app.
 */
async function loadDerDieDasStats() {
  const statsEl = document.getElementById('derdiedas-stats');

  try {
    const response = await fetch('/api/derdiedas/metadata');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const metadata = await response.json();
    displayStats(statsEl, metadata);
  } catch (err) {
    console.error('Failed to load derdiedas stats:', err);
    statsEl.textContent = 'Failed to load stats';
    statsEl.style.color = 'var(--color-danger)';
  }
}

/**
 * Display statistics in a stats element.
 * @param {HTMLElement} statsEl - Element to display stats in
 * @param {Object} metadata - Metadata object with stats
 */
function displayStats(statsEl, metadata) {
  const memorized = metadata.stats.memorizedWords || 0;
  const active = metadata.stats.activeWords || 0;
  const archived = metadata.stats.archivedWords || 0;

  if (active === 0 && memorized === 0 && archived === 0) {
    statsEl.textContent = 'No words yet - Add words to start learning';
    statsEl.style.color = 'var(--color-text-secondary)';
  } else {
    const parts = [];
    if (memorized > 0) parts.push(`${memorized} memorized`);
    if (active > 0) parts.push(`${active} active`);
    if (archived > 0) parts.push(`${archived} archived`);

    statsEl.textContent = parts.join(' • ');
    statsEl.style.color = 'var(--color-success)';
  }
}

// ============================================
// START APPLICATION
// ============================================

// Initialize when page loads
init();
