# ctmCI

Calculateur de **charge individuelle (CI)** pour comprendre sa tâche d'enseignement au cégep, selon l'annexe I-1 de la convention collective FNEEQ 2023-2028.

On entre l'offre de cours de la session, on essaie des scénarios, et ctmCI affiche la CI, le % de tâche (40 CI = 100 % d'une session, 80 CI = 100 % de l'année) et les heures par semaine. Le scénario choisi donne une feuille au format du département (aperçu et PDF).

## Le calcul

- Instrument (principal ou complémentaire) : **1,8 CI par heure**
- Laboratoire : **2,0 CI par heure**
- Cours de groupe : **F × HP + 1,2 × HC + 0,04 × PES** (0,07 au-delà de 415 PES)
  - F = 0,9 (1 ou 2 préparations), 1,1 (3), 1,75 (4 et plus) ; instruments et labo exclus du compte
- Libérations : **CIL = L × 40** (ex. 20 % = 8 CI)

Les calculs sont vérifiés sur des feuilles officielles du département (`npm test`).

## Utiliser

- **En ligne** : https://charlestrudelmusic.github.io/ctmci/
- **Dans un navigateur** : ouvrir `ctmCI.html` (Safari, Chrome…). Les données restent dans le navigateur ; « Sauvegarder » crée un fichier.
- **App Mac** : `npm install`, puis `npm start`. Les données sont dans `~/Library/Application Support/ctmCI/`.

Aucune donnée n'est envoyée en ligne.

## Développement

```
npm test        # tests du calcul
npm run pack    # app Mac (sans notarisation)
npm run dist    # DMG signés et notarisés (Apple Silicon + Intel)
```

Outil personnel, non officiel : la feuille de tâche officielle du cégep fait foi.

© 2026 Charles Trudel
