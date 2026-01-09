## **Documentation for Future Self**

### **Adding New Words**

1. Open `data/nouns/active.json`  
2. Copy existing word structure  
3. Increment `id` (use next available number)  
4. Fill in all fields:  
   * German word \+ article \+ plural  
   * English translations (array)  
   * Portuguese translations (array)  
   * Example sentence in German  
   * Example translation in Portuguese  
   * Goethe level (A1/A2/B1/B2)  
   * Set difficulty: 2 (default)  
   * Leave attempts empty, streak 0, memorized false  
5. Save file  
6. Refresh browser

### **Adjusting Settings**

Edit `data/nouns/metadata.json`:

* `archiveThresholdDays`: Days before archiving (default: 90)
* `sessionLength`: Cards per session (default: 15)
* `unarchiveFailureThreshold`: Failures before unarchive (default: 2)

**Important:** After changing these settings, you must stop and restart the `node server.js` process for the changes to take effect.

### **Resetting Progress**

**Reset everything:**

bash
rm -rf data/nouns/active.json data/nouns/archived.json data/nouns/metadata.json

*# Restart server - files will be recreated empty*

**Reset just progress (keep words):**

1. Open active.json
2. For each word, set: `attempts: []`, `streak: 0`, `memorized: false`
3. Save file

### **Backup Before Major Changes**

bash
*# Create backup*
cp -r data/ data-backup-$(date +%Y%m%d)/

*# Restore if needed*
rm -rf data/

cp -r data-backup-20260106/ data/

---

## **Final Notes**

### **Philosophy**

This app is built for **simplicity and maintainability** over features and scale.

**Priorities:**

1. **Works reliably** - No crashes, no data loss
2. **Easy to use** - Minimal friction, fast sessions
3. **Easy to maintain** - You can fix bugs in 5 minutes
4. **Easy to extend** - Adding features is straightforward

**Non-priorities:**

* Enterprise-scale architecture
* Perfect code coverage
* Pixel-perfect design
* Every possible feature

### **Remember**

* **Done is better than perfect**
* **Use it daily to find real issues**
* **Don't add features you won't use**
* **Refactor when you actually feel pain**
* **The goal is learning German, not building software**

---

## **Appendix: Package.json**

json
{
  "name": "german-learning-app",
  "version": "4.0.0",
  "description": "Personal German vocabulary learning application",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "keywords": ["german", "learning", "vocabulary", "education"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2"
  }

}

---

## **Appendix: README.md (For Project Root)**

markdown
# German Learning App

Personal vocabulary learning application for German nouns, verbs, and expressions.

## Quick Start
```bash
*# Install dependencies*
npm install

*# Start server*
npm start

*# Open browser*
*# http://localhost:3000*
```

## Features

- **\*\*Multi-app system:\*\*** Nouns, Verbs (future), Expressions (future)
- **\*\*Three practice modes:\*\*** Normal practice, Recently memorized review, Archive review
- **\*\*Automatic archiving:\*\*** Words mastered 90+ days archived automatically
- **\*\*Progress tracking:\*\*** Full statistics and performance metrics, including a visual breakdown of active words by streak level.
- **\*\*Data persistence:\*\*** Automatic saving, manual export/import

## Project Structure
```
public/           Frontend files
  apps/           Individual learning apps
  core/           Shared logic
data/             JSON data storage
server.js         Express API server
```

## Development

Edit files → Save → Refresh browser. No build process.

## Backup

Data stored in `data/` directory. Use Git or manual exports for backups.

## License

MIT - Personal use only

---

**END OF SPECIFICATION v4.0**

**Total Document Length:** \~25,000 words **Total Code Examples:** \~1,400 lines **Estimated Build Time:** 16-19 hours **Ready for Implementation:** Yes

---

**Next Steps:**

1. Review this specification  
2. Set up project structure  
3. Start with server.js and core files  
4. Build nouns app iteratively  
5. Test thoroughly  
6. Add 50 A1 words  
7. Use daily and iterate

Good luck\! 🚀

