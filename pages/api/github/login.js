/**
 * GitHub OAuth Login API Route (Next.js)
 * --------------------------------------
 * Route: /api/github/login
 *
 * Purpose:
 * - Starts the OAuth authorization flow for GitHub sign-in.
 * - Redirects users to GitHub's consent page using this app's configured client ID.
 *
 * Why this is implemented as a Next.js API route:
 * - The project is deployed on Cloudflare Pages, but the OAuth flow should be handled by
 *   the Next.js runtime layer (not Cloudflare Pages Functions in /functions).
 * - Keeping this in /pages/api ensures compatibility with Next.js API route conventions.
 */

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
 * Next.js API handler for GET /api/github/login.
 *
 * Flow stages:
 * 1) Validate required environment variable(s).
 * 2) Build the GitHub authorize URL.
 * 3) Redirect user to GitHub OAuth.
 */
export default function handler(req, res) {
  // Stage 1: Ensure GITHUB_ID is available before starting OAuth flow.
  const clientId = process.env.GITHUB_ID;

  if (!clientId) {
    return res.status(500).json({
      error: 'Missing required environment variable: GITHUB_ID',
    });
  }

  // Stage 2: Construct the authorize URL with the required parameters.
  const authorizeUrl = new URL(GITHUB_AUTHORIZE_URL);
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', GITHUB_CALLBACK_URL);

  // Stage 3: Redirect the user agent to GitHub's OAuth authorization endpoint.
  return res.redirect(302, authorizeUrl.toString());
}
