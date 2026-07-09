# gemini-proxy

Proxy IA **partagé** pour les apps statiques (Magic Drums, Métronome…) publiées sur GitHub Pages. Il garde **une seule** clé Google Gemini côté serveur, derrière **une seule URL** : toutes les apps — et leurs ~20 utilisateurs — appellent le proxy, jamais la clé. Personne n'a besoin de sa propre clé, et la clé n'est jamais exposée dans le HTML public.

**En ligne** : `https://gemini-proxy.nmulongo.workers.dev`
**Statut** : déployé le 2026-07-09 • Cloudflare Worker (fichier unique `worker.js`) • modèle `gemini-2.5-flash` (tier gratuit).

## Utilisation

Le proxy est **unique et commun à tout le monde**. Les ~20 utilisateurs se servent tous de la même app, sur la même origine (`https://nmulongo-sys.github.io`), donc du même proxy.

Pour brancher une app : **Réglages IA → coller** `https://gemini-proxy.nmulongo.workers.dev`. L'URL est mémorisée dans le navigateur (`localStorage`), jamais commitée. Le bouton **✨ Générer** appelle alors le proxy.

Pour que ce soit **transparent pour les 20 personnes** (aucune manip de leur part), il est recommandé d'inscrire cette URL comme **valeur par défaut dans le code de chaque app** : ainsi le champ « Réglages IA » est déjà rempli à l'ouverture, et personne n'a rien à coller.

**Quota partagé** : les utilisateurs partagent le **quota gratuit** de Gemini (modèle Flash). Cela convient à un petit groupe en usage léger ; en cas de pic, un utilisateur peut recevoir une erreur `429` (quota atteint) — jamais un débit, tant que le projet Google reste **sans facturation**. Ne pas envoyer de **données confidentielles** : sur le tier gratuit, les prompts peuvent servir à améliorer les produits Google.

## Contrat HTTP

`POST` JSON vers l'URL du Worker :

```json
{ "prompt": "…", "json": true, "temperature": 0.9 }
```

| champ         | requis | rôle                                   |
|---------------|--------|----------------------------------------|
| `prompt`      | oui    | texte envoyé au modèle                 |
| `json`        | non    | force une réponse `application/json`   |
| `temperature` | non    | 0..2 (défaut 1.0)                      |

Réponse : `{ "text": "…" }` en cas de succès, sinon `{ "error": "…" }` avec un code HTTP adapté (`400` requête invalide, `403` origine non autorisée, `413` prompt trop long, `429` quota, `502` Gemini injoignable).

## Architecture & conventions

- **Un seul fichier** `worker.js`, un Cloudflare Worker en syntaxe module (`export default { fetch }`). Aucune dépendance externe.
- **La clé ne vit que côté serveur.** Elle est stockée en **variable secrète chiffrée** Cloudflare (`GEMINI_API_KEY`), jamais dans le code ni dans les apps. C'est ce qui permet de partager le proxy sans jamais partager la clé.
- **Restriction d'origine (CORS).** `ALLOWED_ORIGIN` liste les origines autorisées. Une requête venant d'ailleurs reçoit `403 { "error": "Origine non autorisée." }` — c'est la protection contre le pillage de quota. Les 20 utilisateurs passant tous par `nmulongo-sys.github.io`, une seule origine suffit.
- **Garde-fous** dans le code : `MAX_PROMPT` (défaut 8000 caractères), `MAX_TOKENS` (défaut 2048), température bornée à `0..2`.
- **Flux** : app → `POST` proxy → appel `models/<MODEL>:generateContent` chez Gemini → le proxy renvoie `{ text }` (concaténation des `parts` de la réponse).
- **Garantie « gratuit uniquement »** : le projet Google de la clé ne doit **jamais** avoir la facturation activée, et `GEMINI_MODEL` doit rester un modèle **Flash / Flash-Lite**. Les modèles Pro sont payants.

### Variables (Cloudflare → Worker `gemini-proxy` → Settings → Variables and secrets)

| variable         | type   | valeur actuelle / défaut          | rôle                                 |
|------------------|--------|-----------------------------------|--------------------------------------|
| `GEMINI_API_KEY` | Secret | *(chiffré)*                       | clé AI Studio — **obligatoire**      |
| `ALLOWED_ORIGIN` | Text   | `https://nmulongo-sys.github.io`  | origines CORS autorisées (virgules)  |
| `GEMINI_MODEL`   | Text   | `gemini-2.5-flash` (défaut code)  | modèle Gemini (tier gratuit : Flash) |
| `MAX_PROMPT`     | Text   | `8000` (défaut code)              | taille max du prompt (caractères)    |
| `MAX_TOKENS`     | Text   | `2048` (défaut code)              | plafond de tokens en sortie          |

> Déploiement alternatif en ligne de commande (facultatif) : `wrangler.toml` est fourni pour `npx wrangler deploy` + `npx wrangler secret put GEMINI_API_KEY`. Le déploiement de référence reste le tableau de bord.

## Maintenance

- **Changer / renouveler la clé** : Cloudflare → `gemini-proxy` → Settings → Variables → éditer `GEMINI_API_KEY` → **Deploy**. (Rien à toucher dans les apps.)
- **Ajouter une origine** (ex. un second site) : éditer `ALLOWED_ORIGIN`, séparer les origines par des virgules.
- **Suivre l'usage** : Cloudflare → `gemini-proxy` → **Metrics** (nombre d'invocations, erreurs) ; quotas côté Google → AI Studio.
- **Changer de modèle** : ajouter/éditer `GEMINI_MODEL` — rester sur un modèle **Flash** pour ne pas quitter le tier gratuit.

## Journal de développement

### 2026-07-09 — Déploiement initial
- Création du Worker `gemini-proxy` sur Cloudflare (compte nmulongo, sous-domaine `nmulongo.workers.dev`) via le tableau de bord, sans terminal ni Node.
- `worker.js` déployé : contrat `POST { prompt, json, temperature } → { text }`, CORS par origine, garde-fous `MAX_PROMPT` / `MAX_TOKENS`, gestion des codes `400 / 403 / 413 / 429 / 502`.
- Secret `GEMINI_API_KEY` configuré (chiffré). `ALLOWED_ORIGIN` = `https://nmulongo-sys.github.io`.
- Test de fumée : visite directe de l'URL → `{ "error": "Origine non autorisée." }` — confirme que le nouveau code tourne **et** que la restriction d'origine est active.
- Branchement dans les apps : URL inscrite en **valeur par défaut** dans le code (Magic Drums onglet Par IA, Métronome section Routine) → champ « Réglages IA » pré-rempli, rien à coller côté utilisateur.

## Licence

À définir. **MIT** recommandée pour un outil partagé (réutilisation libre, auteur crédité). Sans fichier `LICENSE`, le code est « tous droits réservés » par défaut.
