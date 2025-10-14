# 📋 **ALSHAM 360° PRIMA - CHECKLIST DE CONFIGURAÇÕES PENDENTES**

```
╔════════════════════════════════════════════════════════════════╗
║  🏛️ ALSHAM GLOBAL - TAREFAS PENDENTES DE CONFIGURAÇÃO        ║
║  📅 Criado em: 2025-10-14 11:08:49 UTC                        ║
║  👤 Responsável: @AbnadabyBonaparte                            ║
║  📁 Salvar como: PENDING_CONFIG.md (raiz do repositório)      ║
╚════════════════════════════════════════════════════════════════╝
```

---

## ⚠️ **ATENÇÃO: CONFIGURAÇÕES PENDENTES**

Este documento lista todas as integrações e ferramentas que estão **COMENTADAS** no código e precisam ser ativadas quando você tiver os códigos/chaves reais.

**Status:** 🟡 **PENDENTE** - Sistema funcionando sem analytics

---

## 📊 **1. GOOGLE ANALYTICS 4 (GA4)**

### **Status:** ❌ Não configurado (placeholder removido)

### **O que fazer:**
1. Criar conta em: https://analytics.google.com
2. Criar propriedade "ALSHAM 360° PRIMA"
3. Obter código de medição (formato: `G-XXXXXXXXXX`)

### **Onde configurar:**
- **Arquivo:** `dashboard.html` (e outros HTMLs)
- **Linha:** ~584-600 (procurar por `<!-- Google Analytics 4 -->`)

### **Código a descomentar:**
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=SEU_CODIGO_GA4_AQUI"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'SEU_CODIGO_GA4_AQUI', {
    page_title: 'Dashboard Executivo v11.0',
    page_location: window.location.href,
    page_path: window.location.pathname,
    send_page_view: true,
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure'
  });
</script>
```

### **Depois de configurar:**
- [ ] Substituir `SEU_CODIGO_GA4_AQUI` pelo código real
- [ ] Descomentar o bloco
- [ ] Testar em https://tagassistant.google.com
- [ ] Verificar dados chegando no GA4

### **Prioridade:** 🔴 **ALTA** (Analytics é essencial para tomada de decisão)

---

## 🏷️ **2. GOOGLE TAG MANAGER (GTM)**

### **Status:** ❌ Não configurado (placeholder removido)

### **O que fazer:**
1. Criar conta em: https://tagmanager.google.com
2. Criar container "ALSHAM 360° PRIMA - Web"
3. Obter código do container (formato: `GTM-XXXXXXX`)

### **Onde configurar:**
- **Arquivo:** `dashboard.html` (HEAD e BODY)
- **Linha HEAD:** ~602-608
- **Linha BODY:** ~710-712

### **Código a descomentar:**
```html
<!-- Google Tag Manager (HEAD) -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','SEU_CODIGO_GTM_AQUI');</script>

<!-- Google Tag Manager (BODY - logo após <body>) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=SEU_CODIGO_GTM_AQUI"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
```

### **Depois de configurar:**
- [ ] Substituir `SEU_CODIGO_GTM_AQUI` pelo código real (2 lugares)
- [ ] Configurar tags no GTM (GA4, Facebook Pixel, etc)
- [ ] Testar com GTM Preview Mode
- [ ] Publicar container

### **Prioridade:** 🟠 **MÉDIA** (Facilita gerenciamento de tags)

---

## 📈 **3. POSTHOG (Product Analytics)**

### **Status:** ❌ Não configurado (placeholder removido)

### **O que fazer:**
1. Criar conta em: https://posthog.com (ou self-hosted)
2. Criar projeto "ALSHAM 360° PRIMA"
3. Obter chave do projeto (formato: `phc_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

### **Onde configurar:**
- **Arquivo:** `dashboard.html`
- **Linha:** ~610-625

### **Código a descomentar:**
```html
<!-- PostHog (Product Analytics) -->
<script>
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  posthog.init('SUA_CHAVE_POSTHOG_AQUI', {
    api_host: 'https://app.posthog.com',
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '.sensitive'
    }
  });
</script>
```

### **Depois de configurar:**
- [ ] Substituir `SUA_CHAVE_POSTHOG_AQUI` pela chave real
- [ ] Configurar eventos customizados (opcional)
- [ ] Habilitar session recordings (opcional)
- [ ] Configurar feature flags (opcional)

