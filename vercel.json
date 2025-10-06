{
  "version": 2,
  "cleanUrls": true,
  "trailingSlash": false,

  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://cdn.tailwindcss.com https://*.supabase.co https://us-assets.i.posthog.com https://app.posthog.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://app.posthog.com https://us-assets.i.posthog.com; img-src 'self' data: blob: https:; worker-src 'self' blob:; object-src 'none'; frame-src 'self'; manifest-src 'self'; base-uri 'self'; form-action 'self';"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), payment=()"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    },

    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },

    {
      "source": "/(.*)\\.(html|js|css|json)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=600"
        }
      ]
    }
  ],

  "rewrites": [
    { "source": "/dashboard", "destination": "/dashboard.html" },
    { "source": "/leads", "destination": "/leads-real.html" },
    { "source": "/pipeline", "destination": "/pipeline.html" },
    { "source": "/gamificacao", "destination": "/gamificacao.html" },
    { "source": "/automacoes", "destination": "/automacoes.html" },
    { "source": "/relatorios", "destination": "/relatorios.html" },
    { "source": "/configuracoes", "destination": "/configuracoes.html" },
    { "source": "/login", "destination": "/login.html" },
    { "source": "/register", "destination": "/register.html" },
    { "source": "/create-org", "destination": "/create-org.html" }
  ]
}
