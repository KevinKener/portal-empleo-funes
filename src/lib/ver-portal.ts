/**
 * "Ver portal" for companies and the Office (decision 2026-10-22): opening
 * the site takes them to their panel, but this link shows the landing as a
 * neighbour sees it, e.g. to check how "Urgente" orders the carousel. The
 * landing reads `?vista=portal` and skips the redirect. Shared by Server and
 * Client Components, so it lives outside the server-only auth helpers.
 */
export const VISTA_PORTAL = "portal"
export const HREF_VER_PORTAL = `/?vista=${VISTA_PORTAL}`
