/**
 * GitHub OAuth Login Endpoint (Cloudflare Pages Function)
 * -------------------------------------------------------
 * Route: /api/github/login
 *
 * Purpose:
 * - Starts the OAuth authorization flow by redirecting the user to GitHub.
 * - Uses the GITHUB_ID secret configured in Cloudflare Pages environment variables.
 *
 * Runtime compatibility:
 * - Cloudflare Workers / Pages Functions runtime.
 */

/**
 * Handles incoming requests for /api/github/login.
 *
 * Flow stages:
 * 1) Validate required environment configuration.
 * 2) Build GitHub authorize URL with required query parameters.
 * 3) Redirect the user agent to GitHub's OAuth consent screen.
 */
export async function onRequest(context) {
  // Stage 1: Read and validate required environment variable(s).
  const { env } = context;
  const clientId = env.GITHUB_ID;

  if (!clientId) {
    return new Response(
      JSON.stringify({
        error: 'Missing required environment variable: GITHUB_ID',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    );
  }

  // Stage 2: Build the GitHub OAuth authorization URL.
  // redirect_uri must match the callback URL configured in your GitHub OAuth app.
  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', 'https://e-yar.com/api/github/callback');

  // Stage 3: Redirect user to GitHub to authorize the app.
  return Response.redirect(authorizeUrl.toString(), 302);
}
