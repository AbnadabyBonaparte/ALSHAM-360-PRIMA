# 📚 **DOSSIÊ TÉCNICO COMPLETO - ALSHAM 360° PRIMA v6.1.0**

## **Sistema de Gerenciamento de Tema e Arquitetura Frontend**

---

**Projeto:** ALSHAM 360° PRIMA - CRM Enterprise  
**Versão:** 6.1.0 (Solução Híbrida Implementada)  
**Data:** 2025-01-13  
**Responsável:** AbnadabyBonaparte  
**Tipo de Implementação:** Correção Arquitetural + Enterprise Best Practices  

---

## 📋 **ÍNDICE**

1. [Visão Geral do Sistema](#visão-geral)
2. [Arquitetura de Arquivos](#arquitetura)
3. [Sistema de Tema Dark/Light](#tema)
4. [Progressive Web App (PWA)](#pwa)
5. [Sistema de Build e Deploy](#build)
6. [Guia para Desenvolvedores](#dev-guide)
7. [Troubleshooting](#troubleshooting)

---

<a name="visão-geral"></a>
## 1️⃣ **VISÃO GERAL DO SISTEMA**

### **Stack Tecnológica**

```
Frontend:
├── Vite 5.4.20         (Build tool)
├── Vanilla JavaScript  (ES Modules)
├── Tailwind CSS 3.4.14 (Utility-first CSS)
└── Design Tokens       (CSS Custom Properties)

Backend/Infraestrutura:
├── Supabase 2.45.4     (Database + Auth)
├── Node.js 22.x        (Server runtime)
├── Express 4.21.2      (API server)
└── Vercel              (Deploy + CDN)

Testing/CI:
├── Vitest 2.1.4        (Unit tests)
├── Cypress 13.15.0     (E2E tests)
└── GitHub Actions      (CI/CD)
```

### **Princípios de Design**

1. **Single Source of Truth** - Variáveis CSS em um único arquivo
2. **Mobile-First** - Responsivo por padrão
3. **Accessibility (WCAG AAA)** - Suporte a leitores de tela, alto contraste
4. **Progressive Enhancement** - Funciona sem JavaScript
5. **Performance First** - Service Worker, lazy loading, code splitting

---

<a name="arquitetura"></a>
## 2️⃣ **ARQUITETURA DE ARQUIVOS**

### **Estrutura Completa**

```
alsham-360-prima/
│
├── public/                    # Assets estáticos servidos diretamente
│   ├── css/
│   │   ├── tokens.css         ✅ FONTE ÚNICA - Todas as variáveis CSS
│   │   ├── style.css          ✅ Componentes reutilizáveis
│   │   └── dashboard-animations.css  ✅ Animações específicas
│   │
│   ├── assets/
│   │   ├── sounds/            ✅ Feedback sonoro (notificações)
│   │   └── images/
│   │
│   ├── pwa-192x192.png        ✅ Ícone PWA 192x192
│   ├── pwa-512x512.png        ✅ Ícone PWA 512x512
│   ├── apple-touch-icon.png   ✅ Ícone iOS
│   └── favicon.ico            ✅ Favicon
│
├── src/                       # Código-fonte processado pelo Vite
│   ├── js/
│   │   ├── dashboard.js       ✅ Lógica do dashboard
│   │   ├── leads-real.js      ✅ Gerenciamento de leads
│   │   ├── pipeline.js        ✅ Pipeline de vendas
│   │   ├── relatorios.js      ✅ Sistema de relatórios
│   │   └── utils/
│   │       └── notifications.js  ✅ Sistema de toasts
│   │
│   ├── lib/
│   │   └── supabase.js        ✅ Cliente Supabase configurado
│   │
│   └── tests/                 ✅ Testes automatizados
│       ├── theme.test.js
│       └── notifications.test.js
│
├── .github/
│   └── workflows/
│       └── ci.yml             ✅ Pipeline CI/CD
│
├── Root Files:
├── vite.config.js             ✅ Configuração de build
├── tailwind.config.js         ✅ Configuração Tailwind
├── package.json               ✅ Dependências e scripts
├── dashboard.html             ✅ Página principal
├── leads-real.html
├── pipeline.html
└── ... (outros HTMLs)
```

### **⚠️ ARQUIVOS DELETADOS (Não recriar)**

```
❌ public/js/theme-init.js     (Substituído por script inline)
❌ public/css/dark-theme.css   (Consolidado em tokens.css)
```

---

<a name="tema"></a>
## 3️⃣ **SISTEMA DE TEMA DARK/LIGHT**

### **Como Funciona**

#### **3.1. Aplicação do Tema (Load Time)**

**Arquivo:** Inline em cada HTML (dentro do `<head>`)

```html
<script>
  (function() {
    const theme = localStorage.getItem('alsham-theme') || 'light';
    const contrast = localStorage.getItem('alsham-contrast') || 'normal';
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    if (contrast === 'high') {
      document.documentElement.classList.add('high-contrast');
    }
  })();
</script>
```

**Por quê inline?**
- ✅ Executa ANTES do CSS carregar (evita flash de conteúdo)
- ✅ Não depende de arquivo externo
- ✅ Funciona mesmo se JavaScript falhar

---

#### **3.2. Toggle de Tema (User Interaction)**

**Arquivo:** Inline no final do `<body>` de cada HTML

```javascript
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', function() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('alsham-theme', isDark ? 'dark' : 'light');
    
    // Atualizar gráficos se existirem
    if (window.DashboardApp?.updateCharts) {
      window.DashboardApp.updateCharts();
    }
  });
}
```

**Fluxo:**
1. Usuário clica no botão `#theme-toggle`
2. Classe `dark` é adicionada/removida do `<html>`
3. Preferência salva no `localStorage`
4. Gráficos são atualizados (se existirem)

---

#### **3.3. Variáveis CSS (tokens.css)**

**Arquivo:** `public/css/tokens.css`

```css
:root {
  /* Modo Claro (padrão) */
  --alsham-bg-canvas: #F9FAFB;
  --alsham-bg-surface: #FFFFFF;
  --alsham-text-primary: #111827;
  --alsham-text-secondary: #6B7280;
  /* ... mais variáveis ... */
}

html.dark {
  /* Modo Escuro (quando classe 'dark' está ativa) */
  --alsham-bg-canvas: #0F172A;
  --alsham-bg-surface: #1E293B;
  --alsham-text-primary: #F1F5F9;
  --alsham-text-secondary: #94A3B8;
  /* ... mais variáveis ... */
}
```

**Uso em componentes:**

```css
.card {
  background: var(--alsham-bg-surface);
  color: var(--alsham-text-primary);
  /* Cores mudam automaticamente quando .dark é ativado */
}
```

---

### **3.4. Alto Contraste (Acessibilidade)**

**Ativação:**

```javascript
const contrastToggle = document.getElementById('contrast-toggle');
contrastToggle.addEventListener('click', function() {
  const html = document.documentElement;
  const isHighContrast = html.classList.toggle('high-contrast');
  localStorage.setItem('alsham-contrast', isHighContrast ? 'high' : 'normal');
});
```

**CSS Override:**

```css
html.high-contrast {
  --alsham-bg-canvas: #000000;
  --alsham-bg-surface: #1a1a1a;
  --alsham-text-primary: #ffffff;
  --alsham-text-secondary: #cccccc;
}
```

---

<a name="pwa"></a>
## 4️⃣ **PROGRESSIVE WEB APP (PWA)**

### **Configuração**

#### **4.1. Manifest (vite.config.js)**

**Arquivo:** `vite.config.js` (linhas 18-45)

```javascript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: "ALSHAM 360° PRIMA",
    short_name: "ALSHAM360",
    start_url: "/dashboard.html",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#0176D3",
    icons: [
      {
        src: "/pwa-192x192.png",  // ✅ Arquivo real em public/
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/pwa-512x512.png",  // ✅ Arquivo real em public/
        sizes: "512x512",
        type: "image/png"
      }
    ]
  }
})
```

---

#### **4.2. Service Worker (Caching)**

**Estratégia de Cache:**

```javascript
workbox: {
  globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
  runtimeCaching: [
    {
      // API Supabase - Network First
      urlPattern: /^https:\/\/.*\.supabase\.co\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-api',
        expiration: { maxEntries: 50, maxAgeSeconds: 300 }
      }
    },
    {
      // Assets CSS/JS - Stale While Revalidate
      urlPattern: /\.(?:css|js)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'assets-v6.1.0'  // ✅ Versionamento
      }
    }
  ],
  cleanupOutdatedCaches: true  // ✅ Remove cache antigo automaticamente
}
```

**Ciclo de Atualização:**

1. Service Worker detecta nova versão
2. Baixa assets em background
3. Atualiza cache automaticamente
4. Próximo reload usa versão nova

---

<a name="build"></a>
## 5️⃣ **SISTEMA DE BUILD E DEPLOY**

### **Scripts NPM**

**Arquivo:** `package.json`

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",           // Desenvolvimento local
    "build": "vite build",                  // Build de produção
    "preview": "vite preview --host 0.0.0.0", // Preview do build
    "test": "vitest run",                   // Rodar testes
    "test:e2e": "cypress run",              // Testes end-to-end
    "lint": "eslint src --ext .js",         // Linting
    "lint:fix": "eslint src --ext .js --fix" // Auto-fix lint
  }
}
```

---

### **Pipeline de CI/CD**

**Arquivo:** `.github/workflows/ci.yml`

```yaml
name: ALSHAM 360° CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint || echo "Lint warnings encontrados"
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Check bundle size
        run: du -sh dist
```

**Fluxo:**
1. Commit → Push para GitHub
2. GitHub Actions dispara
3. Instala dependências
4. Roda lint + testes
5. Faz build
6. Vercel detecta push → Deploy automático

---

<a name="dev-guide"></a>
## 6️⃣ **GUIA PARA DESENVOLVEDORES**

### **Como Adicionar Novas Páginas**

#### **Passo 1: Criar HTML**

```html
<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  
  <!-- ✅ Theme Init (copiar de dashboard.html) -->
  <script>
    (function() {
      const theme = localStorage.getItem('alsham-theme') || 'light';
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    })();
  </script>
  
  <title>Nova Página — ALSHAM 360° PRIMA</title>
  
  <!-- ✅ CSS (sempre essa ordem) -->
  <link rel="stylesheet" href="/css/tokens.css" />
  <link rel="stylesheet" href="/css/style.css" />
</head>
<body>
  <!-- Seu conteúdo aqui -->
  
  <!-- ✅ Theme Toggle (copiar de dashboard.html) -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const themeToggle = document.getElementById('theme-toggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', function() {
          const html = document.documentElement;
          const isDark = html.classList.toggle('dark');
          localStorage.setItem('alsham-theme', isDark ? 'dark' : 'light');
        });
      }
    });
  </script>
  
  <script type="module" src="/src/js/sua-pagina.js"></script>
</body>
</html>
```

#### **Passo 2: Adicionar ao Vite Config**

```javascript
// vite.config.js
rollupOptions: {
  input: {
    main: './index.html',
    dashboard: './dashboard.html',
    novaPagina: './nova-pagina.html'  // ✅ Adicionar aqui
  }
}
```

---

### **Como Usar Variáveis CSS**

#### **Cores**

```css
.meu-componente {
  background: var(--alsham-bg-surface);
  color: var(--alsham-text-primary);
  border: 1px solid var(--alsham-border-default);
}
```

#### **Espaçamento**

```css
.card {
  padding: var(--alsham-space-6);
  margin-bottom: var(--alsham-space-4);
}
```

#### **Animações**

```css
.botao {
  transition: all var(--alsham-motion-productive) var(--alsham-ease-productive);
}

.botao:hover {
  transform: scale(1.05);
}
```

---

### **Como Adicionar Testes**

#### **Teste Unitário**

**Arquivo:** `src/tests/meu-componente.test.js`

```javascript
import { describe, it, expect } from 'vitest';

describe('Meu Componente', () => {
  it('deve fazer algo', () => {
    const resultado = minhaFuncao();
    expect(resultado).toBe(valorEsperado);
  });
});
```

**Rodar:**
```bash
npm test
```

---

<a name="troubleshooting"></a>
## 7️⃣ **TROUBLESHOOTING**

### **Problemas Comuns**

| Problema | Causa | Solução |
|----------|-------|---------|
| **Dark mode não funciona** | Script de tema não está no HTML | Adicionar script inline no `<head>` |
| **Cores inconsistentes** | CSS inline duplicado | Usar apenas `tokens.css` |
| **PWA não instala** | Ícones errados no manifest | Verificar se `pwa-192x192.png` existe em `public/` |
| **Build falha** | Alias `/js` errado | Verificar `vite.config.js` → `/js: '/src/js'` |
| **Cache antigo persiste** | Service Worker não atualiza | Incrementar versão no `cacheName` |
| **Testes falham** | Dependências desatualizadas | Rodar `npm ci` |

---

### **Comandos de Diagnóstico**

```bash
# Verificar estrutura de arquivos
ls -R public/css
ls -R public/assets

# Testar build
npm run build
npm run preview

# Verificar PWA
# Abrir Chrome DevTools > Application > Manifest

# Limpar cache
rm -rf dist node_modules .vite
npm install
npm run build
```

---

## 📊 **CHECKLIST DE VALIDAÇÃO**

### **Para Cada Deploy:**

```
[ ] Dark mode funciona (toggle + persistência)
[ ] PWA instala (Chrome > Add to Home)
[ ] Sem erros no console (F12)
[ ] Service Worker atualiza (Application > Service Workers)
[ ] Cores consistentes entre páginas
[ ] Build sem warnings (npm run build)
[ ] Testes passam (npm test)
[ ] CI passa (GitHub Actions)
[ ] Lighthouse PWA score > 90
[ ] Acessibilidade WCAG AAA
```

---

## 🔄 **HISTÓRICO DE MUDANÇAS**

### **v6.1.0 (2025-01-13) - Solução Híbrida**

**Fase 1 - Correções Críticas:**
- ✅ `vite.config.js` corrigido (alias `/js` → `/src/js`)
- ✅ `manifest.json` atualizado (ícones corretos)
- ✅ `theme-init.js` deletado
- ✅ Script de tema inline em HTMLs
- ✅ CSS consolidado em `tokens.css`
- ✅ `dark-theme.css` deletado

**Fase 2 - Testes e CI:**
- ✅ Testes unitários criados (`src/tests/`)
- ✅ GitHub Actions configurado (`.github/workflows/ci.yml`)
- ✅ ESLint configurado

**Resultado:**
- Dark mode 100% funcional
- PWA instalável
- Build estável
- CI/CD automatizado

---

## 📞 **CONTATOS E RECURSOS**

**Documentação:**
- Vite: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com
- Supabase: https://supabase.com/docs

**Suporte:**
- GitHub Issues: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/issues
- Desenvolvedor: AbnadabyBonaparte

---

## ⚖️ **LICENÇA**

Proprietário - ALSHAM Global © 2025

---

**Fim do Dossiê Técnico v6.1.0**

---

Este documento deve ser atualizado sempre que houver mudanças significativas na arquitetura. 

**Última atualização:** 2025-01-13 10:40 UTC  
**Próxima revisão:** v7.0.0 (se migrar para React)
