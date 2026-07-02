# Magic Drums — Changelog v10

**Date :** 27 juin 2026 · **Base :** `magicdrums_app_v9.html` → **`magicdrums_app_v10.html`**

## Objectif UNIQUE de la conversation
Ajouter un **assistant « Premiers pas » (wizard)** pensé pour un joueur amateur, pas forcément à l'aise avec l'informatique. Aucun autre chantier traité.

## Ce qui a changé, et où
Un **seul bloc** a été inséré, **juste avant `</body>`** de `magicdrums_app_v10.html`. Rien d'autre n'a été touché (vérifié octet pour octet : `v10 = v9 + bloc`).

Le bloc contient :

- `<style id="wizCss">` — styles du guide, **tout préfixé `#wiz` / `.wiz`** (aucune collision avec le CSS existant) ;
- l'overlay `#wizDim` (voile sombre) + la carte `#wizCard` (titre, texte, points de progression, boutons) ;
- le bouton flottant `#wizLauncher` (« 👋 Premiers pas », en bas à gauche) ;
- un `<script>` IIFE autonome.

## Comportement
- **8 étapes** en français simple : bienvenue → les 7 onglets → écouter (▶ Jouer) → tempo → Gaucher/Métronome → choisir un rythme (répertoire) → la notation (Aide) → c'est prêt.
- **Auto-ouverture au tout premier lancement** seulement (clé `localStorage` `md_wizard_seen_v1`). Ensuite il ne se rouvre plus tout seul.
- **Réouvrable à volonté** via le bouton « 👋 Premiers pas ».
- Clavier : `Échap` ferme, `→`/`Entrée` avancent, `←` recule.
- Chaque étape **change d'onglet** (via `tabTo()`) et **surligne l'élément réel** concerné.
- **Caché à l'impression** (`@media print`).

## Points d'accroche (volontairement non invasifs)
- **Lecture seule du moteur** : le wizard appelle uniquement la fonction globale **`tabTo(name)`**. Il **n'écrit jamais** dans `state`, ne touche **ni l'audio ni le séquenceur**.
- Sélecteurs surlignés (tous existants en v9) : `nav.tabs`, `#btnPlay`, `#tempo`, `#gaucher`, `#rlist`, `#tab-aide`.
- Clé de persistance : `md_wizard_seen_v1`.
- z-index : voile 9000 · élément surligné 9001 · carte 9002 · lanceur 8000 (max existant dans l'app = 40).

## Tests effectués
- `node --check` sur les **3 blocs `<script>`** de la v10 → **tous OK** (dont le nouveau script wizard).
- **Code existant inchangé octet pour octet** (`v10 == v9[:idx] + bloc + v9[idx:]`).
- Balises du bloc équilibrées (7 `<div>` / 7 `</div>`, 1 `<style>`, 1 `<script>`) ; toutes les ancres DOM confirmées présentes.

### Test manuel rapide (à faire dans le navigateur)
1. Ouvrir `magicdrums_app_v10.html` → le guide s'ouvre seul.
2. Cliquer **Suivant** jusqu'au bout : vérifier que l'onglet change à chaque étape et que **Jouer / tempo / Gaucher / répertoire / Aide** sont bien surlignés.
3. Recharger la page → le guide **ne se rouvre plus** tout seul.
4. Cliquer **« 👋 Premiers pas »** (bas-gauche) → il se rouvre depuis l'étape 1.
5. Lancer une impression → le guide et le bouton **n'apparaissent pas**.

## Reste / pistes pour plus tard (hors périmètre v10)
- Ajouter aussi un point d'entrée « Premiers pas » dans l'onglet **Aide**.
- Étapes dédiées **Compositeur** / **Quiz** si utile.
- Variante anglaise des textes.
