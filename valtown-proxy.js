/**
 * Val.town real-time proxy for live World Cup scores.
 *
 * IMPORTANT: this must be an **HTTP val**. In Val.town click  + New → HTTP  (so it
 * scaffolds an HTTP handler and gives you a .web.val.run URL). Then replace the
 * sample code with everything below. A plain "script" val has no URL.
 *
 * Setup (~3 min — sign in with GitHub, no new password):
 *   1. https://www.val.town  → + New → HTTP
 *   2. Select all the sample code and replace it with this whole file.
 *   3. Save. The HTTP endpoint URL (https://<you>-<valname>.web.val.run) now shows at the top.
 *   4. Val → Environment Variables → add  FD_TOKEN  = your football-data token.
 *   5. Copy that .web.val.run URL → put it in index.html as PROXY_URL → commit & push.
 *
 * No TypeScript annotations are used, so it works whether the file is .ts, .tsx, or .js.
 */

export default async function (req) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/+/, ""); // e.g. "v4/competitions/WC/matches"

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });

  if (!path.startsWith("v4/")) {
    return new Response(JSON.stringify({ error: "path not allowed" }), { status: 403, headers: cors() });
  }

  const token = Deno.env.get("FD_TOKEN");
  if (!token) {
    return new Response(JSON.stringify({ error: "FD_TOKEN env var not set" }), { status: 500, headers: cors() });
  }

  const r = await fetch("https://api.football-data.org/" + path + url.search, {
    headers: { "X-Auth-Token": token },
  });
  const body = await r.text();
  return new Response(body, {
    status: r.status,
    headers: { ...cors(), "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=45" },
  });
}

function cors() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "*",
  };
}
