/**
 * Worker entrypoint for Cloudflare deployments.
 *
 * Why this file exists:
 * - Cloudflare's `wrangler versions upload` requires an explicit Worker script entrypoint
 *   (or configured assets directory) to package and upload.
 * - The previous CI failure happened because no entrypoint was configured.
 *
 * Stage overview:
 * 1) Receive requests at the edge.
 * 2) Return a lightweight diagnostic response that confirms deployment succeeded.
 */

/**
 * Cloudflare Worker `fetch` handler.
 *
 * @param request Incoming request from Cloudflare edge.
 * @returns A basic text response proving the worker was deployed and is reachable.
 */
export default {
  async fetch(request: Request): Promise<Response> {
    // Stage 1: Parse request URL for optional metadata in the response.
    const url = new URL(request.url)

    // Stage 2: Return a deterministic response so health checks can validate deployment.
    return new Response(`radar worker is running at path: ${url.pathname}`, {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    })
  },
}
