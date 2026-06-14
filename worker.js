/**
 * Cloudflare Worker — API-Football proxy for the World Cup 2026 page.
 *
 * Why: API-Football needs a secret key sent in a header. A static GitHub Pages
 * site can't hide that key. This Worker holds the key, adds CORS so your page
 * can call it, and CACHES every response for 60s so all your visitors share a
 * single upstream request — which keeps you well under the free-tier quota.
 *
 * One-time setup (≈5 min):
 *   1. Create a free API-Football account → https://www.api-football.com  (copy your API key)
 *   2. Create a free Cloudflare account → https://dash.cloudflare.com
 *   3. Workers & Pages → Create → Worker → paste this file → Deploy
 *   4. Worker → Settings → Variables → add a SECRET named  API_KEY  = your key
 *   5. Copy the Worker URL (e.g. https://wc2026.yourname.workers.dev)
 *      and paste it into index.html as PROXY_URL.
 *
 * That's it — the key never appears in the public page.
 */

const UPSTREAM = "https://v3.football.api-sports.io";
const ALLOW_PATHS = ["/fixtures", "/fixtures/events", "/standings"];
const CACHE_SECONDS = 60;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") return withCors(new Response(null, { status: 204 }));

    // Only allow the endpoints the page actually uses
    if (!ALLOW_PATHS.includes(url.pathname)) {
      return withCors(new Response(JSON.stringify({ error: "path not allowed" }), { status: 403 }));
    }
    if (!env.API_KEY) {
      return withCors(new Response(JSON.stringify({ error: "API_KEY secret not set on Worker" }), { status: 500 }));
    }

    // Serve from edge cache when possible (dedupes visitors, protects quota)
    const cache = caches.default;
    const cacheKey = new Request(url.toString(), { method: "GET" });
    let cached = await cache.match(cacheKey);
    if (cached) return withCors(cached);

    // Fetch upstream with the secret key
    const upstreamUrl = UPSTREAM + url.pathname + url.search;
    const upstream = await fetch(upstreamUrl, {
      headers: { "x-apisports-key": env.API_KEY },
    });
    const body = await upstream.text();

    const resp = new Response(body, {
      status: upstream.status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "Cache-Control": `public, max-age=${CACHE_SECONDS}`,
      },
    });
    ctx.waitUntil(cache.put(cacheKey, resp.clone()));
    return withCors(resp);
  },
};

function withCors(resp) {
  const h = new Headers(resp.headers);
  h.set("Access-Control-Allow-Origin", "*");
  h.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  h.set("Access-Control-Allow-Headers", "*");
  return new Response(resp.body, { status: resp.status, headers: h });
}
