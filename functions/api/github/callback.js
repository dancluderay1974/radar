/**
 * GitHub OAuth Callback Endpoint (Cloudflare Pages Function)
 * ----------------------------------------------------------
 * Route: /api/github/callback
 *
 * Purpose:
 * - Receives the temporary authorization "code" from GitHub.
 * - Exchanges that code for an access token via GitHub's token endpoint.
 * - Returns JSON containing the access token OR redirects to /app for browser login flow.
 *
 * Runtime compatibility:
 * - Cloudflare Workers / Pages Functions runtime.
 */

/**
 * Handles incoming requests for /api/github/callback.
 *
 * Flow stages:
 * 1) Validate required environment configuration.
 * 2) Read and validate the "code" query parameter.
 * 3) Exchange the code for an access token (POST to GitHub with Accept: application/json).
 * 4) Return JSON for API-style requests, or redirect browser users to /app.
 */
export async function onRequest(context) {
  const { request, env } = context;

  // Stage 1: Read and validate required environment variable(s).
  const clientId = env.GITHUB_ID;
  const clientSecret = env.GITHUB_SECRET;

  if (!clientId || !clientSecret) {
    return jsonResponse(
      {
        error: 'Missing required environment variables: GITHUB_ID and/or GITHUB_SECRET',
      },
      500,
    );
  }

  // Stage 2: Extract and validate the authorization code from the callback URL.
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return jsonResponse({ error: 'Missing required query parameter: code' }, 400);
  }

  // Stage 3: Exchange authorization code for an access token.
  const tokenRequestBody = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
  });

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      // Required by GitHub to request JSON response format.
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenRequestBody.toString(),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || tokenData.error) {
    return jsonResponse(
      {
        error: tokenData.error || 'Failed to exchange code for access token',
        error_description: tokenData.error_description,
      },
      400,
    );
  }

  // Stage 4: Successful authentication flow.
  // - For API clients requesting JSON (or explicit `format=json`), return the token payload.
  // - For browser-driven login flow, redirect to /app.
  const wantsJson =
    request.headers.get('accept')?.includes('application/json') ||
    url.searchParams.get('format') === 'json';

  if (wantsJson) {
    return jsonResponse({ access_token: tokenData.access_token, token_type: tokenData.token_type });
  }

  return Response.redirect(new URL('/app', url.origin).toString(), 302);
}

/**
 * Helper: JSON response utility.
 *
 * Why this exists:
 * - Keeps response shape and headers consistent.
 * - Improves readability by centralizing repetitive response construction.
 */
function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
