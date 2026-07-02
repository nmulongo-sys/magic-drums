# Magic Drums — Atelier Dunun & Djembé

Application web pour apprendre et travailler la percussion ouest-africaine en ensemble (djembés + duns) : partition interactive, son synthétisé, répertoire de rythmes, compositeur, échauffement, quiz d'oreille et guide interactif. Fichier unique, hors-ligne, pensé pour le mobile.

**En ligne** : https://nmulongo-sys.github.io/magic-drums/ — ou ouvrir `magicdrums_app_v11.html` dans un navigateur (aucune installation).
**Statut** : révision v11 (27 juin 2026) • fichier HTML unique, sans dépendance externe, **son 100 % synthétisé** (Web Audio API) — aucun échantillon audio requis, fonctionne hors ligne et sur mobile.

## Utilisation

Tout est dans un seul fichier, rien à installer. L'état est **sauvegardé automatiquement dans le navigateur**. Sept onglets :

- **Jouer** — la partition (grille) et les instruments : 3 djembés (Aigu / Médium / Grave) + 3 duns. Lecture, tempo, métronome, montée (accélération), mode gaucher, appels/breaks, et mixer (volume master + par instrument).
- **Rythmes** — répertoire de rythmes ; réglages (nom, BPM/cycle) ; import/export **JSON** d'un rythme.
- **Compositeur** — compositeur « à briques » : une bibliothèque de briques rythmiques à assembler en un cycle.
- **Chauffe** — générateur d'échauffement.
- **Créer par IA** — saisir un souhait ; l'appli produit un prompt à copier (génération assistée, hors de l'appli).
- **Quiz** — entraînement de l'oreille (djembé ; fûts & cloche).
- **Aide** — notation et impression.

Un **guide « Premiers pas »** (tour guidé de 22 étapes) s'ouvre automatiquement au premier lancement, puis reste accessible via le bouton « 👋 Premiers pas ».

## Architecture & conventions

**Forme générale.** Un seul fichier `magicdrums_app_v11.html` (HTML/CSS/JS, ~2070 lignes), sans bibliothèque externe. Le son est **entièrement synthétisé** via la Web Audio API (`AudioContext`, oscillateurs, bruit filtré, enveloppes de gain) — aucun fichier `.wav`/`.mp3` n'est chargé.

**Instruments & notation.** Trois djembés (Aigu / Médium / Grave) et trois duns (Kenkeni / Sangban / Dununba). Notation mnémotechnique via le bouton « traduction » : `Tu`/`Ta` = main droite, `Ku`/`Ka` = main gauche, plus la basse (dun). Frappes illustrées (mains « empreinte » + animation).

**Persistance (`localStorage`).**
- `atelier_dunun_djembe_v3` — état courant de l'appli (partition/rythme), sauvegarde automatique ; `atelier_dunun_djembe_v3_ts` — horodatage de la dernière sauvegarde.
- `md_wizard_seen_v2` — drapeau « guide vu » : le guide « Premiers pas » ne s'ouvre de lui-même qu'une fois.

**Onglets.** Sept vues (`data-tab` : `jouer`, `rythmes`, `compositeur`, `chauffe`, `ia`, `quiz`, `aide`), navigation par `tabTo(name)`.

**Répertoire.** Rythmes embarqués dans le fichier (tempo, parfois une source d'attribution). Import/export JSON pour sauvegarder ou partager un rythme.

**Guide « Premiers pas ».** Bloc autonome en fin de `<body>` (marqueurs `<!-- WIZARD -->`), CSS/JS préfixés `#wiz`/`.wiz`, **lecture seule** du moteur : il n'appelle que `tabTo()` et ne touche ni `state`, ni l'audio, ni le séquenceur.

> Documents de conception détaillés (ETAT, changelogs, méthode, briefs) : dossier `docs/`.

## Journal de développement

### 2026-07-02 — Mise en dépôt GitHub + README initial
- Première documentation README de l'app (état v11).
- Publication sur GitHub Pages ; ajout d'une redirection `index.html` → `magicdrums_app_v11.html`.
- Dépôt volontairement **léger** : l'app fonctionnant au son synthétisé, les échantillons audio de travail (`Echantillons/`, `Extraits_Decoupes/`), l'`archive/` des versions antérieures et les scripts Python de découpe **ne sont pas inclus**. Les documents de conception sont rassemblés dans `docs/`.

### 2026-06-27 — v11 : guide « Premiers pas » étendu à toutes les fonctions
- Tour guidé porté à **22 étapes** couvrant tout : barre du haut, Jouer, Rythmes, Compositeur, Chauffe, Créer par IA, Quiz, Aide.
- Badge de section + barre de progression « k / N ». Nouvelle clé `localStorage` `md_wizard_seen_v2` (ré-affichage unique).
- Appli hors-wizard identique à la v10 (octet pour octet) ; `node --check` OK sur les 3 blocs `<script>`. Détail : `docs/magicdrums_CHANGELOG_v11.md`.

### 2026-06-27 — v10 : assistant « Premiers pas »
- Introduction du tour guidé interactif « Premiers pas » (version initiale). Détail : `docs/magicdrums_CHANGELOG_v10.md`.

### Antérieur à v11 — socle de l'atelier
- Réconciliation des 3 djembés (Aigu/Médium/Grave), mains « empreinte » + animation, correctif baguettes, compositeur à briques, mixer (master + individuels), bouton de traduction mnémotechnique, illuminations. Versions v4→v10 conservées hors dépôt dans `archive/`.

## Contributions

Outil personnel. Les signalements de bug et suggestions (*issues*) sont bienvenus ; les propositions de code (*pull requests*) sont relues et intégrées au cas par cas.

## Licence

Aucun fichier `LICENSE` à ce jour → **tous droits réservés** par défaut. Pour un partage libre en gardant la paternité, une licence **MIT** est recommandée (*à confirmer*).
