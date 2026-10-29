'use strict';
// Pont entre la page et l'app : lire / écrire le fichier de données de ctmCI.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('ctmciApp', {
  lire: () => ipcRenderer.sendSync('donnees-lire'),
  ecrire: texte => ipcRenderer.sendSync('donnees-ecrire', texte),
});
