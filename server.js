// ============================================
// GERMAN LEARNING APP - EXPRESS SERVER
// ============================================
// Minimal API server for managing vocabulary data across multiple learning apps
// Uses file-based JSON storage with automatic directory initialization

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Parse JSON request bodies (max 10MB to handle large word lists)
app.use(express.json({ limit: '10mb' }));

// Serve static files from public directory (HTML, CSS, JS)
app.use(express.static('public'));

// ============================================
// DATA DIRECTORY INITIALIZATION
// ============================================

/**
 * Initialize data directories and default JSON files for all apps.
 * Creates directory structure and empty data files if they don't exist.
 * Runs automatically on server startup.
 */
async function initDataDirs() {
  const apps = ['nouns', 'verbs', 'expressions'];

  for (const appName of apps) {
    const appDir = path.join(DATA_DIR, appName);

    try {
      // Create app directory if it doesn't exist
      await fs.mkdir(appDir, { recursive: true });

      // Define paths for the three required JSON files
      const activeFile = path.join(appDir, 'active.json');
      const archivedFile = path.join(appDir, 'archived.json');
      const metadataFile = path.join(appDir, 'metadata.json');

      // Initialize active.json if missing
      try {
        await fs.access(activeFile);
      } catch {
        await fs.writeFile(activeFile, JSON.stringify({
          version: "1.0",
          lastUpdated: new Date().toISOString(),
          words: []
        }, null, 2));
      }

      // Initialize archived.json if missing
      try {
        await fs.access(archivedFile);
      } catch {
        await fs.writeFile(archivedFile, JSON.stringify({
          version: "1.0",
          lastUpdated: new Date().toISOString(),
          words: []
        }, null, 2));
      }

      // Initialize metadata.json if missing with default settings
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
      console.error(`Failed to initialize ${appName}:`, err);
    }
  }
}

// ============================================
// API ENDPOINTS - DATA LOADING
// ============================================

/**
 * GET /api/:app/active
 * Load active words for specified app (nouns, verbs, or expressions)
 */
