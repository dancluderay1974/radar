import { handlers } from "@/lib/auth"

/**
 * Step 0: Expose NextAuth handlers under the App Router API convention.
 * Why: The OAuth flow is already configured in `lib/auth.ts`; this file simply wires
 * Next.js route verbs to that centralized auth configuration.
 */
export const { GET, POST } = handlers
