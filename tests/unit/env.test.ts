import { describe, it, expect } from 'vitest'

describe('env validation', () => {
  it('should export env with required fields', async () => {
    const { env } = await import('@/lib/env')
    expect(env.VITE_SUPABASE_URL).toBeDefined()
    expect(env.VITE_SUPABASE_ANON_KEY).toBeDefined()
    expect(env.MODE).toBeDefined()
  })
})
