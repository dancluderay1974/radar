/**
 * GitHub OAuth Callback API Route (Next.js)
 * -----------------------------------------
 * Route: /api/github/callback
 *
 * Purpose:
 * - Receives the temporary `code` value from GitHub after user authorization.
 * - Exchanges `code` for an access token by calling GitHub's token endpoint.
 * - Returns GitHub's token payload as JSON.
 *
 * Deployment note:
 * - This route is intentionally implemented under /pages/api so it runs as a Next.js API
 *   route in the deployed application flow.
 */

/**
 * Stage 1: Define endpoint constants.
 *
 * Why constants:
 * - Makes external dependencies explicit.
 * - Avoids duplicated literal strings across the handler.
 */
const GITHUB_ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';

/**
 * Next.js API handler for GET /api/github/callback.
 *
 * Flow stages:
 * 1) Read and validate required query parameters and environment variables.
 * 2) Exchange authorization code for access token.
 * 3) Return token response JSON to the caller.
 */
export default async function handler(req, res) {
  // Stage 1: Read callback query parameter and required app credentials.
  const { code } = req.query;
  const clientId = process.env.GITHUB_ID;
  const clientSecret = process.env.GITHUB_SECRET;

  if (!code) {
    return res.status(400).json({
      error: 'Missing required query parameter: code',
    });
  }

  if (!clientId || !clientSecret) {
    return res.status(500).json({
      error: 'Missing required environment variables: GITHUB_ID and/or GITHUB_SECRET',
    });
  }

  // Stage 2: Build and send POST request to GitHub token endpoint.
  // Accept: application/json ensures GitHub responds with JSON instead of URL-encoded text.
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: Array.isArray(code) ? code[0] : code,
  });

  const tokenResponse = await fetch(GITHUB_ACCESS_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  // Parse JSON payload returned from GitHub and pass it through.
  const tokenData = await tokenResponse.json();

  // Stage 3: Return GitHub token payload as JSON.
  // We preserve GitHub's status semantics by surfacing 200 for success and 400 for token errors.
  if (!tokenResponse.ok || tokenData.error) {
    return res.status(400).json(tokenData);
  }

  return res.status(200).json(tokenData);
}
