const COOKIE_NAME = "jcoldren_access";
const ACCESS_MESSAGE = "jcoldren-work-access-v1";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/logout") {
      return redirectWithCookie("/", `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
    }

    if (await isAuthorized(request, env)) {
      return env.ASSETS.fetch(request);
    }

    if (request.method === "POST") {
      const form = await request.formData();
      const password = String(form.get("password") || "");
      const next = safeNextPath(String(form.get("next") || "/"));

      if (env.PORTFOLIO_PASSWORD && password === env.PORTFOLIO_PASSWORD) {
        const token = await accessToken(env);
        return redirectWithCookie(next, `${COOKIE_NAME}=${token}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax`);
      }

      return passwordPage(next, true, 401);
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Unauthorized", { status: 401 });
    }

    return passwordPage(url.pathname + url.search, false, 401);
  },
};

async function isAuthorized(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;
  const expected = await accessToken(env);
  return timingSafeEqual(match[1], expected);
}

async function accessToken(env) {
  const secret = env.ACCESS_COOKIE_SECRET || env.PORTFOLIO_PASSWORD || "portfolio";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(ACCESS_MESSAGE));
  return base64Url(signature);
}

function base64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function safeNextPath(next) {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function redirectWithCookie(location, cookie) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: location,
      "Set-Cookie": cookie,
      "Cache-Control": "no-store",
    },
  });
}

function passwordPage(next, failed, status) {
  const escapedNext = escapeHtml(safeNextPath(next));
  const error = failed ? '<p class="error">Password did not match. Try again.</p>' : "";

  return new Response(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>J.C. Archive | Access</title>
    <style>
      :root {
        --ink: #0b0b0b;
        --paper: #f7f6ef;
        --white: #ffffff;
        --yellow: #f5d400;
        --muted: #68645c;
        font-family: Arial, Helvetica, sans-serif;
      }
      * { box-sizing: border-box; }
      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        background-color: var(--paper);
        background-image:
          linear-gradient(rgba(11, 11, 11, 0.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(11, 11, 11, 0.035) 1px, transparent 1px);
        background-size: 64px 64px, 64px 64px;
        color: var(--ink);
      }
      main {
        width: min(720px, calc(100% - 28px));
        border: 1px solid var(--ink);
        background: rgba(255, 255, 255, 0.78);
      }
      header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding: 16px 18px;
        border-bottom: 1px solid var(--ink);
        color: var(--muted);
        font-family: "Arial Narrow", Arial, Helvetica, sans-serif;
        font-size: 12px;
        text-transform: uppercase;
      }
      section { padding: clamp(28px, 7vw, 58px); }
      p { margin: 0; }
      h1 {
        margin: 12px 0 22px;
        font-size: clamp(48px, 12vw, 108px);
        line-height: 0.86;
        letter-spacing: 0;
      }
      label {
        display: grid;
        gap: 8px;
        color: var(--muted);
        font-family: "Arial Narrow", Arial, Helvetica, sans-serif;
        font-size: 12px;
        text-transform: uppercase;
      }
      input {
        width: 100%;
        height: 48px;
        border: 1px solid var(--ink);
        border-radius: 0;
        padding: 10px 12px;
        background: var(--white);
        color: var(--ink);
        font: inherit;
      }
      button {
        min-height: 44px;
        margin-top: 12px;
        padding: 11px 16px;
        border: 1px solid var(--ink);
        background: var(--ink);
        color: var(--white);
        font: inherit;
        font-size: 12px;
        text-transform: uppercase;
        cursor: pointer;
      }
      .error {
        margin-bottom: 14px;
        color: #d3312d;
        font-weight: 800;
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <span>J.C. Archive</span>
        <span>Private Access</span>
      </header>
      <section>
        <p>Enter password to view</p>
        <h1>Learning Archive</h1>
        ${error}
        <form method="post">
          <input type="hidden" name="next" value="${escapedNext}">
          <label>
            Password
            <input name="password" type="password" inputmode="numeric" autocomplete="current-password" autofocus required>
          </label>
          <button type="submit">Enter Archive</button>
        </form>
      </section>
    </main>
  </body>
</html>`, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
