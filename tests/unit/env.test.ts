import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'

describe('env validation schema', () => {
  it('accepts valid env vars', () => {
    const envSchema = z.object({
      VITE_SUPABASE_URL: z.string().url(),
      VITE_SUPABASE_ANON_KEY: z.string().min(20),
    })
    const result = envSchema.safeParse({
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key-1234567890',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid env vars', () => {
    const envSchema = z.object({
      VITE_SUPABASE_URL: z.string().url(),
      VITE_SUPABASE_ANON_KEY: z.string().min(20),
    })
    const result = envSchema.safeParse({
      VITE_SUPABASE_URL: 'not-a-url',
      VITE_SUPABASE_ANON_KEY: 'short',
    })
    expect(result.success).toBe(false)
  })
})
