/**
 * Extracts a user-friendly error message from an Axios error.
 *
 * Backend validation errors arrive as pipe-separated field messages:
 *   "campus_code: Uppercase letters only | name: Required"
 * This strips the field name prefix and returns just the human part of the first error.
 */
export function extractApiError(err: unknown, fallback: string): string {
  const apiMsg = (err as any)?.response?.data?.message as string | undefined
  if (!apiMsg) return fallback

  const first = apiMsg.split('|')[0].trim()
  const colonIdx = first.indexOf(':')
  return colonIdx !== -1 ? first.slice(colonIdx + 1).trim() : first
}
