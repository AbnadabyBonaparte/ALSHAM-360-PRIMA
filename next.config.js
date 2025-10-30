// next.config.js
/**
 * ALSHAM 360° PRIMA
 * Configuração de segurança e headers para Vercel e PostHog
 */

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval'
        https://cdn.jsdelivr.net
        https://unpkg.com
        https://apis.google.com
        https://accounts.google.com
        https://www.gstatic.com
        https://cdn.posthog.com
        https://us-assets.i.posthog.com
        https://vercel.live;
      connect-src 'self' https://app.posthog.com https://*.vercel.app;
      img-src 'self' data: https:;
      style-src 'self' 'unsafe-inline' https:;
      frame-src https://vercel.live;
    `.replace(/\s{2,}/g, ' ').trim(),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
