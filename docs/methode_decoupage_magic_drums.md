# Magic Drums — Analyse du blocage et méthode de découpage en modules

*Document de travail — projet « appli Magic Drums » (apprentissage des percussions africaines).*
*Rédigé le 27 juin 2026.*

---

## Partie 1 — Pourquoi « Amélioration v3 : mains et baguettes » n'a pas abouti

### Ce qui était demandé (un seul message d'ouverture, trois objectifs)

1. **Refonte visuelle des mains** (jugées « moches ») + leur animation.
2. **Correction d'un bug** : la baguette gauche traverse depuis le fût de gauche jusqu'au fût tout à droite, ce qui ne doit pas arriver.
3. **Nouvelle fonctionnalité** : déplacer la création des briques sur un onglet séparé (= un véritable compositeur à briques).

### Ce qui s'est réellement passé

La conversation a été interrompue **deux fois** :

- **Tôt**, pendant que je reconstituais quelle était la « v3 » parmi les nombreux fichiers du projet (« La réponse de Claude a été interrompue »).
- **À la toute fin**, au moment d'injecter le compositeur dans le fichier principal : « Claude n'a pas pu terminer cette réponse. »

Le bandeau « Claude Fable 5 est actuellement indisponible » est un message de disponibilité de modèle ; ce n'est pas la cause du blocage.

### Les vraies causes (par ordre d'importance)

1. **Trois chantiers hétérogènes dans une seule conversation.** Une refonte visuelle, une correction de bug logique et une grosse fonctionnalité neuve n'ont pas le même poids ni la même nature. Les mener ensemble gonfle la conversation et ne laisse plus de marge pour le morceau le plus lourd.

2. **Le « gros morceau » = injecter un module entier dans un fichier monolithique.** Le fichier de travail (`atelier-dunun-v2_3.html`, ~292 Ko, plus de 1 500 lignes) cumule trois difficultés :
   - **1 170 espaces insécables** qui font échouer les remplacements simples → il faut des regex tolérantes, fragiles et coûteuses ;
   - **deux blocs `<script>` séparés, chacun dans son IIFE** → les variables internes du séquenceur (`ctx`, `curStep`, `timer`, `Cv`) sont encapsulées et non accessibles d'un script à l'autre ;
   - le patch devait à lui seul : ajouter le champ `r.composition`, créer une nouvelle UI de palette avec filtres, le tap-to-place, retirer l'onglet Montage et recâbler l'audio. C'est plusieurs fonctionnalités en un seul coup.

3. **Le mur de la taille de réponse.** Lire tout le fichier puis régénérer un énorme patch dans une seule réponse dépasse la limite de longueur de sortie : la réponse se coupe. C'est exactement le point où ça a planté (« déterminer si les internes du scheduler sont globaux », juste avant l'injection).

4. **Le contexte était déjà chargé** par le design visuel (rendus Playwright, plusieurs images), l'enquête sur le bug et la modélisation des données — *avant même* de commencer l'intégration. Il restait donc peu de marge pour la grosse sortie finale.

### État du travail — ce qui est récupérable

Beaucoup de choses utiles ont été produites avant le blocage. À récupérer dans la conversation :

