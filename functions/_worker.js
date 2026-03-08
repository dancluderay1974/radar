export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    // Let static files go through normally
    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
      return new Response(null, { status: 404 })
    }

    // Everything else goes to Next.js
    return env.ASSETS.fetch(request)
  },
}
