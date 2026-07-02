# Module « Compositeur à briques » — Brief de démarrage

*Instructions précises pour ouvrir le module. À utiliser comme message d'ouverture de la conversation dédiée.*

## Cadre

- **Base canonique : `magicdrums_app_v5.html`** (seul fichier de référence — le joindre à la conversation).
- **Objectif unique de la conversation :** construire le compositeur à briques sur un **onglet séparé**, avec **lecture audio**, et l'intégrer dans v5 → livrer **`magicdrums_app_v6.html`**.
- Un seul objectif : ne pas mélanger avec le bug baguettes ou la refonte des mains.

## Contexte technique déjà établi (ne pas ré-investiguer)

- Le fichier a **2 `<script>` classiques**. Le script 1 n'a **pas d'IIFE** : ses variables internes (`ctx`, `curStep`, `timer`, `Cv`, `playPat`, `nextT`) sont des **liaisons top-level accessibles par nom nu** depuis tout autre script classique. → Le compositeur doit être injecté **comme script classique** (jamais un module ES) et référencer ces variables par identifiant nu.
- **Crochet audio :** dans `schedule()`, à la frontière de cycle, le code teste `mq.active` et permute `playPat`. Le compositeur se branche **au même endroit** : un drapeau « mode composition » qui, à chaque fin de cycle, **compile le cycle suivant de `r.composition`** (fusion des briques actives par voie, avec le bon décalage de boucle) et l'injecte comme jeu de lignes courant. → éditer `schedule()` directement.
- **Stockage :** ne **pas** réutiliser `r.arrangement` (déjà pris par le Montage). Créer un **nouveau champ `r.composition`**. Le persister via `normalize()`/`fixLines()` et la sauvegarde (`stateSnap`/`load`).
- **v5 a 3 voix djembé** : `djembe` (aigu), `djembe3` (médium), `djembe2` (grave), + les 6 lignes duns. Le compositeur gère donc **4 voies** : Duns, Djembé Aigu, Djembé Médium, Djembé Grave *(et non 2 djembés comme dans la spec d'origine)*.
- Les espaces insécables du code ont déjà été **normalisés** (v5) → éditions fiables.

## Modèle de données (verrouillé)

- Une **brique** = les frappes d'**une seule voie** (Duns, ou Djembé Aigu / Médium / Grave) + une **catégorie** + un **nom** + une **longueur en cycles**.
- **Catégories :** accompagnement duns, accompagnement djembé, technique soliste, break.
- L'**unité de grille = le cycle de dun**. Dans une voie, **une seule brique sonne à la fois**. Entre voies, **tout se superpose** (duns + djembés jouent ensemble).
- **« Étirer »** une brique = la **boucler** pour remplir N cycles (pas d'étirement temporel qui changerait la densité des frappes).
- Le calage se fait **au cycle**, pas au temps.

## Décisions de design (verrouillées — « go reco »)

1. **Source des briques :** dérivation automatique depuis les rythmes existants (chaque rythme → une brique « accomp duns », une « accomp djembé » par voie, une « soliste », + une par break) **ET** un éditeur pour créer/nommer de nouvelles briques.
2. **Métrique figée par composition :** toutes les briques partagent le mètre (binaire/ternaire) et le nombre de temps. Le **premier cycle de dun posé fixe la métrique** ; ensuite, seules les briques compatibles sont déposables.
3. **« Étirer » = bouclage** sur K cycles. (Bouton « doubler/réduire » la longueur du motif possible en option.)
4. **Breaks :** un break duns fait taire le groove duns pendant sa durée ; les voies djembé continuent (sauf si elles ont aussi un break). **Remplacement intra-voie, pas de superposition.**
5. **Lecture audio livrée en même temps que le visuel** (pas de séquenceur muet).
6. **Onglet Montage : le remplacer** par le nouvel onglet (un seul endroit pour composer). Le retirer **sans détruire ses données**.

## Interface (onglet séparé)

- **Grille :** colonnes = cycles (Cycle 1, 2, 3… + bouton « + dun » pour rallonger) ; lignes = les 4 voies (Duns, Djembé Aigu, Djembé Médium, Djembé Grave).
- **Pose en tap-to-place** (sélectionner une brique puis taper la case) — **pas** de glisser-déposer (fiabilité tablette).
- **Palette / bibliothèque de briques** avec : **filtre par catégorie** (accomp duns / accomp djembé / soliste / break), **recherche par nom**, **regroupement par rythme d'origine**, et un **badge de métrique qui grise les briques incompatibles** avec la composition en cours. *(C'est la réponse à ta remarque : naviguer quand les briques seront nombreuses.)*
- **Codes couleur par catégorie.**

## Découpage anti-plantage (impératif)

Cette fonctionnalité a déjà fait planter une conversation en tentant tout en un seul patch géant. **Procéder en 2 phases :**

- **Phase 1 — Module autonome :** construire le compositeur (modèle `r.composition` + UI palette/grille + fonction de compilation cycle → lignes) dans un **fichier HTML autonome avec un mini-harnais de test** (faux moteur). Valider la logique de compilation et l'UI **isolément**.
- **Phase 2 — Intégration :** injecter le module validé dans v5 comme **script classique**, brancher la compilation dans `schedule()` (à côté de `mq`), créer `r.composition`, remplacer l'onglet Montage. **Patchs ciblés, pas de réécriture globale.**

## Contrat de livraison

- `magicdrums_app_v6.html` (app complète) **+** le module autonome de phase 1.
- **Changelog** : quoi, où (fonctions / champs : `r.composition`, `schedule()`, onglets).
- **Points d'accroche** touchés (noms de fonctions/variables).
- **Checklist de test** (ci-dessous).

## Checklist de test

- [ ] Onglet « Compositeur » présent ; ancien onglet Montage retiré (données préservées).
- [ ] La bibliothèque liste les briques dérivées des rythmes **et** permet d'en créer/nommer.
- [ ] Filtre par catégorie, recherche, et grisage des briques incompatibles fonctionnent.
- [ ] Tap-to-place pose une brique sur une case ; « étirer » la boucle sur N cycles.
- [ ] À la lecture, l'arrangement se **compile cycle par cycle** et sonne (duns + 3 djembés) ; breaks corrects (intra-voie).
- [ ] Sauvegarde / rechargement conservent `r.composition`.
- [ ] Aucune régression sur l'existant (3 djembés, Rebond, rythmes, sauvegarde).

---

### Prompt d'ouverture (version condensée à coller)

> Base canonique : `magicdrums_app_v5.html` (joint), seul fichier de référence. Objectif UNIQUE : construire le **compositeur à briques** sur un onglet séparé + lecture audio, puis l'intégrer → `magicdrums_app_v6.html`. Procède en 2 phases : (1) module autonome testé, (2) intégration par patchs ciblés (pas de réécriture globale). Technique : script **classique** (les internes du scheduler `ctx/curStep/timer/Cv/playPat/nextT` sont accessibles par nom nu) ; brancher la compilation dans `schedule()` à côté de `mq.active` ; stocker dans un **nouveau** champ `r.composition` (pas `r.arrangement`) ; remplacer l'onglet Montage. Modèle : une brique = frappes d'une seule voie + catégorie + nom + longueur en cycles ; unité = le cycle ; une brique par voie à la fois ; voies superposées ; « étirer » = bouclage. 4 voies (Duns, Djembé Aigu/Médium/Grave — v5 a bien 3 djembés : `djembe`,`djembe3`,`djembe2`). UI : grille cycles × voies, tap-to-place, palette avec filtre catégorie + recherche + grisage des briques incompatibles. Termine par : fichier v6 + module autonome + changelog + checklist de test.
