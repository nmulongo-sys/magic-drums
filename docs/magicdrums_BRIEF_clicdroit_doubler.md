# Brief — Module « Clic droit : doubler à droite/gauche » (djembé)

*À traiter dans une **conversation neuve** (feature moteur, ne pas mélanger avec autre chose).*
*Base de départ : `magicdrums_app_v11.html` (version canonique active).*

## Objectif UNIQUE
Permettre, par **clic droit** sur une frappe de djembé dans la grille, de **forcer la main** au lieu de l'alternance automatique main‑forte / main‑faible — afin de « doubler » à droite ou à gauche pour des raisons de **micro‑groove**.

Menu contextuel proposé sur une case active : **Auto (défaut) · Forcer Droite · Forcer Gauche**. Le « doublé » apparaît naturellement quand deux frappes voisines tombent sur la même main.

## Points d'accroche repérés dans la v11 (à reconfirmer en début de module)
- **`strikeHand()`** — ~ligne 1058, calcule la main d'une frappe djembé (lit `gaucher`). **C'est le point central** : il devra consulter un éventuel override avant d'appliquer l'alternance.
- **`handState()`** — ~ligne 1022, état des mains (lié à l'animation).
- **Rendu des mains** — ~lignes 1113‑1119 (`handL*` / `handR*`).
- **Toggle `gaucher`** — ~lignes 476 / 812 / 1068 / 1129.
- **Frappes stockées dans `r.lines`** ; autres champs : `r.breaks`, `r.beats`, `r.measures`, `r.arrangement` (Montage), `r.notes`.
- **`contextmenu` pas encore utilisé** → le clic droit est un ajout propre, sans collision.
- Grille de jeu = `#grid` ; les 3 djembés = `dj1/dj2/dj3`, mains `handL1..3` / `handR1..3`, toggle `#gaucher`.

## Modèle de données proposé (distinct, non destructif)
- Nouveau champ **`r.handOverrides`** (objet), distinct de l'existant (comme `r.composition` l'était de `r.arrangement`).
  - Clé = identifiant stable de la case, ex. `"<ligne>:<step>"` (utiliser l'id de ligne djembé + l'index de pas).
  - Valeur = `"D"` (droite) ou `"G"` (gauche). Absence = **Auto**.
- **Sémantique** : override = main **physique** absolue (D/G). Décider explicitement l'interaction avec `gaucher` : recommandation = l'override est absolu et **ignore** `gaucher` (sinon prévoir « forte/faible » relatif). À trancher en début de module.
- **Migration** : champ absent ⇒ `{}`. Aucun rythme existant n'est cassé.

## UX
- **Clic droit** sur une case de djembé active dans `#grid` ⇒ `preventDefault()` + petit menu positionné au curseur : Auto / Forcer Droite / Forcer Gauche.
- **Marqueur visuel** sur les cases forcées (petite lettre `d`/`g` ou liseré de couleur) pour qu'on voie d'un coup d'œil les doublés.
- L'**animation** (handL/handR) et le **son** doivent suivre la main forcée.

## Persistance
- `save()` doit inclure `r.handOverrides` ; **export/import JSON** doit le transporter.

## Méthode (rappel de tes 9 règles)
1. **Module autonome d'abord** : petit HTML/JS isolé reproduisant une mini‑grille djembé + `strikeHand()` simplifié + le menu clic droit + le champ `handOverrides`, avec un **mini‑harnais de test** (poser un override, vérifier que la main calculée change, que ça survit à un export/import).
2. **Intégration ensuite** (étape séparée) : injecter comme **script classique**, brancher dans `strikeHand()` (consulter l'override) + le rendu + le `contextmenu`, **patch ciblé** (pas de réécriture).
3. Terminer par le **contrat de livraison** : fichier `v12` + changelog + points d'accroche + test.
4. **Couper avant le mur** : au moindre signe de coupure, sauvegarder et repartir.

## Gabarit d'ouverture (à coller dans la conversation neuve)
```
Base = magicdrums_app_v11.html (dossier Appli dununs). Lis d'abord magicdrums_ETAT.md
et magicdrums_BRIEF_clicdroit_doubler.md.
Objectif UNIQUE : clic droit sur une frappe de djembé pour forcer la main
(Auto / Droite / Gauche), afin de doubler à droite/gauche (micro-groove).
Règles : module autonome + test d'abord, puis intégration en patch ciblé ;
pas de réécriture totale. Termine par magicdrums_app_v12.html + changelog + test.
Au moindre signe de réponse coupée : sauvegarde et repars sur une conversation neuve.
```