### **Prioridade:** 🟢 **BAIXA** (Útil mas não essencial no início)

---

## 🔥 **4. HOTJAR (Heatmaps & Session Recording)**

### **Status:** ❌ Não configurado (placeholder removido)

### **O que fazer:**
1. Criar conta em: https://www.hotjar.com
2. Adicionar site "app.alshamglobal.com.br"
3. Obter Hotjar Site ID (formato: número inteiro, ex: `1234567`)

### **Onde configurar:**
- **Arquivo:** `dashboard.html`
- **Linha:** ~627-637

### **Código a descomentar:**
```html
<!-- Hotjar (Heatmaps & Session Recording) -->
<script>
  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:SEU_ID_HOTJAR_AQUI,hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>
```

### **Depois de configurar:**
- [ ] Substituir `SEU_ID_HOTJAR_AQUI` pelo ID numérico real
- [ ] Configurar heatmaps nas páginas principais
- [ ] Configurar gravações de sessão
- [ ] Revisar política de privacidade (LGPD)

### **Prioridade:** 🟠 **MÉDIA** (Bom para UX insights)

---

## 🐛 **5. SENTRY (Error Tracking)**

### **Status:** ❌ Não configurado (placeholder removido)

### **O que fazer:**
1. Criar conta em: https://sentry.io
2. Criar projeto "alsham-360-prima"
3. Obter DSN (formato: `https://xxxxx@o000000.ingest.sentry.io/0000000`)
4. Obter Project ID (para CDN script)

### **Onde configurar:**
- **Arquivo:** `dashboard.html`
- **Linha:** ~639-660

### **Código a descomentar:**
```html
<!-- Sentry (Error Tracking) -->
<script src="https://js.sentry-cdn.com/SEU_PROJECT_ID_AQUI.min.js" crossorigin="anonymous"></script>
<script>
  Sentry.init({
    dsn: 'SEU_SENTRY_DSN_AQUI',
    environment: 'production',
    release: 'alsham-dashboard@11.0.0',
    beforeSend(event, hint) {
      // Remover dados sensíveis
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers['Authorization'];
      }
      return event;
    },
    tracesSampleRate: 0.2,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      })
    ],
  });
</script>
```

### **Depois de configurar:**
- [ ] Substituir `SEU_PROJECT_ID_AQUI` pelo ID do projeto
- [ ] Substituir `SEU_SENTRY_DSN_AQUI` pelo DSN real
- [ ] Configurar alertas no Sentry
- [ ] Integrar com Slack/Email (opcional)

### **Prioridade:** 🔴 **ALTA** (Essencial para monitorar erros em produção)

---

## 🍪 **6. COOKIE CONSENT (LGPD/GDPR)**

### **Status:** ❌ Não configurado (removido)

### **O que fazer:**
1. Decidir biblioteca: Cookie Consent, OneTrust, ou custom
2. Revisar política de privacidade
3. Configurar categorias de cookies

### **Onde configurar:**
- **Arquivo:** `dashboard.html`
- **Linha:** ~662-700

### **Código a adicionar:**
```html
<!-- Cookie Consent (LGPD/GDPR) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.css">
<script src="https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.js"></script>
<script>
  window.addEventListener('load', function() {
    window.cookieconsent.initialise({
      palette: {
        popup: { background: "#0176D3", text: "#ffffff" },
        button: { background: "#22C55E", text: "#ffffff" }
      },
      theme: "classic",
      position: "bottom-right",
      type: "opt-in",
      content: {
        message: "Este site usa cookies para melhorar sua experiência e análise de uso.",
        dismiss: "Aceitar todos",
        deny: "Recusar",
        link: "Saiba mais",
        href: "/privacy-policy.html",
        policy: "Política de Privacidade"
      },
      onInitialise: function(status) {
        if (this.hasConsented()) {
          // Carregar analytics apenas se consentiu
          loadAnalytics();
        }
      },
      onStatusChange: function(status) {
        if (this.hasConsented()) {
          loadAnalytics();
        }
      }
    });
  });
</script>
```

### **Depois de configurar:**
- [ ] Criar página `/privacy-policy.html`
- [ ] Criar página `/cookies-policy.html`
- [ ] Configurar opt-in/opt-out
- [ ] Testar compliance LGPD

