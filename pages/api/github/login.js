/**
 * GitHub OAuth Login API Route (Edge Runtime)
 * -------------------------------------------
 * Route: /api/github/login
 *
 * Purpose:
 * - Starts the OAuth authorization flow for GitHub sign-in.
 * - Redirects users to GitHub's consent page using this app's configured client ID.
 *
 * Why Edge runtime is required:
 * - Cloudflare Pages + @cloudflare/next-on-pages require all non-static routes to run
 *   on the Edge runtime.
 * - Exporting this route config ensures the build adapter can generate a compatible
 *   Cloudflare Pages function for this endpoint.
 */

/**
 * Stage 0: Declare Next.js route runtime configuration.
 *
 * Why this stage exists:
 * - Without this export, Cloudflare's build step fails because this API route is treated
 *   as a Node.js runtime route instead of an Edge runtime route.
 */
export const config = {
  runtime: 'edge',
};

/**
 * Stage 1: Define constants used by this route.
 *
 * Why constants:
 * - Centralizes values that must stay stable across environments.
 * - Makes the callback URI explicit and easy to audit.
 */
const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_CALLBACK_URL = 'https://e-yar.com/api/github/callback';

/**
 * Edge API handler for GET /api/github/login.
 *
 * Flow stages:
 * 1) Validate required environment variable(s).
 * 2) Build the GitHub authorize URL.
 * 3) Return a redirect response to GitHub OAuth.
 */
export default function handler() {
  // Stage 1: Ensure GITHUB_ID is available before starting OAuth flow.
  const clientId = process.env.GITHUB_ID;

  if (!clientId) {
    return new Response(
      JSON.stringify({
        error: 'Missing required environment variable: GITHUB_ID',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  // Stage 2: Construct the authorize URL with the required parameters.
  const authorizeUrl = new URL(GITHUB_AUTHORIZE_URL);
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', GITHUB_CALLBACK_URL);

  // Stage 3: Return an HTTP redirect that sends the user agent to GitHub.
  return Response.redirect(authorizeUrl.toString(), 302);
}
