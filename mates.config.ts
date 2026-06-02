/**
 * mates-fullstack — example-app
 *
 * No configuration needed. The framework auto-detects all paths
 * from the folder structure:
 *
 *   client/pages/      ← SSR pages
 *   client/client.ts   ← browser entry point
 *   server/api/        ← RPC functions
 *   server/rest/       ← raw HTTP handlers
 *   server/socket/     ← WebSocket handlers
 *   server/helpers/    ← server-only utilities
 *   server/main.ts     ← per-request middleware
 *   shared/types/      ← shared TypeScript types
 *   public/            ← static assets
 *
 * Environment variables:
 *   PORT=3000          ← HTTP port (default: 3000)
 *   API_DOCS=true      ← expose /api/docs in production
 *   MATES_PUBLIC_*     ← client-safe env vars
 */
