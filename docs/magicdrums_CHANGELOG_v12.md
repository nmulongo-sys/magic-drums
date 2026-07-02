# Magic Drums — Changelog v12 (2026-07-02)

Refonte esthétique et ergonomique. Aucun changement de moteur (son, séquenceur, persistance) : les clés `localStorage` (`atelier_dunun_djembe_v3`, `md_wizard_seen_v2`) sont inchangées, l'état des utilisateurs est conservé.

## 1. Visuels instruments (le point faible identifié)

**Canvas duns (`drawDun`) — réécrit intégralement.**
Chaque fût est maintenant dessiné en vue de dessus réaliste : ombre portée, anneau de fût en dégradé bois, gorge sombre avec crochets de tension en laiton (18 points), peau de chèvre en dégradé radial décentré (lumière), patine d'usure au centre, liseré. Halo chaud au sol sous les fûts. À la frappe : flash radial de la peau dans la couleur du fût, onde concentrique qui s'étend en s'estompant, halo extérieur. Frappe fermée = teinte bleutée atténuée (convention conservée), cloche = teinte laiton-vert.

**Baguettes.** Fini le trait + pastille lettrée : manche en dégradé bois avec légère courbure et passe d'ombre, tête boule bois cerclée de la couleur de la main (G orange / D turquoise), ombre de la tête projetée sur la peau, badge G/D fixe à la base. La cinématique (interpolation easeIO, rebond parabolique) est inchangée.

**SVG djembés — redessiné.** Fût bois en dégradé radial, cordage en pointillés laiton, peau en dégradé avec assombrissement progressif aigu→grave, zones basse/ton/claqué en anneaux transparents à liseré pointillé (illumination à la frappe conservée, en fondu `fill-opacity`). Étiquettes CLAQUÉ / TON / BASSE repositionnées sur les zones. Mains « empreinte » : remplissage translucide coloré + ombre portée, libellé G/D détouré.

## 2. Ergonomie

**Navigation regroupée : 7 → 5 entrées.** Jouer · Rythmes · **Créer** · Quiz · Aide. « Créer » regroupe en sous-onglets (pilules) : Compositeur, Chauffe, Par IA. `tabTo()` accepte toujours les 7 noms — wizard et code existant intacts (`TAB_GROUP` mappe les membres du groupe).

**Mobile d'abord.** Sous 700 px : barre d'onglets fixée en bas d'écran (5 icônes + libellés, `safe-area-inset`), barre du haut compactée en rangée défilable, bouton Jouer pleine largeur, bouton « Premiers pas » remonté au-dessus de la barre.

**Écran Jouer hiérarchisé.** Transport scindé : rangée principale (▶ Jouer proéminent, tempo, BPM) toujours visible ; les six réglages secondaires (métronome, montée, gaucher, ensemble, cloches, volumes) derrière un bouton « Options ▾ » dont l'état est mémorisé (`state.ui.tOpts`). Légende de la grille repliée dans un `<details>`.

**Cohérence des contrôles.** Cases à cocher → interrupteurs (switch laiton) partout ; curseurs range restylés (piste sombre, pouce laiton, y compris mixer) ; selects avec chevron custom ; `:focus-visible` laiton ; ombres légères unifiées sur les boutons ; champs `input` sans attribut `type` (recherche du compositeur) rattrapés par le style commun.

## 3. Bulles d'explication généralisées

**Registre unique de ~80 fiches** (`window.MD_HELP`, format `[sélecteur, titre, texte]`) couvrant chaque fonction : barre du haut, onglets et sous-onglets, scène (fûts, djembés, REC, disposition), transport et ses options, grille, breaks/appel, mixer, répertoire, réglages du rythme, JSON, compositeur complet, chauffe, IA, quiz, impression.

Deux consommateurs :
- **Survol (desktop)** — le panneau contextuel existant de la v11 (`#global-tooltip-panel`) est conservé mais alimenté par le registre partagé (son ancien registre de 16 entrées est supprimé) ; `closest()` sécurisé pour les sélecteurs `:has()` ; le tap tactile ne laisse plus la bulle collée à l'écran.
- **Mode aide (tactile et desktop)** — nouveau bouton « ? » dans la barre du haut : quand il est actif, toucher n'importe quel élément affiche sa bulle **au lieu d'exécuter l'action** (interception en phase capture : clic, change, espace bloqués). Élément ciblé surligné en pointillés laiton, bannière d'état, sortie par ?, Échap ou « Quitter ». Bloc autonome en fin de fichier, lecture seule du DOM.

**Wizard** : étape « Les 7 onglets » → « Les 5 onglets » ; nouvelle étape présentant le mode aide (23 étapes).

## Vérifications

`node --check` OK sur les 4 blocs script. Tests Chromium headless (desktop 1280×900 et mobile 390×800) : zéro erreur console ; navigation groupée et sous-onglets OK ; mode aide : le clic sur un interrupteur affiche sa bulle sans changer son état ; survol alimenté par le registre partagé ; studio de motifs « Tetris » et compositeur intacts ; lecture audio et animations fonctionnelles.
