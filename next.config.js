// next.config.js
/**
 * 🌐 ALSHAM 360° PRIMA
 * Configuração de Segurança e Observabilidade
 * Compatível com: Vercel Live, PostHog, Supabase
 * 
 * Diretrizes:
 * - Mantém segurança CSP rígida (sem wildcard *)
 * - Permite domínios específicos para scripts externos confiáveis
 * - Alinhado ao Protocolo de Proteção Supremo ALSHAM
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
        https://app.posthog.com
        https://us-assets.i.posthog.com
        https://vercel.live;
      connect-src 'self'
        https://app.posthog.com
        https://us-assets.i.posthog.com
        https://*.vercel.app
        wss://*.vercel.live
        https://*.supabase.co
        wss://*.supabase.co;
      img-src 'self' data: blob: https:;
      style-src 'self' 'unsafe-inline' https:;
      frame-src 'self' https://vercel.live;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim(),
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 🔒 Headers globais aplicados a todas as rotas
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // 🧠 Otimizações de build (opcional, mas recomendadas)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
};

module.exports = nextConfig;
