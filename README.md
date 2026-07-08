# Magic Drums — Atelier Dunun & Djembé

Application web pour apprendre et travailler la percussion ouest-africaine en ensemble (djembés + duns) : partition interactive, son synthétisé, répertoire de rythmes, compositeur, échauffement, quiz d'oreille et guide interactif. Fichier unique, hors-ligne, pensé pour le mobile.

**En ligne** : https://nmulongo-sys.github.io/magic-drums/ — ou ouvrir `magicdrums_app_v12.html` dans un navigateur (aucune installation).
**Statut** : révision v12 (2 juillet 2026) • fichier HTML unique, sans dépendance externe, son 100 % synthétisé (Web Audio API) — aucun échantillon audio requis, fonctionne hors ligne et sur mobile.

## Utilisation

Tout est dans un seul fichier, rien à installer. L'état est sauvegardé automatiquement dans le navigateur. Cinq entrées de navigation (barre d'onglets en bas d'écran sur mobile) :

- **Jouer** — la partition (grille) et les instruments : 3 djembés (Aigu / Médium / Grave) + 3 duns. Transport hiérarchisé : lecture et tempo toujours visibles, réglages secondaires (métronome, montée, gaucher, mode ensemble, cloches, mixer) derrière « Options ».
- **Rythmes** — répertoire de rythmes ; réglages (nom, BPM/cycle) ; import/export JSON d'un rythme.
- **Créer** — trois ateliers en sous-onglets : Compositeur (bibliothèque de briques rythmiques à assembler), Chauffe (générateur d'échauffement), Par IA (saisir un souhait → génération directe du rythme via un proxy IA, ou repli « copier le prompt »).
- **Quiz** — entraînement de l'oreille (djembé ; fûts & cloche).
- **Aide** — notation et impression.

Deux systèmes d'aide intégrés :

- Un guide « Premiers pas » (tour guidé de 23 étapes) s'ouvre automatiquement au premier lancement, puis reste accessible via le bouton « 👋 Premiers pas ».
- Un mode aide « ? » (barre du haut) : une fois activé, toucher n'importe quel élément affiche une bulle expliquant sa fonction, sans rien déclencher. Au survol souris, les mêmes fiches apparaissent en infobulle.

## Architecture & conventions

**Forme générale.** Un seul fichier `magicdrums_app_v12.html` (HTML/CSS/JS), sans bibliothèque externe. Le son est entièrement synthétisé via la Web Audio API (`AudioContext`, oscillateurs, bruit filtré, enveloppes de gain) — aucun fichier `.wav`/`.mp3` n'est chargé.

**Instruments & notation.** Trois djembés (Aigu / Médium / Grave) et trois duns (Kenkeni / Sangban / Dununba). Notation mnémotechnique via le bouton « traduction » : `Tu/Ta` = main droite, `Ku/Ka` = main gauche, plus la basse (dun). Rendu v12 : fûts en vue de dessus réaliste (peau en dégradé, cordage laiton, ondes de frappe), baguettes bois à tête cerclée G/D, mains « empreinte » translucides animées.

**Persistance (`localStorage`).**

- `atelier_dunun_djembe_v3` — état courant de l'appli (partition/rythme), sauvegarde automatique ; `atelier_dunun_djembe_v3_ts` — horodatage de la dernière sauvegarde.
- `md_wizard_seen_v2` — drapeau « guide vu » : le guide « Premiers pas » ne s'ouvre de lui-même qu'une fois.
- `md_ia_proxy_v1` — URL du proxy IA (onglet Par IA → Réglages IA), propre à ce navigateur, jamais commitée.

**Onglets.** Sept vues (`data-tab` : `jouer`, `rythmes`, `compositeur`, `chauffe`, `ia`, `quiz`, `aide`), navigation par `tabTo(name)` — inchangé en v12 ; les vues `compositeur`/`chauffe`/`ia` sont regroupées sous l'entrée « Créer » (sous-onglets), mappage dans `TAB_GROUP`.

**Répertoire.** Rythmes embarqués dans le fichier (tempo, parfois une source d'attribution). Import/export JSON pour sauvegarder ou partager un rythme.

**Guide « Premiers pas ».** Bloc autonome en fin de `<body>` (marqueurs `<!-- WIZARD -->`), CSS/JS préfixés `#wiz`/`.wiz`, lecture seule du moteur : il n'appelle que `tabTo()` et ne touche ni `state`, ni l'audio, ni le séquenceur.

**Bulles d'aide (v12).** Registre unique `window.MD_HELP` (~80 fiches `[sélecteur, titre, texte]`) défini dans le bloc « MODE AIDE » en fin de fichier, consommé par (1) le mode aide tactile « ? » (interception en phase capture, aucun appel au moteur) et (2) l'infobulle de survol `#global-tooltip-panel` héritée de la v11.

**Intégration IA (proxy).** L'onglet « Par IA » peut générer un rythme directement via une IA. Comme l'app est une page statique publique, aucune clé n'est embarquée : elle vit dans un petit **Cloudflare Worker** (`proxy/`) qui cache **une** clé Google Gemini partagée. L'app POSTe `{prompt, json:true}` vers l'URL du Worker (renseignée dans Réglages IA, `localStorage`), reçoit `{text}`, en extrait le JSON et le passe à `importParsed()`. Déploiement et garde-fous : `proxy/README.md`.

**Documents de conception détaillés** (ETAT, changelogs, méthode, briefs) : dossier `docs/`.

## Journal de développement

### 2026-07-08 — Génération de rythmes par IA en direct (onglet Par IA)
- L'onglet « Par IA » ne se limite plus à copier un prompt : nouveau bouton **✨ Générer le rythme** qui appelle une IA et **importe le rythme directement** dans le répertoire (bascule ensuite sur Jouer). Le bouton « Copier le prompt » reste comme repli sans proxy.
- **Modèle clé-partagée-derrière-proxy** (choix : peu d'utilisateurs, données non confidentielles). Les apps étant des pages statiques publiques (GitHub Pages), une clé écrite en dur serait scrapée. La clé Google Gemini vit donc dans un petit **Cloudflare Worker** (`proxy/gemini-proxy.js` + `wrangler.toml` + `proxy/README.md`) que l'app appelle ; la clé n'est jamais dans le HTML.
- Côté app : bloc « Réglages IA » (URL du proxy, stockée en `localStorage` `md_ia_proxy_v1`), extraction robuste du JSON (retire les clôtures ```json), réutilisation d'`importParsed()`/`normalize()` existants, gestion d'erreurs (proxy manquant, réseau, quota, JSON invalide). Bulles d'aide + étape wizard mises à jour.
- Vérifs : `node --check` OK sur les 5 blocs script ; test navigateur headless (proxy simulé) — avertissement sans proxy, persistance de l'URL, appel proxy, import 8→9, bascule d'onglet ; tests unitaires du Worker (CORS/preflight, 405/400/413/500/502, erreur Gemini relayée, restriction d'origine).

### 2026-07-05 — Note projet : prise de contact avec Djembe Loops
- Rédaction d'un courriel (EN) à l'équipe de Djembe Loops (djembeloops.com) proposant une collaboration open source : réutilisation libre du code/interface de Magic Drums en échange d'un accès à leur système d'échantillons sonores et à leur bibliothèque de rythmes/phrases.
- Piste technique identifiée : les deux apps gèrent déjà l'import/export de rythmes en JSON → un format d'échange commun serait peu coûteux à mettre en place. Le son de Magic Drums étant 100 % synthétisé (Web Audio, sans échantillon), leurs voix enregistrées (djembé/duns/cloche) et leur moteur de « swing » paramétré sont les deux éléments visés.
- Aucune modification du code de l'app (moteur, séquenceur, persistance inchangés). Entrée de suivi projet uniquement.

### 2026-07-02 — v12 : refonte esthétique & ergonomique + mode aide généralisé
- Visuels : canvas duns réécrit (fûts réalistes — peau en dégradé, cordage laiton, ombres, ondes de frappe ; baguettes bois courbées à tête cerclée G/D) ; SVG djembés redessiné (fût, cordage, zones en anneaux, mains translucides ombrées).
- Ergonomie : navigation 7 → 5 entrées (« Créer » = Compositeur + Chauffe + Par IA en sous-onglets) ; barre d'onglets en bas d'écran sur mobile ; transport scindé principal/« Options » (état mémorisé) ; cases à cocher → interrupteurs ; sliders, selects et focus unifiés ; légende repliable.
- Aide : registre unique de ~80 bulles d'explication couvrant chaque fonction ; nouveau mode aide « ? » (toucher un élément = bulle, sans déclencher l'action) ; l'infobulle de survol v11 est branchée sur le même registre ; wizard porté à 23 étapes.
- Moteur inchangé (octet pour octet côté séquenceur/audio/persistance) ; `node --check` OK sur les 4 blocs script ; tests Chromium headless desktop + mobile sans erreur. Détail : `docs/magicdrums_CHANGELOG_v12.md`.

### 2026-07-02 — Mise en dépôt GitHub + README initial
- Première documentation README de l'app (état v11).
- Publication sur GitHub Pages ; ajout d'une redirection `index.html` → `magicdrums_app_v11.html`.
- Dépôt volontairement léger : l'app fonctionnant au son synthétisé, les échantillons audio de travail (`Echantillons/`, `Extraits_Decoupes/`), l'`archive/` des versions antérieures et les scripts Python de découpe ne sont pas inclus. Les documents de conception sont rassemblés dans `docs/`.

### 2026-06-27 — v11 : guide « Premiers pas » étendu à toutes les fonctions
- Tour guidé porté à 22 étapes couvrant tout : barre du haut, Jouer, Rythmes, Compositeur, Chauffe, Créer par IA, Quiz, Aide.
- Badge de section + barre de progression « k / N ». Nouvelle clé `localStorage` `md_wizard_seen_v2` (ré-affichage unique).
- Appli hors-wizard identique à la v10 (octet pour octet) ; `node --check` OK sur les 3 blocs `<script>`. Détail : `docs/magicdrums_CHANGELOG_v11.md`.

### 2026-06-27 — v10 : assistant « Premiers pas »
- Introduction du tour guidé interactif « Premiers pas » (version initiale). Détail : `docs/magicdrums_CHANGELOG_v10.md`.

### Antérieur à v11 — socle de l'atelier
- Réconciliation des 3 djembés (Aigu/Médium/Grave), mains « empreinte » + animation, correctif baguettes, compositeur à briques, mixer (master + individuels), bouton de traduction mnémotechnique, illuminations. Versions v4→v10 conservées hors dépôt dans `archive/`.

## Contributions

Outil personnel. Les signalements de bug et suggestions (*issues*) sont bienvenus ; les propositions de code (*pull requests*) sont relues et intégrées au cas par cas.

## Licence

Aucun fichier LICENSE à ce jour → tous droits réservés par défaut. Pour un partage libre en gardant la paternité, une licence MIT est recommandée (à confirmer).