| Objectif | État | À faire |
|---|---|---|
| **Bug baguettes (pt 2)** | **Diagnostiqué précisément** : `computeStrikes()` affecte en dur `kenkeni → baguette G` et `dununba → baguette D` sans regarder la position réelle des fûts. Régression introduite par la v2.2 Gemini, qui a écrasé le correctif « tri par position » de la v2. | Correctif identifié mais **pas confirmé comme appliqué/sauvegardé**. |
| **Refonte des mains (pt 1)** | Variante **A (« l'empreinte »)** choisie et raffinée (doigts plus épais, couleur D teal corrigée, animation de frappe). Rendus produits via Playwright. | Intégration dans le fichier **non confirmée**. |
| **Compositeur à briques (pt 3)** | **Modèle de données défini** (brique = lignes d'une seule voie + catégorie + nom + longueur en cycles ; nouveau champ `r.composition`, distinct du `r.arrangement` déjà pris par le Montage). **6 décisions de design verrouillées.** Plan d'UI (palette avec filtres, tap-to-place, suppression de l'onglet Montage). **Module séquenceur écrit dans un fichier à part et sa syntaxe validée.** | **L'injection dans le fichier principal n'a jamais eu lieu** — c'est là que ça a cassé. |

**À vérifier en priorité côté projet** : le module séquenceur a-t-il été sauvegardé comme fichier autonome (artefact ou fichier de projet) ? Si oui, il est réutilisable tel quel pour l'intégration. C'est l'actif le plus précieux à ne pas perdre.

### Mise à jour — la bifurcation « Portée des internes du scheduler »

Une conversation bifurquée (que tu as partagée) apporte trois précisions décisives :

- **Le blocage technique est résolu.** La question qui avait fait planter la conversation (« les internes du scheduler sont-ils globaux ? ») a sa réponse : le script 1 (ligne 596) n'a **pas** d'IIFE ; ses variables (`ctx`, `curStep`, `timer`, `Cv`, `playPat`, `nextT`) sont des liaisons *top-level* accessibles **par nom nu** depuis tout autre script classique. Conséquence : le compositeur doit être injecté comme **script classique** (jamais un module ES, qui aurait sa propre portée) et se brancher dans `schedule()`, à côté du test `mq.active` (fin de cycle), pour compiler et injecter le cycle suivant de `r.composition`. Le mur est levé : le module a un point d'ancrage clair.
- **Les mains et le correctif de croisement ne sont PAS dans v2.3**, et le code Gemini de référence est introuvable → il faut les **refaire de zéro**. Ce n'est donc pas « récupérable » comme le laissait espérer le tableau ci-dessus : seuls le design (« l'empreinte ») et le diagnostic (`computeStrikes` en dur) restent valables **comme spécification**, le code est à réécrire.
- **Confusion de versions confirmée.** `atelier-dunun-v2_3.html` est la base des travaux récents, **mais** `atelier-dunun-djembe-v3.html` contient des fonctions oubliées — notamment les **3 pistes djembés**. Avant de construire quoi que ce soit, il faut réconcilier ces deux fichiers en **un seul canonique**.

---

## Partie 2 — Méthode : découper le projet en modules qui se terminent bien

L'idée que tu proposes est la bonne : **un module = une conversation = un livrable qui aboutit**, et je synthétise ensuite dans la version totale. Voici comment le faire proprement.

### Principe directeur

> Une conversation ne doit jamais avoir à *concevoir* **et** *intégrer* un gros morceau dans le même fil. On sépare toujours : (1) produire un module validé en isolé, puis (2) l'intégrer par une opération courte et mécanique.

### Les 9 règles

1. **Un seul objectif par conversation.** Jamais « refonte + bug + nouvelle feature » ensemble. Une conversation = un livrable nommé : *« Module Compositeur à briques »*, *« Fix bug baguettes »*, *« Refonte visuelle des mains »*. C'est le mélange des trois qui a fait échouer la conversation analysée.

2. **Séparer « concevoir » et « intégrer ».**
   - *Phase conception* : produire le module isolé (HTML/JS autonome + mini-harnais de test) et le valider.
   - *Phase intégration* : une conversation dédiée qui insère le module déjà validé dans le fichier canonique.

3. **Un fichier canonique unique = la seule source de vérité.** Aujourd'hui il existe trop de copies (`gemini-code-*`, `versiongemini1.html`, `atelier-dunun-v2_3.html`…) : c'est ce qui crée la confusion « quelle est la v3 ? ». Décide d'**un** fichier officiel (ex. `magicdrums_app_v4.html`). Au début de chaque conversation, c'est le seul fichier de référence ; à la fin, on produit la version suivante complète et fonctionnelle (`v5`, `v6`…). Tout le reste est archivé.

4. **Sortir le module dans un fichier séparé d'abord** (ce qui avait justement été bien amorcé : « j'écris d'abord le module séquenceur dans un fichier à part »). Un module autonome et testé rend l'intégration ensuite rapide et sûre.

5. **Des patchs ciblés, jamais de réécriture totale.** Pour corriger ou intégrer, demande le bloc précis à remplacer, pas la régénération des 1 500 lignes. C'est la régénération massive qui dépasse la limite de sortie.
   > Exemple : *« Ne réécris que la fonction `computeStrikes()`. Donne-moi le bloc complet, prêt à coller, et indique la ligne de début. »*

6. **Assainir le fichier une bonne fois.** Une conversation « Assainissement » qui (a) normalise les espaces insécables et (b) expose proprement les internes du séquenceur dans un petit espace global (ex. `window.APP = { ctx, curStep, timer, Cv, … }`). Ça supprime les deux causes de fragilité (nbsp + IIFE encapsulés) et fait gagner du temps sur **toutes** les itérations suivantes.

7. **Chaque conversation se termine par un « contrat de livraison »** (c'est ce que je récupère pour la synthèse) :
   - le fichier produit (module isolé **ou** app complète `vX+1`) ;
   - un court changelog : ce qui a changé, où, ce qui reste ;
   - les points d'accroche : noms des fonctions / variables / champs touchés (ex. `r.composition`, `computeStrikes()`) ;
   - un test rapide pour valider (« joue Dununba, vérifie qu'aucune baguette ne traverse »).

8. **Couper avant le mur — surveille les signaux.** Si une réponse se met à régénérer tout le fichier, si tu vois « réponse interrompue », ou si la conversation devient très longue : on s'arrête, on **sauvegarde le fichier courant comme nouvelle version**, et on ouvre une conversation neuve pour la suite. N'insiste pas avec « Réessayer » sur un gros patch — re-découpe-le.

9. **La synthèse est une conversation à part, et c'est mon rôle.** Tu me donnes le fichier canonique courant + les livrables de chaque module (fichiers + changelogs). Je fusionne dans une version totale, je règle les conflits (ex. `r.arrangement` du Montage vs `r.composition` du compositeur), je vérifie la cohérence et je sors une `vX` complète + un changelog global. Comme la synthèse lit surtout des modules **déjà validés** (peu de conception), elle tient dans une seule conversation.

### Plan de reprise concret pour Magic Drums

Dans l'ordre, une conversation par étape :

1. **Réconciliation v2.3 ↔ v3 (prioritaire).** Comparer `atelier-dunun-v2_3.html` et `atelier-dunun-djembe-v3.html`, récupérer les fonctions oubliées (les **3 pistes djembés** et tout le reste) et figer **un** fichier canonique fiable : `magicdrums_app_v4.html`. Tant que ce n'est pas fait, on ne construit rien dessus.
2. **Assainissement du fichier** — normaliser les espaces insécables, exposer proprement le scheduler. Sortie : canonique propre + changelog.
3. **Fix bug baguettes** — réécrire le tri par position dans `computeStrikes()` (à refaire de zéro). Petit, rapide.
4. **Refonte visuelle des mains** — réécrire la main « l'empreinte » + animation de frappe (à refaire de zéro, pas de source Gemini).
5. **Compositeur à briques — conception** — finaliser le module séquenceur en fichier autonome + mini-harnais de test ; injection prévue comme **script classique**, branchement dans `schedule()` à côté de `mq` (portée déjà confirmée).
6. **Compositeur à briques — intégration** — injecter le module validé dans le canonique, retirer l'onglet Montage.
7. **Synthèse** (moi) — fusionner, vérifier la cohérence, produire la version totale + changelog global.

---

## Gabarits de prompts (à copier-coller)

### Ouvrir un module
```
Objectif UNIQUE de cette conversation : [ex. corriger le bug des baguettes].
Fichier de référence : [magicdrums_app_v4.html — joint].
Contraintes :
- Ne traite que cet objectif, rien d'autre.
- Pas de réécriture complète du fichier : donne des blocs ciblés à remplacer.
- Si la tâche est grosse, produis d'abord un module autonome + un test, avant toute intégration.
Quand c'est fini, termine par le « contrat de livraison » (fichier + changelog + points d'accroche + test).
```

### Clôturer un module
```
On clôt ce module. Donne-moi :
1) le fichier final (module isolé OU app complète versionnée) ;
2) le changelog : quoi, où, ce qui reste ;
3) les points d'accroche (fonctions/variables/champs touchés) ;
4) un test rapide pour valider.
```

### Lancer la synthèse (avec moi)
```
Voici le fichier canonique courant [vX] + les livrables des modules suivants : [liste, avec fichiers et changelogs].
Fusionne le tout dans une version totale, règle les conflits, vérifie la cohérence,
et donne-moi une vX+1 complète et fonctionnelle + un changelog global.
```

---

## Bonus — bloc à coller dans les « Instructions » du projet Claude

> Tu n'as pas demandé ce format, mais coller ceci dans les *Instructions du projet* cadre automatiquement chaque conversation :

```
Ce projet est une app web mono-fichier (HTML/JS) d'apprentissage des percussions.
Règles pour chaque conversation :
1. Un seul objectif par conversation ; ne pas mélanger feature, bug et refonte visuelle.
2. Il existe UN fichier canonique de référence ; ne pas en créer de copies parallèles.
3. Jamais de réécriture totale du fichier : fournir des blocs ciblés à remplacer.
4. Pour une grosse fonctionnalité : produire d'abord un module autonome testé, puis l'intégrer dans une étape séparée.
5. Terminer chaque conversation par un contrat de livraison : fichier + changelog + points d'accroche + test rapide.
6. Au moindre signe de réponse trop longue/coupée : s'arrêter, sauvegarder la version courante, repartir sur une conversation neuve.
```

---

## Annexe — Inventaire des versions locales (dossier « Appli dununs »)

Au 27 juin 2026, le dossier contient plusieurs fichiers HTML divergents. Présence des fonctions principales (détection par mots-clés, à confirmer au cas par cas) :

| Fonction | djembev1 | djembev2 | djembe-v3 | v2_3 |
|---|:---:|:---:|:---:|:---:|
| **3 djembés** (`dj1/dj2/dj3`) | — | — | **OUI** | — |
| **2 djembés** (`djembeA/djembeG`) | — | — | — | **OUI** |
| Mode Montage (`mq`) | — | — | — | OUI |
| Compositeur / Tetris | — | — | — | OUI |
| Rebond | OUI | — | — | OUI |
| Volumes / mixage | OUI | OUI | OUI | OUI |
| Chauffe djembé | — | — | OUI | OUI |
| Breaks | OUI | OUI | OUI | OUI |
| `computeStrikes` (bug baguettes) | — | OUI | OUI | OUI |
| Main « empreinte » | — | — | — | — |
| Sangban / Dununba / Kenkeni | OUI | OUI | OUI | OUI |

Tailles : `djembev1` 838 l. · `djembev2` 1004 l. · `djembe-v3` 1186 l. · **`v2_3` 1688 l. (le plus récent et le plus complet)**.

**Conclusions**

- `atelier-dunun-v2_3.html` est la branche la plus avancée côté dunun (Montage, Compositeur Tetris, Rebond) **mais n'a que 2 djembés** (`djembeA` aigu / `djembeG` grave, SVG 430×250).
- `atelier-dunun-djembe-v3.html` est la **seule à avoir 3 djembés** (`dj1`/`dj2`/`dj3`, SVG 600×232, « Trois djembés vus de dessus ») mais lui manquent Montage, Compositeur et Rebond.
- Les deux fichiers ont **divergé** : identifiants et mise en page SVG différents → ce n'est pas un simple copier-coller de fonction, c'est une vraie fusion.
- La main « empreinte » n'est dans **aucun** fichier → à refaire de zéro (confirme la bifurcation).
- **Réconciliation recommandée** : prendre `v2_3` comme canonique et y porter la 3ᵉ piste djembé depuis `djembe-v3`, c'est-à-dire élargir le modèle de 2 à 3 voix djembé partout : grille de jeu, rendu SVG, et briques du futur compositeur.
