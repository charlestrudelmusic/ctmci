'use strict';
// Tests du calcul de la CI (le bloc « // <calcul> » de ctmCI.html), avec des cas vérifiés à la main
// et sur les feuilles officielles A26 du département. Lancer : npm test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'ctmCI.html'), 'utf8');
const bloc = html.match(/\/\/ <calcul>([\s\S]*?)\/\/ <\/calcul>/);
assert.ok(bloc, 'bloc // <calcul> introuvable dans ctmCI.html');
const { CI } = new Function('//' + bloc[1] + '\nreturn { CI };')();

const pres = (a, b) => assert.ok(Math.abs(a - b) < 0.005, `${a} ≠ ${b}`);
const ENS = { type: 'collectif', prep: 'ENS', hp: 1, groupes: [{ n: 2, h: 1 }, { n: 2, h: 1 }], nom: 'ENS AJ' };
const P = q => ({ type: 'principal', qte: q, h: 1 });
const C = q => ({ type: 'complementaire', qte: q, h: 1 });
const G = (k, n, h = 2, hp = 2) => ({ type: 'collectif', prep: k, hp, groupes: [{ n, h }], nom: k });

test('ENS AJ : Hp 1, Hc 2, PES 4 → 3,46 (F 0,9) ; 3,66 avec F 1,1', () => {
  const r = CI.calcule([ENS]);
  pres(r.HP, 1); pres(r.HC, 2); pres(r.PES, 4); pres(r.F, 0.9); pres(r.ci, 3.46);
  pres(CI.calcule([ENS], { fMode: 'manuel', fManuel: 1.1 }).ci, 3.66);
});

test('Feuille officielle A26 du 23 sept. 2026 : 41,26 CI, 23 h', () => {
  const r = CI.calcule([C(15), P(6), ENS]);
  pres(r.ci, 41.26); pres(r.heures, 23);
});

test('Feuille préliminaire du 8 mai (F 1,1 affiché) : 41,46', () => {
  pres(CI.calcule([C(15), P(6), ENS], { fMode: 'manuel', fManuel: 1.1 }).ci, 41.46);
});

test('Instruments : 1,8 par heure ; labo : 2,0 par heure', () => {
  pres(CI.calcule([P(4)]).ci, 7.2);
  pres(CI.calcule([C(14)]).ci, 25.2);
  pres(CI.calcule([{ type: 'labo', qte: 3, h: 1 }]).ci, 6);
});

test('Facteur HP : 1-2 cours de groupe 0,9 ; 3 → 1,1 ; 4+ → 1,75 (instruments exclus)', () => {
  pres(CI.calcule([P(4), C(10), ENS]).F, 0.9);
  pres(CI.calcule([ENS, G('A', 10), G('B', 10)]).F, 1.1);
  pres(CI.calcule([ENS, G('A', 10), G('B', 10), G('C', 10)]).F, 1.75);
});

test('Feuilles A26 (autres profs) : lignes de groupe recalculées au centième', () => {
  // Formation auditive III : F 1,1, Hp 3, Hc 6, PES 33 → 11,82 ; Studio JP 1 : F 1,75, Hp 3, Hc 6, PES 21 → 13,29
  const fa3 = { type: 'collectif', prep: '3F3', hp: 3, groupes: [{ n: 6, h: 3 }, { n: 5, h: 3 }], nom: '3F3' };
  const r3 = CI.calcule([fa3, G('X', 0, 1, 0), G('Y', 0, 1, 0)]); // 3 cours de groupe → F 1,1
  pres(r3.F, 1.1); pres(r3.F * 3 + 1.2 * 6 + 0.04 * 33, 11.82);
  const sj1 = { type: 'collectif', prep: 'SJ1', hp: 3, groupes: [{ n: 4, h: 3 }, { n: 3, h: 3 }], nom: 'SJ1' };
  const r4 = CI.calcule([sj1, G('X', 0, 1, 0), G('Y', 0, 1, 0), G('Z', 0, 1, 0)]); // 4 cours → F 1,75
  pres(r4.F, 1.75); pres(r4.F * 3 + 1.2 * 6 + 0.04 * 21, 13.29);
});

test('Scénario B : 4 P + ENS AJ + 14 compl. → 35,86 CI, 20 h ; il faudrait 17 compl. pour 40', () => {
  const r = CI.calcule([P(4), ENS, C(14)]);
  pres(r.ci, 35.86); pres(r.heures, 20);
  assert.strictEqual(CI.complementairesRequis(r, 40), 17);
});

test('Scénario A : 3LP + Techno à 12 étudiants, 10 compl. → 39,98 CI, 20 h (F 1,1)', () => {
  const r = CI.calcule([P(4), ENS, G('3LP', 12), G('T6', 12), C(10)]);
  pres(r.ci, 39.98); pres(r.heures, 20); pres(r.F, 1.1);
});

test('Proposition hiver 2027 de Charles : 5 P + 12 compl. + ENS AJ + 3LP (7 étud.) → 38,82 CI, 21 h', () => {
  const r = CI.calcule([P(5), C(12), ENS, G('3LP', 7)]);
  pres(r.ci, 38.82); pres(r.heures, 21); pres(r.F, 0.9);
  pres(r.ci + 41.26, 80.08); // année : 100 %
});

test('Autres éléments (coordination, libération) : CI fixe, sans heures ; 20 % = 8 CI', () => {
  const base = CI.calcule([C(10)]);
  const avec = CI.calcule([C(10), { type: 'autre', nom: 'COORDI', ci: 13 }, { type: 'autre', nom: 'PVRTT', ci: 0.2 * 40 }]);
  pres(avec.ci - base.ci, 21); pres(avec.heures, base.heures);
});

test('PES : 0,04 jusqu\'à 415, puis 0,07', () => {
  const r = CI.calcule([{ type: 'collectif', prep: 'X', hp: 0, groupes: [{ n: 500, h: 1 }], nom: 'X' }]);
  pres(r.ciPES, 0.04 * 415 + 0.07 * 85);
});
