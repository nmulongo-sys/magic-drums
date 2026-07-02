# Plan de fusion — porter la 3ᵉ piste djembé dans v2_3

*Plan écrit, aucun fichier modifié. Basé sur la lecture du code réel de `atelier-dunun-v2_3.html` et `atelier-dunun-djembe-v3.html` (dossier « Appli dununs »), le 27 juin 2026.*

## Objectif

Faire de `atelier-dunun-v2_3.html` le fichier **canonique** et y ajouter une **3ᵉ voix djembé**, en réutilisant la solution déjà présente dans `atelier-dunun-djembe-v3.html`. Résultat visé : `magicdrums_app_v4.html` à 3 djembés, **qui conserve toutes les fonctions récentes de v2_3** (Montage, Compositeur Tetris, Rebond) — que djembe-v3 n'a pas.

## Pourquoi c'est plus simple que prévu

- Les deux fichiers partagent **le même modèle de données** : un tableau `LINES` et le même alphabet djembé `CYCLE_MAP.djembe = [".","B","I","X","E"]`.
- Au niveau données, djembe-v3 **ajoute juste** `{id:"djembe3"}` aux voix existantes (`djembe`, `djembe2`). Les identifiants sont identiques à v2_3 ; seul l'affichage SVG diffère.
- djembe-v3 a **déjà résolu le son et l'animation** de la 3ᵉ voix → on porte une recette éprouvée, on n'invente rien.
- v2_3 régénère les lignes manquantes tout seul : `fixLines()` **parcourt `LINES`** (`for(const L of LINES)`), donc ajouter `djembe3` à `LINES` suffit à créer la ligne (vide) dans tous les rythmes. **La persistance est gratuite.**

## Décision préalable (libellés & rôles)

