# gemini-proxy — proxy IA partagé pour les apps statiques

Les apps (Magic Drums, Métronome…) sont des **fichiers HTML uniques, hors-ligne,
publiés sur GitHub Pages**. Une clé API écrite en dur dans le HTML serait
publiquement lisible et se ferait bannir en quelques jours. Ce petit
[Cloudflare Worker](https://developers.cloudflare.com/workers/) garde **une**
clé Google Gemini partagée côté serveur ; les apps n'appellent que l'URL du
Worker, jamais la clé.

Adapté à « peu d'utilisateurs, données non confidentielles ». Ce n'est pas une
passerelle durcie : la protection réelle reste le **quota gratuit de Gemini** et
la **restriction d'origine** ci-dessous.

## 1. Obtenir une clé Gemini (gratuite)

1. Va sur <https://aistudio.google.com/apikey> (compte Google).
2. « Create API key » → copie la clé.
3. Le tier gratuit suffit largement pour un petit groupe. Voir les quotas :
   <https://ai.google.dev/gemini-api/docs/rate-limits>.

## 2. Déployer le Worker

Il te faut [Node.js](https://nodejs.org) et un compte Cloudflare (gratuit).

```bash
cd proxy
npx wrangler login                 # ouvre le navigateur pour autoriser
npx wrangler secret put GEMINI_API_KEY   # colle ta clé quand demandé
npx wrangler deploy
```

`wrangler deploy` affiche une URL du type :

```
https://gemini-proxy.<ton-sous-domaine>.workers.dev
```

C'est cette URL que tu colleras dans l'app.

## 3. Restreindre l'accès (recommandé)

Une fois que tes apps sont en ligne, limite les origines autorisées pour que
n'importe quel site ne puisse pas consommer ton quota. Dans `wrangler.toml` :

```toml
[vars]
ALLOWED_ORIGIN = "https://nmulongo-sys.github.io"
```

Puis `npx wrangler deploy` à nouveau. Plusieurs origines : sépare par des
virgules (`"https://a.exemple,https://b.exemple"`).

## 4. Brancher l'app

Dans Magic Drums : onglet **Créer → Par IA → Réglages IA**, colle l'URL du
Worker. Elle est mémorisée dans ce navigateur (`localStorage`, jamais commitée).
Le bouton **✨ Générer le rythme** appelle alors le proxy et importe le rythme
directement. Le bouton **Copier le prompt** reste disponible en repli (aucun
proxy requis).

## Contrat HTTP

`POST` JSON vers l'URL du Worker :

```json
{ "prompt": "…", "json": true, "temperature": 0.9 }
```

| champ         | requis | rôle                                            |
|---------------|--------|-------------------------------------------------|
| `prompt`      | oui    | texte envoyé au modèle                          |
| `json`        | non    | force une réponse `application/json`            |
| `temperature` | non    | 0..2 (défaut 1.0)                               |

Réponse : `{ "text": "…" }` en cas de succès, sinon `{ "error": "…" }` avec un
code HTTP adapté (400 requête invalide, 413 prompt trop long, 429 quota, 502
Gemini injoignable…).

## Variables (wrangler.toml `[vars]` ou tableau de bord Cloudflare)

| variable         | défaut              | rôle                                   |
|------------------|---------------------|----------------------------------------|
| `GEMINI_API_KEY` | *(secret)*          | clé AI Studio — via `wrangler secret`  |
| `GEMINI_MODEL`   | `gemini-2.0-flash`  | modèle Gemini                          |
| `ALLOWED_ORIGIN` | `*`                 | origines CORS autorisées               |
| `MAX_PROMPT`     | `8000`              | taille max du prompt (caractères)      |
| `MAX_TOKENS`     | `2048`              | plafond de tokens en sortie            |

## Tester en local

```bash
npx wrangler dev        # sert le Worker sur http://localhost:8787
```

```bash
curl -X POST http://localhost:8787 \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Dis bonjour en une phrase."}'
```