app.get('/api/:app/active', async (req, res) => {
  const appName = req.params.app;
  const file = path.join(DATA_DIR, appName, 'active.json');

  try {
    const data = await fs.readFile(file, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error(`Failed to load active words for ${appName}:`, err);
    res.status(500).json({ error: 'Failed to load active words' });
  }
});

/**
 * GET /api/:app/archived
 * Load archived words for specified app
 */
app.get('/api/:app/archived', async (req, res) => {
  const appName = req.params.app;
  const file = path.join(DATA_DIR, appName, 'archived.json');

  try {
    const data = await fs.readFile(file, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error(`Failed to load archived words for ${appName}:`, err);
    res.status(500).json({ error: 'Failed to load archived words' });
  }
});

/**
 * GET /api/:app/metadata
 * Load app metadata (settings and statistics)
 */
app.get('/api/:app/metadata', async (req, res) => {
  const appName = req.params.app;
  const file = path.join(DATA_DIR, appName, 'metadata.json');

  try {
    const data = await fs.readFile(file, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error(`Failed to load metadata for ${appName}:`, err);
    res.status(500).json({ error: 'Failed to load metadata' });
  }
});

// ============================================
// API ENDPOINTS - DATA SAVING
// ============================================

/**
 * POST /api/:app/active
 * Save active words for specified app
 * Auto-updates lastUpdated timestamp
 */
app.post('/api/:app/active', async (req, res) => {
  const appName = req.params.app;
  const file = path.join(DATA_DIR, appName, 'active.json');

  try {
    // Add timestamp to track when data was last modified
    req.body.lastUpdated = new Date().toISOString();
    await fs.writeFile(file, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error(`Failed to save active words for ${appName}:`, err);
    res.status(500).json({ error: 'Failed to save active words' });
  }
});

/**
 * POST /api/:app/archived
 * Save archived words for specified app
 */
app.post('/api/:app/archived', async (req, res) => {
  const appName = req.params.app;
  const file = path.join(DATA_DIR, appName, 'archived.json');

  try {
    req.body.lastUpdated = new Date().toISOString();
    await fs.writeFile(file, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error(`Failed to save archived words for ${appName}:`, err);
    res.status(500).json({ error: 'Failed to save archived words' });
  }
});

/**
 * POST /api/:app/metadata
 * Save app metadata (settings and statistics)
 */
app.post('/api/:app/metadata', async (req, res) => {
  const appName = req.params.app;
  const file = path.join(DATA_DIR, appName, 'metadata.json');

  try {
    await fs.writeFile(file, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error(`Failed to save metadata for ${appName}:`, err);
    res.status(500).json({ error: 'Failed to save metadata' });
  }
});

// ============================================
// API ENDPOINTS - ARCHIVE MANAGEMENT
// ============================================

/**
 * POST /api/:app/archive
 * Trigger automatic archiving process
 * Moves memorized words (90+ days old) from active to archived
 * Returns count of words archived
 */
app.post('/api/:app/archive', async (req, res) => {
  const appName = req.params.app;

  try {
    const archivedCount = await runArchiveProcess(appName);
    res.json({ success: true, archived: archivedCount });
  } catch (err) {
    console.error(`Archive process failed for ${appName}:`, err);
    res.status(500).json({ error: 'Archive process failed' });
  }
});

/**
 * POST /api/:app/unarchive
 * Move word back to active learning (called when user fails archive review)
 */
app.post('/api/:app/unarchive', async (req, res) => {
  const appName = req.params.app;
  const { wordId } = req.body;

  try {
    await unarchiveWord(appName, wordId);
    res.json({ success: true });
  } catch (err) {
    console.error(`Unarchive failed for ${appName}:`, err);
    res.status(500).json({ error: 'Unarchive failed' });
  }
});

// ============================================
// API ENDPOINTS - DATA EXPORT
// ============================================

/**
 * GET /api/:app/export
 * Export all app data as downloadable JSON backup
 * Includes active, archived, and metadata in single file
 */
app.get('/api/:app/export', async (req, res) => {
  const appName = req.params.app;

  try {
    // Load all three data files
    const active = await fs.readFile(path.join(DATA_DIR, appName, 'active.json'), 'utf8');
    const archived = await fs.readFile(path.join(DATA_DIR, appName, 'archived.json'), 'utf8');
    const metadata = await fs.readFile(path.join(DATA_DIR, appName, 'metadata.json'), 'utf8');

    // Combine into single export object
    const exportData = {
      active: JSON.parse(active),
      archived: JSON.parse(archived),
      metadata: JSON.parse(metadata),
      exportDate: new Date().toISOString()
    };

    // Set headers to trigger download with timestamped filename
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${appName}-backup-${new Date().toISOString().split('T')[0]}.json"`);
    res.send(JSON.stringify(exportData, null, 2));
  } catch (err) {
    console.error(`Export failed for ${appName}:`, err);
    res.status(500).json({ error: 'Export failed' });
  }
});

// ============================================
// HELPER FUNCTIONS - ARCHIVE LOGIC
// ============================================

/**
 * Run automatic archive process for an app.
 * Finds memorized words older than threshold and moves them to archive.
 * Compresses word data by removing detailed attempt history.
 *
 * @param {string} appName - Name of app (nouns, verbs, expressions)
 * @returns {number} Count of words archived
 */
async function runArchiveProcess(appName) {
  const activePath = path.join(DATA_DIR, appName, 'active.json');
  const archivedPath = path.join(DATA_DIR, appName, 'archived.json');
  const metadataPath = path.join(DATA_DIR, appName, 'metadata.json');

  // Load current data
  const activeData = JSON.parse(await fs.readFile(activePath, 'utf8'));
  const archivedData = JSON.parse(await fs.readFile(archivedPath, 'utf8'));
  const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));

  const threshold = metadata.settings.archiveThresholdDays;
  const today = new Date();

  const toArchive = [];
  const remaining = [];

  // Separate words into "to archive" and "remaining active"
  activeData.words.forEach(word => {
    if (word.memorized && word.memorizedDate) {
      const memorizedDate = new Date(word.memorizedDate);
      const daysSince = Math.floor((today - memorizedDate) / (1000 * 60 * 60 * 24));

      // Archive if past threshold (default 90 days)
      if (daysSince >= threshold) {
        toArchive.push(compressWord(word));
      } else {
        remaining.push(word);
      }
    } else {
      remaining.push(word);
    }
  });

  // If words need archiving, update all three files
  if (toArchive.length > 0) {
    archivedData.words.push(...toArchive);
    activeData.words = remaining;

    await fs.writeFile(activePath, JSON.stringify(activeData, null, 2));
    await fs.writeFile(archivedPath, JSON.stringify(archivedData, null, 2));

    // Update statistics
    metadata.stats.activeWords = remaining.length;
    metadata.stats.archivedWords = archivedData.words.length;
    metadata.lastArchiveCheck = new Date().toISOString();

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(`📦 Archived ${toArchive.length} words for ${appName}`);
  }

  return toArchive.length;
}

/**
 * Compress word data for archiving.
 * Removes detailed attempts array and replaces with summary statistics.
 * Saves storage space while retaining key performance metrics.
 *
 * @param {Object} word - Word object with full attempt history
 * @returns {Object} Compressed word object with summary stats
 */
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
    // Replace attempts array with summary statistics
    totalAttempts: word.attempts.length,
    totalCorrect: word.attempts.filter(a => a.correct).length,
    accuracy: word.attempts.filter(a => a.correct).length / word.attempts.length,
    memorizedDate: word.memorizedDate,
    archivedDate: new Date().toISOString().split('T')[0],
    lastReviewDate: null,
    reviewFailures: 0
  };
}

/**
 * Unarchive a word back to active learning.
 * Called when user fails archive review multiple times.
 * Decompresses word data and resets learning progress.
 *
 * @param {string} appName - Name of app
 * @param {number} wordId - ID of word to unarchive
 */
async function unarchiveWord(appName, wordId) {
  const activePath = path.join(DATA_DIR, appName, 'active.json');
  const archivedPath = path.join(DATA_DIR, appName, 'archived.json');

  const activeData = JSON.parse(await fs.readFile(activePath, 'utf8'));
  const archivedData = JSON.parse(await fs.readFile(archivedPath, 'utf8'));

  const word = archivedData.words.find(w => w.id === wordId);

  if (!word) return;

  // Decompress: restore full structure with empty attempts array
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
      date: new Date().toISOString().split('T')[0],
      correct: false,
      ms: 0
    }],
    streak: 0,
    memorized: false,
    memorizedDate: null
  };

  // Move word from archived to active
  activeData.words.push(restored);
  archivedData.words = archivedData.words.filter(w => w.id !== wordId);

  await fs.writeFile(activePath, JSON.stringify(activeData, null, 2));
  await fs.writeFile(archivedPath, JSON.stringify(archivedData, null, 2));

  console.log(`⚠️ Unarchived: ${word.de} (failed review)`);
}

// ============================================
// SERVER STARTUP
// ============================================

/**
 * Initialize data directories and start Express server.
 * Server listens on port 3000 for local development.
 */
initDataDirs().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 German Learning App running at http://localhost:${PORT}\n`);
    console.log('📚 Apps available:');
    console.log('   - Nouns: /apps/nouns/nouns.html');
    console.log('   - Verbs: (coming soon)');
    console.log('   - Expressions: (coming soon)\n');
    console.log('Press Ctrl+C to stop\n');
  });
}).catch(err => {
  console.error('Failed to initialize:', err);
  process.exit(1);
});