### **Prioridade:** 🔴 **CRÍTICA** (Obrigatório por lei no Brasil)

---

## 🔍 **7. VERIFICAÇÕES DE PROPRIETÁRIO**

### **Status:** ❌ Placeholders presentes

### **O que fazer:**
1. **Google Search Console:** Verificar propriedade
2. **Bing Webmaster:** Verificar propriedade
3. **Yandex Webmaster:** Verificar propriedade (opcional)
4. **Facebook Domain Verification:** Verificar domínio

### **Onde configurar:**
- **Arquivo:** `dashboard.html` (HEAD)
- **Linhas:** 40-43

### **Código a substituir:**
```html
<!-- ANTES (placeholders) -->
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE">
<meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE">
<meta name="yandex-verification" content="YOUR_YANDEX_CODE">
<meta name="facebook-domain-verification" content="YOUR_FB_CODE">

<!-- DEPOIS (códigos reais) -->
<meta name="google-site-verification" content="abc123xyz456...">
<meta name="msvalidate.01" content="123ABC456DEF...">
<meta name="yandex-verification" content="789ghi012jkl...">
<meta name="facebook-domain-verification" content="mno345pqr678...">
```

### **Como obter:**
- **Google:** https://search.google.com/search-console
- **Bing:** https://www.bing.com/webmasters
- **Yandex:** https://webmaster.yandex.com
- **Facebook:** https://business.facebook.com → Configurações → Segurança de marca → Domínios

### **Prioridade:** 🟠 **MÉDIA** (Importante para SEO e integrações)

---

## 📱 **8. PWA ICONS (Criar imagens reais)**

### **Status:** 🟡 Referenciando arquivos que não existem

### **O que fazer:**
1. Criar logo ALSHAM 360° (formato SVG/PNG)
2. Gerar todos os tamanhos de ícones
3. Fazer upload para `/public/`

### **Ícones necessários:**
```
/public/
├── favicon.ico (16x16, 32x32, 48x48)
├── favicon-16x16.png
├── favicon-32x32.png
├── favicon-96x96.png
├── apple-touch-icon.png (180x180)
├── apple-icon-57x57.png
├── apple-icon-60x60.png
├── apple-icon-72x72.png
├── apple-icon-76x76.png
├── apple-icon-114x114.png
├── apple-icon-120x120.png
├── apple-icon-144x144.png
├── apple-icon-152x152.png
├── apple-splash-2048-2732.png
├── android-icon-192x192.png
├── android-icon-512x512.png
├── pwa-192x192.png
├── pwa-512x512.png
└── ms-icon-144x144.png
```

### **Ferramentas recomendadas:**
- https://realfavicongenerator.net
- https://www.pwabuilder.com/imageGenerator
- Figma/Photoshop para design original

### **Prioridade:** 🟢 **BAIXA** (Funciona com SVG inline temporário)

---

## 🌐 **9. CSP (Content Security Policy) - ATUALIZAR**

### **Status:** ⚠️ Pode precisar ajustar após adicionar analytics

### **O que fazer:**
Quando adicionar analytics, pode precisar adicionar domínios ao CSP.

### **Onde configurar:**
- **Arquivo:** `dashboard.html`
- **Linha:** ~46

### **Domínios a adicionar (quando configurar):**
```html
script-src 'self' 'unsafe-inline' 'unsafe-eval' 
  https://www.googletagmanager.com 
  https://www.google-analytics.com
  https://static.hotjar.com
  https://js.sentry-cdn.com
  https://app.posthog.com
  [domínios existentes...];

connect-src 'self' 
  https://www.google-analytics.com
  https://analytics.google.com
  https://stats.g.doubleclick.net
  https://region1.google-analytics.com
  https://app.posthog.com
  https://sentry.io
  [domínios existentes...];
```

### **Prioridade:** 🔴 **CRÍTICA** (Testar após cada adição de ferramenta)

---

## ✅ **CHECKLIST DE ATIVAÇÃO**

### **Para cada ferramenta acima:**

