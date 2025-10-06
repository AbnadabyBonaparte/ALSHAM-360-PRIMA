# ⚙️ ALSHAM 360° PRIMA — README DEPLOY v6.0  
## Infraestrutura, Build e Logs de Implementação

**Data de Publicação:** 06/10/2025  
**Versão:** v6.0  
**Status:** ✅ Public Release  
**Ambiente:** Vercel + Railway + Supabase (Production)

---

## 1. Resumo do Deploy

A release **v6.0 — Auditoria & Visual Excellence** marca a consolidação da infraestrutura ALSHAM 360° PRIMA em padrão **Enterprise**.  
Todos os módulos frontend, backend e documentação foram sincronizados com deploy automatizado contínuo (CI/CD) via Vercel e Railway.

---

## 2. Stack de Deploy

| Camada | Plataforma | Status | Observações |
|--------|-------------|--------|--------------|
| Frontend | **Vercel** | ✅ Ativo | Deploy automatizado por push em `main` |
| Backend | **Railway** | ✅ Ativo | API + Supabase sincronizados |
| Banco de Dados | **Supabase** | ✅ Estável | Schema validado e com RLS ativo |
| Armazenamento | **Supabase Storage** | ✅ Ativo | para assets e sons (`/assets/sounds`) |
| CDN / Cache | **Cloudflare** | 🔄 Em fase de configuração | incluir CSP e compressão gzip |

---

## 3. Detalhes do Build (Vercel Logs)

**Origem:** `github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA`  
**Local:** Washington, D.C. (East - iad1)  
**Build Machine:** 4 cores, 8 GB RAM  
**Node.js:** 20.x (forçado por package.json)  
**Framework:** Vite + TailwindCSS + PWA

### 🔍 Resumo de Log
