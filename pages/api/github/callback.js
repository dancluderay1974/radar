/**
 * GitHub OAuth Callback API Route (Edge Runtime)
 * ----------------------------------------------
 * Route: /api/github/callback
 *
 * Purpose:
 * - Receives the temporary `code` value from GitHub after user authorization.
 * - Exchanges `code` for an access token by calling GitHub's token endpoint.
 * - Returns GitHub's token payload as JSON.
 *
 * Why Edge runtime is required:
 * - Cloudflare Pages + @cloudflare/next-on-pages require every non-static route to be
 *   explicitly configured for the Edge runtime.
 * - This export allows Cloudflare's Next adapter to include this endpoint in the Pages
 *   build output instead of failing deployment.
 */

/**
 * Stage 0: Declare Next.js route runtime configuration.
 *
 * Why this stage exists:
 * - Cloudflare build validation checks API routes for explicit Edge runtime support.
 */
export const config = {
  runtime: 'edge',
};

/**
 * Stage 1: Define endpoint constants.
 *
 * Why constants:
 * - Makes external dependencies explicit.
 * - Avoids duplicated literal strings across the handler.
 */
const GITHUB_ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';

/**
 * Edge API handler for GET /api/github/callback.
 *
 * Flow stages:
 * 1) Read and validate required query parameters and environment variables.
 * 2) Exchange authorization code for access token.
 * 3) Return token response JSON to the caller.
 */
export default async function handler(request) {
  // Stage 1: Parse callback query parameter and read required app credentials.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const clientId = process.env.GITHUB_ID;
  const clientSecret = process.env.GITHUB_SECRET;

  if (!code) {
    return new Response(
      JSON.stringify({
        error: 'Missing required query parameter: code',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  if (!clientId || !clientSecret) {
    return new Response(
      JSON.stringify({
        error: 'Missing required environment variables: GITHUB_ID and/or GITHUB_SECRET',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  // Stage 2: Build and send POST request to GitHub token endpoint.
  // Accept: application/json ensures GitHub responds with JSON instead of URL-encoded text.
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
  });

  const tokenResponse = await fetch(GITHUB_ACCESS_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const tokenData = await tokenResponse.json();

  // Stage 3: Return GitHub token payload as JSON.
  // We preserve GitHub's status semantics by surfacing 200 for success and 400 for token errors.
  if (!tokenResponse.ok || tokenData.error) {
    return new Response(JSON.stringify(tokenData), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(tokenData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