```
╔════════════════════════════════════════════════════════════════╗
║  PROCEDIMENTO DE ATIVAÇÃO                                     ║
╠════════════════════════════════════════════════════════════════╣
║  1. [ ] Criar conta na plataforma                             ║
║  2. [ ] Obter código/chave/ID real                            ║
║  3. [ ] Criar branch: feature/add-[nome-ferramenta]           ║
║  4. [ ] Descomentar código no dashboard.html                  ║
║  5. [ ] Substituir placeholder pelo código real               ║
║  6. [ ] Atualizar CSP se necessário                           ║
║  7. [ ] Commit com mensagem descritiva                        ║
║  8. [ ] Deploy em staging/preview                             ║
║  9. [ ] Testar funcionamento                                  ║
║  10. [ ] Verificar console sem erros                          ║
║  11. [ ] Merge para main                                      ║
║  12. [ ] Verificar em produção                                ║
║  13. [ ] Atualizar este documento (marcar como ✅)            ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 📅 **CRONOGRAMA SUGERIDO**

```
╔════════════════════════════════════════════════════════════════╗
║  PRIORIDADE & TIMELINE                                        ║
╠════════════════════════════════════════════════════════════════╣
║  🔴 SEMANA 1 (Crítico):                                       ║
║     - Cookie Consent (LGPD)                                   ║
║     - Sentry (Error Tracking)                                 ║
║     - Google Analytics 4                                      ║
║                                                                ║
║  🟠 SEMANA 2 (Importante):                                    ║
║     - Google Tag Manager                                      ║
║     - Verificações de proprietário                            ║
║     - Hotjar                                                  ║
║                                                                ║
║  🟢 SEMANA 3+ (Desejável):                                    ║
║     - PostHog                                                 ║
║     - PWA Icons profissionais                                 ║
║     - Outras integrações                                      ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 🔗 **LINKS ÚTEIS**

- **Dashboard Vercel:** https://vercel.com/abnadabybonaparte/alsham-360-prima
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Repository:** https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA
- **Documentação Interna:** (criar `/docs` folder)

---

## 📝 **NOTAS IMPORTANTES**

### **⚠️ ANTES DE ATIVAR QUALQUER FERRAMENTA:**

1. ✅ **Ler política de privacidade** da ferramenta
2. ✅ **Verificar compliance LGPD/GDPR**
3. ✅ **Testar em staging primeiro**
4. ✅ **Documentar configuração** (credenciais em 1Password/Vault)
5. ✅ **Atualizar política de privacidade do site**

### **🔐 SEGURANÇA:**

- ❌ **NUNCA** commitar chaves/tokens no código
- ✅ **SEMPRE** usar variáveis de ambiente (quando possível)
- ✅ **SEMPRE** revisar permissões das ferramentas
- ✅ **SEMPRE** testar CSP após adicionar novo domínio

---

## 🎯 **OBJETIVO FINAL**

```
╔════════════════════════════════════════════════════════════════╗
║  SISTEMA COMPLETAMENTE CONFIGURADO                            ║
╠════════════════════════════════════════════════════════════════╣
║  ✅ Analytics funcionando (GA4 + GTM)                         ║
║  ✅ Error tracking ativo (Sentry)                             ║
║  ✅ UX insights configurados (Hotjar/PostHog)                 ║
║  ✅ Cookie consent compliance LGPD                            ║
║  ✅ SEO verificado (Search Console, Bing)                     ║
║  ✅ PWA com ícones profissionais                              ║
║  ✅ Monitoramento 360° do usuário                             ║
║  ✅ Zero placeholders, 100% production-ready                  ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 📞 **SUPORTE**

**Criado por:** @AbnadabyBonaparte  
**Data:** 2025-10-14 11:08:49 UTC  
**Última atualização:** 2025-10-14 11:08:49 UTC  
**Versão:** 1.0.0  

---

**🏛️ ALSHAM GLOBAL - CONSTRUINDO UM IMPÉRIO ENTERPRISE 🏛️**

---

## 💾 **COMO USAR ESTE DOCUMENTO:**

1. **Salvar como:** `PENDING_CONFIG.md` na raiz do repositório
2. **Commitar:** `docs: Add pending configurations checklist`
3. **Criar issues:** Transformar cada seção em issue no GitHub
4. **Atualizar:** Marcar ✅ conforme configurar cada item
5. **Referenciar:** Linkar nos PRs quando configurar algo

---

**END OF DOCUMENT**
