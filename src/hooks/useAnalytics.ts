import { env } from '@/lib/env'

type EventParams = Record<string, string | number | boolean>

function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    ;(window as { gtag: (...a: unknown[]) => void }).gtag(...args)
  }
}

let initialized = false

function ensureInit() {
  if (initialized) return
  initialized = true

  const id = env.VITE_GA_MEASUREMENT_ID
  if (!id) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  document.head.appendChild(script)

  gtag('js', new Date())
  gtag('config', id, { send_page_view: false })
}

export function useAnalytics() {
  ensureInit()

  return {
    trackPageView(path: string, title?: string) {
      gtag('event', 'page_view', { page_path: path, page_title: title })
    },

    trackEvent(name: string, params?: EventParams) {
      gtag('event', name, params)
    },

    trackFeatureUsage(feature: string) {
      gtag('event', 'feature_usage', { feature_name: feature })
    },

    trackError(error: string, fatal = false) {
      gtag('event', 'exception', { description: error, fatal })
    },

    identifyUser(userId: string, traits?: EventParams) {
      gtag('set', 'user_properties', { user_id: userId, ...traits })
    },
  }
}
