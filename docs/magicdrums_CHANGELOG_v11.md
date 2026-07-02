# Magic Drums — Changelog v11

**Date :** 27 juin 2026 · **Base :** `magicdrums_app_v10.html` → **`magicdrums_app_v11.html`**

## Objectif UNIQUE de la conversation
Étendre le guide « Premiers pas » à **toutes les fonctions** de l'appli (suite directe de la v10). Aucun autre chantier ici.

## Ce qui a changé, et où
Le **bloc wizard** (entre ses marqueurs `<!-- … WIZARD … -->`, juste avant `</body>`) a été **remplacé**. Le reste de l'appli est **identique à la v10, octet pour octet** (vérifié).

Évolutions du guide :

- **22 étapes** couvrant tout : barre du haut, Jouer, Rythmes, Compositeur, Chauffe, Créer par IA, Quiz, Aide.
- **Badge de section** (Jouer, Rythmes, Compositeur…) + **barre de progression** avec compteur « k / N » (plus lisible qu'une rangée de points sur un tour long).
- Nouvelle clé `localStorage` **`md_wizard_seen_v2`** : le guide enrichi se ré-affiche **une fois** au prochain lancement, puis plus.

## Couverture des fonctions (étape → élément surligné)
- **Barre du haut** : `#btnNew` (+ Rythme / Dupliquer / Supprimer), `#btnExport` (Exporter / Importer / auto-save / Lecture / Imprimer).
- **Jouer** : `#svgDjembe` (instruments), `#grid` (partition), `#btnPlay`, `#tempo`, `#gaucher` (+ Métronome / Montée), `#btnAppel` (breaks & appel), `#showMixer` (volumes).
- **Rythmes** : `#rlist` (répertoire), `#editName` (réglages), `#jsonBox` (import/export JSON).
- **Compositeur** : `#cmpPool` (bibliothèque), `#cmpNbName` (créer une brique), `#cmpGrid` (montage du cycle).
- **Chauffe** : `#chGen` (générateur d'échauffement).
- **Créer par IA** : `#iaWish` (souhait → prompt à copier).
- **Quiz** : `#qPlay` (oreille : djembé / fûts & cloche).
- **Aide** : `#tab-aide` (notation + impression).

## Points d'accroche (toujours non invasif)
- **Lecture seule du moteur** : appelle uniquement `tabTo(name)`. **N'écrit pas** dans `state`, ne touche **ni l'audio ni le séquenceur**.
- CSS entièrement préfixé `#wiz` / `.wiz` ; z-index voile 9000 / élément 9001 / carte 9002 / lanceur 8000.
- Clé de persistance : `md_wizard_seen_v2`.

## Tests effectués
- `node --check` sur les **3 blocs `<script>`** → **tous OK**.
- **Appli hors-wizard identique à la v10** (diff vide).
- Les **19 sélecteurs `#id` + `nav.tabs`** sont **tous présents** dans le document → chaque étape pointe un élément réel.
- Balises du bloc équilibrées (10 `<div>` / 10 `</div>`, 1 `<style>`, 1 `<script>`), 22 étapes.

### Test manuel rapide
1. Ouvrir `magicdrums_app_v11.html` → le guide s'ouvre seul.
2. Parcourir les 22 étapes (Suivant / ←→) : à chaque étape, l'**onglet doit changer** et le **bon élément être surligné** ; la barre de progression avance.
3. Recharger → ne se rouvre plus tout seul. Cliquer **« 👋 Premiers pas »** → réouverture depuis l'étape 1.
4. Imprimer → guide et bouton **absents**.

## Reste / prochain module (décidé, hors v11)
- **Clic droit « doubler » à droite/gauche** au djembé (override de l'alternance main‑forte/main‑faible pour micro‑groove). C'est une **feature moteur** : à traiter dans une **conversation neuve**, module autonome + test d'abord, puis intégration. Brief fourni séparément.
