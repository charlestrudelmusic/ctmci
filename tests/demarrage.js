'use strict';
// Vérifie que l'app démarre (lancer : npx electron tests/demarrage.js). Données dans un dossier temporaire.
const { app, BrowserWindow } = require('electron');
const os = require('os'), path = require('path'), fs = require('fs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ctmci-test-'));
app.setPath('userData', tmp);
require('../main.js');
app.whenReady().then(async () => {
  await new Promise(r => setTimeout(r, 2500));
  const w = BrowserWindow.getAllWindows()[0];
  const res = await w.webContents.executeJavaScript(`({ titre: document.title, app: !!window.ctmciApp, onglet: S.tab, sessions: S.sessions.map(s => s.nom + ' · ' + s.role + ' · ' + Object.keys(s.offre).length + ' cours offerts'), programme: S.cours.length, erreurs: document.querySelectorAll('.erreur').length })`);
  await w.webContents.executeJavaScript(`S.accent = '#123456'; render();`);
  const fichier = path.join(tmp, 'ctmci-donnees.json');
  res.fichierEcrit = fs.existsSync(fichier) && JSON.parse(fs.readFileSync(fichier, 'utf8')).accent === '#123456';
  console.log('RESULTAT', JSON.stringify(res));
  app.exit(0);
});
