/*
 * gemini-proxy — Cloudflare Worker
 * ---------------------------------
 * Proxy CORS qui cache UNE clé Google Gemini partagée, pour que les applications
 * statiques (Magic Drums, Métronome…) génèrent du contenu par IA sans jamais
 * exposer la clé dans le HTML public. Une seule URL, un seul quota, ~20 users.
 *
 * Déployé via le tableau de bord Cloudflare (sans terminal) :
 *   Workers & Pages → Create → coller ce fichier → Deploy.
 *   Puis Settings → Variables :
 *     - GEMINI_API_KEY  (Secret, chiffré)   ← clé AI Studio
 *     - ALLOWED_ORIGIN  (Text)              ← "https://nmulongo-sys.github.io"
 *   URL en ligne : https://gemini-proxy.nmulongo.workers.dev
 *
 * Variables (Settings → Variables and secrets) :
 *   GEMINI_API_KEY  (secret, obligatoire)  clé AI Studio
 *   GEMINI_MODEL    modèle Gemini           (défaut "gemini-2.5-flash", tier gratuit)
 *   ALLOWED_ORIGIN  origines autorisées, séparées par des virgules
 *                   (défaut "*"). Ex. "https://nmulongo-sys.github.io"
 *   MAX_PROMPT      taille max du prompt en caractères (défaut 8000)
 *   MAX_TOKENS      plafond de tokens en sortie (défaut 2048)
 *
 * Contrat client (POST JSON) :
 *   { "prompt": "…", "json": true, "temperature": 0.9 }
 * Réponse : { "text": "…" }  ou  { "error": "…" } avec un code HTTP adapté
 *   (400 requête invalide, 403 origine non autorisée, 413 prompt trop long,
 *    429 quota, 502 Gemini injoignable).
 */

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

function allowedOrigins(env) {
  return (env.ALLOWED_ORIGIN || "*").split(",").map((s) => s.trim()).filter(Boolean);
}
function pickOrigin(request, env) {
  const allowed = allowedOrigins(env);
  const origin = request.headers.get("Origin") || "";
  if (allowed.includes("*")) return "*";
  if (origin && allowed.includes(origin)) return origin;
  return allowed[0] || "";
}
function originAllowed(request, env) {
  const allowed = allowedOrigins(env);
  if (allowed.includes("*")) return true;
  const origin = request.headers.get("Origin") || "";
  return !!origin && allowed.includes(origin);
}

function corsHeaders(request, env) {
  return {
    "Access-Control-Allow-Origin": pickOrigin(request, env) || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(body, status, request, env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(request, env) },
  });
}

export default {
  async fetch(request, env) {
    // Restriction d'origine : protège le quota partagé contre le pillage.
    if (!originAllowed(request, env)) {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 403, headers: corsHeaders(request, env) });
      }
      return json({ error: "Origine non autorisée." }, 403, request, env);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }
    if (request.method !== "POST") {
      return json({ error: "Méthode non autorisée — utilise POST." }, 405, request, env);
    }
    if (!env.GEMINI_API_KEY) {
      return json({ error: "Proxy mal configuré : GEMINI_API_KEY manquante." }, 500, request, env);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "Corps JSON invalide." }, 400, request, env);
    }

    const prompt = typeof payload.prompt === "string" ? payload.prompt.trim() : "";
    const maxPrompt = parseInt(env.MAX_PROMPT || "8000", 10);
    if (!prompt) return json({ error: "Champ « prompt » vide." }, 400, request, env);
    if (prompt.length > maxPrompt) {
      return json({ error: `Prompt trop long (max ${maxPrompt} caractères).` }, 413, request, env);
    }

    const model = env.GEMINI_MODEL || "gemini-2.5-flash";
    const maxTokens = parseInt(env.MAX_TOKENS || "2048", 10);
    let temperature = 1.0;
    if (typeof payload.temperature === "number" && isFinite(payload.temperature)) {
      temperature = Math.min(2, Math.max(0, payload.temperature));
    }

    const generationConfig = { temperature, maxOutputTokens: maxTokens };
    if (payload.json === true) generationConfig.responseMimeType = "application/json";

    const url = `${GEMINI_ENDPOINT}/${encodeURIComponent(model)}:generateContent?key=${env.GEMINI_API_KEY}`;

    let upstream;
    try {
      upstream = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig,
        }),
      });
    } catch (e) {
      return json({ error: "Impossible de joindre Gemini : " + e.message }, 502, request, env);
    }

    let data;
    try {
      data = await upstream.json();
    } catch {
      return json({ error: "Réponse Gemini illisible." }, 502, request, env);
    }

    if (!upstream.ok) {
      const msg = (data && data.error && data.error.message) || `Erreur Gemini (${upstream.status}).`;
      return json({ error: msg }, upstream.status, request, env);
    }

    const cand = data.candidates && data.candidates[0];
    const parts = (cand && cand.content && cand.content.parts) || [];
    const text = parts.map((p) => p.text || "").join("").trim();
    if (!text) {
      const reason = (cand && cand.finishReason) || "inconnue";
      return json({ error: "Réponse vide du modèle (raison : " + reason + ")." }, 502, request, env);
    }

    return json({ text }, 200, request, env);
  },
};
