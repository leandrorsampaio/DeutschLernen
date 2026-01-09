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
 * Currently only nouns app is implemented.
 */
async function init() {
  await loadAppStats();
}

// ============================================
// STATISTICS LOADING
// ============================================

/**
 * Load and display statistics for nouns app.
 * Shows number of words in different learning states.
 */
async function loadAppStats() {
  const statsEl = document.getElementById('nouns-stats');

  try {
    // Fetch metadata from server
    const response = await fetch('/api/nouns/metadata');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const metadata = await response.json();

    // Display statistics in human-readable format
    const memorized = metadata.stats.memorizedWords || 0;
    const active = metadata.stats.activeWords || 0;
    const archived = metadata.stats.archivedWords || 0;

    // Show relevant stats based on what's available
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
  } catch (err) {
    console.error('Failed to load nouns stats:', err);
    statsEl.textContent = 'Failed to load stats';
    statsEl.style.color = 'var(--color-danger)';
  }
}

// ============================================
// START APPLICATION
// ============================================

// Initialize when page loads
init();
