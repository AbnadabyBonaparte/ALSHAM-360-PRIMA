import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(20, 'VITE_SUPABASE_ANON_KEY is required'),
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_GA_MEASUREMENT_ID: z.string().optional(),
  VITE_POSTHOG_KEY: z.string().optional(),
  MODE: z.string().default('production'),
  DEV: z.boolean().default(false),
  PROD: z.boolean().default(true),
})

function parseEnv() {
  const raw = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    VITE_GA_MEASUREMENT_ID: import.meta.env.VITE_GA_MEASUREMENT_ID,
    VITE_POSTHOG_KEY: import.meta.env.VITE_POSTHOG_KEY,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  }

  const result = envSchema.safeParse(raw)

  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    // Do NOT throw at module load — that blanks the entire app before it renders.
    // Warn and fall back to valid placeholders so the app boots in a degraded state
    // (Supabase-backed features stay disabled until real keys are configured).
    console.warn(
      `[env] Missing/invalid environment variables — running in degraded mode:\n${formatted}`
    )
    return {
      VITE_SUPABASE_URL: raw.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
      VITE_SUPABASE_ANON_KEY: raw.VITE_SUPABASE_ANON_KEY || 'placeholder-key',
      VITE_SENTRY_DSN: undefined,
      VITE_GA_MEASUREMENT_ID: raw.VITE_GA_MEASUREMENT_ID,
      VITE_POSTHOG_KEY: raw.VITE_POSTHOG_KEY,
      MODE: raw.MODE ?? 'production',
      DEV: raw.DEV ?? false,
      PROD: raw.PROD ?? true,
    }
  }

  return result.data
}

export const env = parseEnv()
