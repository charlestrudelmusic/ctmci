'use strict';
// Après « npm run dist » : donne aux DMG des noms clairs pour ne pas mélanger les deux Mac.
//   ctmCI-<version>-arm64.dmg -> ctmCI-<version>-Apple-Silicon.dmg
//   ctmCI-<version>-x64.dmg   -> ctmCI-<version>-Intel.dmg
// Puis crée un ZIP par DMG (seulement le DMG dedans), pratique pour l'envoyer.
// Le nom du fichier et le ZIP ne changent rien à la signature ni à la notarisation (elles sont dans l'app).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const { version } = require('../package.json');
const out = path.join(__dirname, '..', 'dist-app');
const NAMES = { arm64: 'Apple-Silicon', x64: 'Intel' };

for (const [arch, label] of Object.entries(NAMES)) {
  for (const ext of ['.dmg', '.dmg.blockmap']) {
    const from = path.join(out, `ctmCI-${version}-${arch}${ext}`);
    const to = path.join(out, `ctmCI-${version}-${label}${ext}`);
    if (!fs.existsSync(from)) continue;
    fs.renameSync(from, to);
    if (ext === '.dmg') console.log('  • ' + path.basename(to));
  }
  const dmg = path.join(out, `ctmCI-${version}-${label}.dmg`);
  if (fs.existsSync(dmg)) {
    const zip = dmg.replace(/\.dmg$/, '.zip');
    fs.rmSync(zip, { force: true });
    execFileSync('zip', ['-q', '-j', '-X', zip, dmg]); // -j : sans dossier ; -X : sans fichiers cachés __MACOSX
    console.log('  • ' + path.basename(zip));
  }
}
