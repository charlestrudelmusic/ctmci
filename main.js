'use strict';
// ctmCI — fenêtre de l'app (Electron). Pas de licence.
// Les données sont gardées dans un fichier de l'app : ~/Library/Application Support/ctmCI/ctmci-donnees.json
const { app, BrowserWindow, Menu, ipcMain, nativeTheme, shell } = require('electron');
const path = require('path');
const fs = require('fs');

app.setName('ctmCI');
const FICHIER = () => path.join(app.getPath('userData'), 'ctmci-donnees.json');

// Lecture / écriture des données (appelées par la page, voir preload.js)
ipcMain.on('donnees-lire', e => {
  try { e.returnValue = fs.readFileSync(FICHIER(), 'utf8'); } catch (err) { e.returnValue = null; }
});
ipcMain.on('donnees-ecrire', (e, texte) => {
  try {
    fs.mkdirSync(path.dirname(FICHIER()), { recursive: true });
    const tmp = FICHIER() + '.tmp';
    fs.writeFileSync(tmp, texte, 'utf8');
    fs.renameSync(tmp, FICHIER()); // écrit d'un coup : jamais de fichier à moitié écrit
    e.returnValue = true;
  } catch (err) { e.returnValue = false; }
});

let win = null;
function creerFenetre() {
  win = new BrowserWindow({
    width: 1400, height: 920, minWidth: 900, minHeight: 600,
    title: 'ctmCI',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#0e1014' : '#f4f5f7',
    show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), nodeIntegration: false, contextIsolation: true },
  });
  win.loadFile(path.join(__dirname, 'ctmCI.html'));
  win.once('ready-to-show', () => win.show());
  // Liens externes : dans le navigateur, jamais dans l'app
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  // « Sauvegarder » : proposer le dossier Téléchargements
  win.webContents.session.on('will-download', (e, item) => {
    item.setSaveDialogOptions({ title: 'Sauvegarder mes données ctmCI', defaultPath: path.join(app.getPath('downloads'), item.getFilename()) });
  });
  win.on('closed', () => { win = null; });
}

// Une commande du menu → une fonction de la page
const page = code => { if (win) win.webContents.executeJavaScript(code).catch(() => {}); };

function menu() {
  const template = [
    { label: 'ctmCI', submenu: [
      { role: 'about', label: 'À propos de ctmCI' }, { type: 'separator' },
      { role: 'hide', label: 'Masquer ctmCI' }, { role: 'hideOthers', label: 'Masquer les autres' }, { role: 'unhide', label: 'Tout afficher' },
      { type: 'separator' }, { role: 'quit', label: 'Quitter ctmCI' } ] },
    { label: 'Fichier', submenu: [
      { label: 'Sauvegarder dans un fichier…', accelerator: 'CmdOrCtrl+S', click: () => page('sauver()') },
      { label: 'Récupérer une sauvegarde…', accelerator: 'CmdOrCtrl+O', click: () => page("document.getElementById('fichier').click()") },
      { type: 'separator' },
      { label: 'Aperçu de la feuille', accelerator: 'CmdOrCtrl+E', click: () => page("document.getElementById('apercu').classList.contains('on') ? apFermer() : apercu()") },
      { label: 'Imprimer / PDF…', accelerator: 'CmdOrCtrl+P', click: () => page("document.querySelector('[data-a=pdf]') ? document.querySelector('[data-a=pdf]').click() : (apercu(), setTimeout(() => document.querySelector('[data-a=pdf]')?.click(), 100))") },
      { type: 'separator' }, { role: 'close', label: 'Fermer la fenêtre' } ] },
    // Pas de « Annuler » ici : ⌘Z / ⇧⌘Z sont gérés par la page (annuler/rétablir les données)
    { label: 'Édition', submenu: [
      { role: 'cut', label: 'Couper' }, { role: 'copy', label: 'Copier' }, { role: 'paste', label: 'Coller' }, { role: 'selectAll', label: 'Tout sélectionner' } ] },
    { label: 'Présentation', submenu: [
      { role: 'resetZoom', label: 'Taille réelle' }, { role: 'zoomIn', label: 'Agrandir' }, { role: 'zoomOut', label: 'Réduire' },
      { type: 'separator' }, { role: 'togglefullscreen', label: 'Plein écran' } ] },
    { label: 'Fenêtre', submenu: [ { role: 'minimize', label: 'Placer dans le Dock' }, { role: 'zoom', label: 'Réduire/agrandir' } ] },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.setAboutPanelOptions({ applicationName: 'ctmCI', applicationVersion: app.getVersion(), copyright: '© Charles Trudel', credits: 'Calculateur de charge individuelle (annexe I-1, FNEEQ 2023-2028). Simulation — la feuille officielle du département fait foi.' });
app.whenReady().then(() => { menu(); creerFenetre(); });
app.on('activate', () => { if (!win) creerFenetre(); });
app.on('window-all-closed', () => app.quit());
