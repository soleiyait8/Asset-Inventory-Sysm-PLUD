// Username login for the Asset Register (deployed as the "username-login" Edge Function).
// Looks up a staff member's email by username (server-side only, never returned
// to the browser), then signs in with Supabase Auth and returns the session.
// verify_jwt is off because callers are not signed in yet; the password check
// below is the authentication.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

const USERNAME_RE = /^[a-z0-9._-]{2,40}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "bad_request" }, 400); }

  const action = String(body.action ?? "");
  const username = String(body.username ?? "").trim().toLowerCase();
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const anon = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

  async function emailFor(u: string): Promise<string | null> {
    if (!USERNAME_RE.test(u)) return null;
    const { data } = await admin.from("staff").select("email").eq("username", u).maybeSingle();
    return data?.email ?? null;
  }

  if (action === "login") {
    const password = String(body.password ?? "");
    const email = await emailFor(username);
    if (!email || !password) { await pause(400); return json({ error: "invalid_credentials" }, 401); }
    const { data, error } = await anon.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.status === 429) return json({ error: "rate_limited" }, 429);
      if (/not confirmed/i.test(error.message)) return json({ error: "not_confirmed" }, 401);
      return json({ error: "invalid_credentials" }, 401);
    }
    return json({ access_token: data.session!.access_token, refresh_token: data.session!.refresh_token });
  }

  if (action === "reset") {
    const redirectTo = typeof body.redirectTo === "string" ? body.redirectTo : undefined;
    const email = await emailFor(username);
    if (email) {
      const { error } = await anon.auth.resetPasswordForEmail(email, { redirectTo });
      if (error && error.status === 429) return json({ error: "rate_limited" }, 429);
    } else {
      await pause(400);
    }
    // Same answer whether or not the username exists, so usernames can't be probed.
    return json({ ok: true });
  }

  return json({ error: "bad_request" }, 400);
});
