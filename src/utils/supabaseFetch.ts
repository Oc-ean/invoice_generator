// utils/supabaseFetch.ts
import { supabase, isAuthError } from '@/config/supabase'

export async function supabaseFetch<T>(
  request: () => Promise<{ data: T | null; error: any }>,
  options: {
    retry?: boolean
    maxRetries?: number
    redirectToLogin?: boolean
  } = { retry: true, maxRetries: 2, redirectToLogin: true }
): Promise<{ data: T | null; error: any }> {
  let retries = 0
  const maxRetries = options.maxRetries ?? 2

  while (retries <= maxRetries) {
    try {
      const result = await request()

      if (!result.error) return result

      if (isAuthError(result.error)) {
        console.warn(
          `Auth error detected (attempt ${retries + 1}/${maxRetries + 1})`
        )

        const { data, error: refreshError } =
          await supabase.auth.refreshSession()

        if (!refreshError && data.session) {
          if (options.retry && retries < maxRetries) {
            retries++
            await new Promise((r) => setTimeout(r, 500))
            continue
          }
        }

        if (options.redirectToLogin) {
          await supabase.auth.signOut()
          window.location.href = '/login?expired=true'
        }

        return { data: null, error: result.error }
      }

      return result
    } catch (err) {
      if (retries < maxRetries) {
        retries++
        await new Promise((r) =>
          setTimeout(r, 1000 * Math.pow(2, retries - 1))
        )
        continue
      }

      return { data: null, error: err }
    }
  }

  return { data: null, error: new Error('Max retries exceeded') }
}