- **djembe-v3** : voix nommées « Djembé 1 / 2 / 3 », avec rôles — **1 = soliste** (chauffe, son qui domine, gain 2.0), **2 & 3 = accompagnement** (gain 1.35).
- **v2_3** : voix nommées « Djembé aigu / grave ».
- À trancher (n'affecte que les `label`) : garder **« Djembé 1/2/3 »** (logique de rôles) ou adopter **« Aigu / Médium / Grave »** (logique musicale). Les deux fonctionnent.

---

## Les 6 points de modification dans v2_3 (et rien d'autre)

### 1 — Données : ajouter la voix (1 ligne)
Dans `const LINES=[ … ]`, après `{id:"djembe2",label:"Djembé grave",type:"djembe",color:"var(--djembe2)"}`, ajouter :
```js
{id:"djembe3",label:"Djembé médium",type:"djembe",color:"var(--djembe3)"}
```
`normalize()`/`fixLines()` créeront automatiquement la ligne `djembe3` partout.
*(Si tu choisis la logique « 1/2/3 », renomme aussi `djembe`→« Djembé 1 » et `djembe2`→« Djembé 2 ».)*

### 2 — CSS : couleur de la 3ᵉ voix (1 ligne)
Dans `:root{ … }`, à côté de `--djembe` et `--djembe2`, ajouter par ex. :
```css
--djembe3:#A9743F;
```
*(djembe-v3 propose une palette à 3 teintes #6E441F / #653D18 / #5A3315 si tu veux l'harmoniser.)*

### 3 — SVG : passer de 2 à 3 djembés
Remplacer le bloc `<svg id="svgDjembe" viewBox="0 0 430 250"> … (groupes `djembeA` + `djembeG`) … </svg>` par la version 3 djembés de djembe-v3 : `viewBox="0 0 600 232"`, groupes **`dj1` / `dj2` / `dj3`** (cx = 100 / 300 / 500).
⚠️ Changement d'identifiants : v2_3 = `djembeA`/`djembeG`, djembe-v3 = `dj1`/`dj2`/`dj3`. L'animation (point 4) doit donc viser les nouveaux id. Reprendre aussi les éléments de **mains** (`handR/L…`) associés.

### 4 — Animation : porter `animateDjembe` (3 voies)
Remplacer la version binaire de v2_3 (`grave=ev.id==="djembe2"` → `djembeG`/`djembeA`, cx 108/322) par la version 3 voies de djembe-v3 :
```js
function animateDjembe(ev,step){
  const n = ev.id==="djembe3" ? 3 : (ev.id==="djembe2" ? 2 : 1);
  const grp = document.getElementById("dj"+n); if(!grp) return;
  const cx = [0,100,300,500][n], cy = 96;
  const useRight = (step%2===0) ? !state.ui.gaucher : state.ui.gaucher;
  const hand = document.getElementById("hand"+(useRight?"R":"L")+n);
  const side = useRight?1:-1;
  let x=cx, y=cy, sel=".zBasse";
  if(ev.ch==="I"){ x=cx+side*30; y=cy+18; sel=".zTonique"; }
  if(ev.ch==="X"||ev.ch==="E"){ x=cx+side*50; y=cy+32; sel=".zClaque"; }
  if(hand) hand.style.transform=`translate(${x}px,${y}px)`; pulse(hand);
}
```
⚠️ Les mains sont indexées `hand…+n` (1/2/3) dans djembe-v3, contre `hand…+G/A` dans v2_3 : cohérent avec le nouveau SVG, à garder ensemble.

### 5 — Déclenchement : corriger un bug hérité de djembe-v3
Au point d'appel de l'animation (boucle `draw`/scheduler), **djembe-v3 ne déclenche l'animation que pour `djembe` et `djembe2`** :
```js
if(ev.id==="djembe"||ev.id==="djembe2") animateDjembe(ev,e.step);  // bug : djembe3 jamais animé
```
→ Dans djembe-v3, le 3ᵉ djembé **sonne mais ne s'anime pas**. Lors du portage, écrire :
```js
if(ev.id==="djembe"||ev.id==="djembe2"||ev.id==="djembe3") animateDjembe(ev,e.step);
```
**Ne pas recopier le bug.** Vérifier le test `animateDjembe(` existant dans v2_3 et l'étendre de la même façon.

### 6 — Audio : donner un son à `djembe3` (recette de djembe-v3)
Aucun fichier n'a d'échantillon dédié au 3ᵉ djembé. djembe-v3 réutilise **les samples graves pitchés**. Dans la fonction de lecture de v2_3 (`d(lineId,ch,t)`), étendre la branche djembé selon `playSound()` de djembe-v3 :
- **condition** : `lineId==="djembe" || lineId==="djembe2" || lineId==="djembe3"`
- **kit** : `djembe → "DJE_"` (aigu), sinon `"DJG_"` (djembe2 **et** djembe3 prennent les graves)
- **pitch** : `rate = (lineId==="djembe3") ? 1.22 : 1.0` → djembe3 = grave accéléré = « médium »
- **gain/rôle** : `gain = (lineId==="djembe") ? 2.0 : 1.35` (soliste vs accompagnements)
- **repli synthé** (si pas de buffer) : `f0` = `djembe2`→64, `djembe3`→74, `djembe`→82.

⚠️ Détail de nommage : v2_3 appelle cette fonction **`d()`**, djembe-v3 l'appelle **`playSound()`** — même logique, adapter le nom au fichier cible.

---

## Ce qui devrait marcher sans modification (à confirmer au test)
- **Grille / séquenceur** : les rangées sont générées en parcourant `LINES` → la rangée `djembe3` apparaît automatiquement.
- **Persistance** : `normalize()` + `fixLines()` ajoutent `djembe3` aux rythmes existants → pas de casse des sauvegardes.
- **Mixage par piste** (`trackVols`) et scheduler lisent par id → `djembe3` hérité.

## Points de vigilance
- **Compositeur à briques** (chantier futur) : son modèle ne parlait que d'« aigu + grave » → il faudra l'**élargir à 3 voies djembé** quand on le construira.
- **Responsive** : le SVG passe de 430 à 600 de large ; vérifier le rendu tablette et ajuster le `width`/CSS si besoin.
- **Mains « empreinte »** : elles n'existent dans aucun fichier. La refonte visuelle des mains reste un **chantier distinct, après la fusion** — ce sera l'occasion de dessiner directement 3 paires de mains cohérentes.

## Ordre d'exécution (1 conversation dédiée, quand tu voudras)
1. Copier `v2_3` → `magicdrums_app_v4.html` (non destructif, les originaux restent intacts).
2. Appliquer les points 1 → 6 en **patchs ciblés** (pas de réécriture globale).
3. Tester (checklist ci-dessous).
4. Si OK : `v4` devient le canonique, puis on enchaîne assainissement → bug baguettes → mains → compositeur.

## Checklist de validation
- [ ] Une 3ᵉ rangée « Djembé … » apparaît dans la grille.
- [ ] Des frappes B/I/X/E sur `djembe3` produisent un son **médium**, distinct de l'aigu et du grave.
- [ ] L'animation frappe bien le 3ᵉ djembé (`dj3`) avec la bonne main.
- [ ] Sauvegarde puis rechargement conservent la ligne `djembe3`.
- [ ] Montage, Compositeur Tetris et Rebond (fonctions de v2_3) marchent toujours.
