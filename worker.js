/**
 * Cloudflare Worker — football-data.org proxy for the World Cup 2026 page.
 *
 * Why: football-data.org needs a secret token in a header (X-Auth-Token) and
 * doesn't send CORS headers, so a static GitHub Pages site can't call it directly.
 * This Worker holds the token, adds CORS, and caches responses (~45s) so all your
 * visitors share one upstream request and you stay comfortably inside the free
 * tier's 10 requests/minute.
 *
 * One-time setup (~5 min):
 *   1. Get a FREE token: https://www.football-data.org/client/register  (copy the API token from the email)
 *   2. Create a free Cloudflare account: https://dash.cloudflare.com
 *   3. Workers & Pages → Create → Worker → paste this file → Deploy
 *   4. Worker → Settings → Variables and Secrets → add a SECRET named  API_KEY  = your token
 *   5. Copy the Worker URL (e.g. https://wc2026.yourname.workers.dev)
 *      and paste it into index.html as PROXY_URL.
 *
 * The token never appears in the public page.
 */

const UPSTREAM = "https://api.football-data.org";
const ALLOW_PREFIX = "/v4/";   // only football-data v4 endpoints
const CACHE_SECONDS = 45;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return withCors(new Response(null, { status: 204 }));
    if (!url.pathname.startsWith(ALLOW_PREFIX)) return withCors(json({ error: "path not allowed" }, 403));
    if (!env.API_KEY) return withCors(json({ error: "API_KEY secret not set on Worker" }, 500));

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), { method: "GET" });
    const hit = await cache.match(cacheKey);
    if (hit) return withCors(hit);

    const upstream = await fetch(UPSTREAM + url.pathname + url.search, {
      headers: { "X-Auth-Token": env.API_KEY },
    });
    const body = await upstream.text();
    const resp = new Response(body, {
      status: upstream.status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "Cache-Control": `public, max-age=${CACHE_SECONDS}`,
      },
    });
    if (upstream.ok) ctx.waitUntil(cache.put(cacheKey, resp.clone()));
    return withCors(resp);
  },
};

function json(obj, status) {
  return new Response(JSON.stringify(obj), { status: status || 200, headers: { "content-type": "application/json" } });
}
function withCors(resp) {
  const h = new Headers(resp.headers);
  h.set("Access-Control-Allow-Origin", "*");
  h.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  h.set("Access-Control-Allow-Headers", "*");
  return new Response(resp.body, { status: resp.status, headers: h });
}
