# 🕵️ RELATÓRIO FORENSE - ALSHAM-360-PRIMA

## ⚠️ ALERTA DE SEGURANÇA
**Este relatório contém informações críticas sobre vulnerabilidades de segurança e falhas de design que podem comprometer a integridade do sistema.**

---

## 1. SSOT & INTEGRIDADE

### ✅ Confirmação SSOT
- **Repositório remoto**: `github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA`
- **Branch**: `main`
- **Commit HEAD remoto**: `d675bdf3642d9b6901b404220a9850784c134284`
- **Autor**: AbnadabyBonaparte
- **Data**: Mon Dec 15 16:13:46 2025 -0300
- **Status local**: ✅ Alinhado 100% com remoto

### 🔍 Divergências Críticas Detectadas
Nenhuma divergência detectada entre local e remoto.

---

## 2. FLUXO REAL DE AUTH/ORG

### 🗂️ Caminho de Execução Mapeado

```
main.tsx → App-new.tsx → ProtectedLayout → useAuthStore → OrganizationSelector
```

#### `src/main.tsx`
- ✅ **Entry point correto**: Importa `App-new.tsx` (não o antigo `App.tsx`)
- ✅ **CSS carregado primeiro**: `index.css` importado antes do App
- ⚠️ **Problema**: CSS inclui temas mas useTheme roda apenas no mount do App

#### `src/App-new.tsx`
- ✅ **Estrutura React Router correta**
- ✅ **Rotas públicas/privadas separadas**
- ❌ **Catch-all problemático**: `<Route path="*" element={<Navigate to="/dashboard" replace />} />`
  - **Impacto**: Loop infinito se `/dashboard` não for acessível
  - **Causa**: Redireciona para rota protegida sem verificar auth state

#### `src/components/ProtectedLayout.tsx`
- ✅ **Gates implementados**: `useEffect(() => { initialize() }, [initialize])`
- ⚠️ **Quem chama init()**: `ProtectedLayout` (único local)
- ⚠️ **Quantas vezes**: Uma vez por mount do componente
- ✅ **Guards**: Verifica `isAuthenticated` e `needsOrgSelection`
- ❌ **Problema crítico**: Sessão persistida no localStorage permite bypass do login

#### `src/lib/supabase/useAuthStore.ts`
- ✅ **Persistência**: `persist` middleware do Zustand
- ✅ **Quem carrega orgs**: `initialize()` → `loadUserOrganizations()`
- ✅ **Quando `needsOrgSelection`**: `isAuthenticated && !currentOrg && organizations.length > 0`
- ✅ **Onde `currentOrg` definido**: `switchOrganization()` ou auto-select se `organizations.length === 1`
- ❌ **Problema**: Auth state listener duplica lógica de carregamento de organizações

### 🔐 Problema: "Entrou direto sem passar pelo login"

**Causa Raiz**: Sessão persistida no localStorage permite acesso direto às rotas protegidas.

**Fluxo Atual Problemático**:
1. User fecha browser com sessão ativa
2. localStorage mantém `{user, session, currentOrg, organizations}`
3. Reload da página → `useAuthStore` restaura estado
4. `ProtectedLayout` vê `isAuthenticated: true` → permite acesso
5. **Bypass total do login flow**

**Evidência**:
```typescript
// src/lib/supabase/useAuthStore.ts:211-219
persist(
  (set, get) => ({
    // ...
  }),
  {
    name: 'alsham-auth-storage',
    partialize: (state) => ({
      user: state.user,
      session: state.session,
      currentOrg: state.currentOrg,
      organizations: state.organizations
    })
  }
)
```

---

## 3. NAVEGAÇÃO INTERNA (por que "ficou travado no selector")

### 🧭 Sistema de Navegação Analisado

#### `src/routes/index.tsx` + `src/hooks/useUrlSync.ts`
- ✅ **URL Sync**: `useUrlSync` sincroniza `activePage` com URL
- ✅ **Route Registry**: Sistema de registro dinâmico de rotas
- ✅ **Fallback seguro**: `resolveRouteOrDefault()` → `DEFAULT_ROUTE_ID`

#### `src/App.tsx` (versão antiga ainda em uso)
- ✅ **State management**: `activePage` controlado por `setActivePage`
- ✅ **navigateToPage**: Callback que atualiza state e URL
- ✅ **Sidebar integration**: `onNavigate={navigateToPage}`

### 🔍 Causa Raiz da "trava"

**Problema**: Conflito entre dois sistemas de navegação simultâneos.

**Evidência**:
1. **App-new.tsx**: Usa React Router (`<BrowserRouter>`, `<Routes>`, `<Route>`)
2. **App.tsx**: Usa sistema custom (`activePage`, `renderPage`, `navigateToPage`)
3. **main.tsx**: Carrega `App-new.tsx`, mas código antigo ainda presente

**Fluxo Atual Confuso**:
```
URL Change → useUrlSync → setActivePage → renderPage()
                        ↓
            React Router → Navigate/Route components
```

**Resultado**: Estado duplicado causa inconsistência visual.

---

## 4. TEMA (por que "não muda")

### 🎨 Sistema de Tema Analisado

#### `src/hooks/useTheme.ts`
- ✅ **Detecção inicial**: `detectSavedTheme()` do localStorage
- ✅ **Aplicação**: `applyThemeToDOM()` seta `data-theme` + `color-scheme` + CSS vars
- ✅ **Persistência**: Salva em localStorage
- ✅ **Transições**: Classe `theme-switching` por 320ms

#### `src/lib/theme-variables.ts`
- ✅ **Injeção**: `injectThemeVariables()` seta todas as CSS vars
- ✅ **Mapeamento completo**: `--bg`, `--text`, `--accent-*`, `--grad-*`, etc.

#### `src/index.css` + CSS Files
- ✅ **Ordem correta**: `@import "./styles/theme-tokens.css";` → `@import "./styles/themes.css";`
- ✅ **Tailwind**: `@tailwind base; components; utilities;` após imports

### 🔍 Causa Raiz do Problema

**Problema**: Ordem de execução CSS vs JavaScript.

**Sequência Atual Problemática**:
1. `main.tsx` importa `index.css` (CSS carrega primeiro)
2. `index.css` define fallbacks em `:root`
3. App mount → `useTheme` roda → `injectThemeVariables()` sobrescreve vars
4. **Timing issue**: CSS pode renderizar com fallbacks antes do JS executar

**Evidência**:
```css
/* src/styles/themes.css:13-45 */
:root {
  /* FALLBACK MÍNIMO (JS OFF / Runtime Failure) */
  --bg: #0b1220;
  --text: rgba(255, 255, 255, 0.96);
  /* ... */
  --accent-1: #10b981;
  /* ... */
}
```

**Sintoma**: Tema "não muda" porque CSS usa fallbacks quando JS falha ou atrasa.

---

## 5. SUPABASE REQUESTS (404/400)

### 🗄️ Erros Identificados

#### ❌ `marketing_campaigns` 404
**Localização**: `src/pages/Dashboard.tsx:248`
```typescript
supabase.from('marketing_campaigns').select('id, status').eq('status', 'active')
```

**Causa**: Tabela não existe no schema.
**Correto**: `campaigns` (conforme `src/lib/supabase/types.ts:178`)

#### ❌ `opportunities` 400
**Localização**: `src/pages/Dashboard.tsx:247`
```typescript
supabase.from('opportunities').select('created_at, status, value, stage')
```

**Causa**: Coluna `status` não existe na tabela `opportunities`.
**Correto**: Usar apenas `stage` (conforme schema).

### 📋 Schema Correto (extraído de `types.ts`)

```typescript
// campaigns (não marketing_campaigns)
campaigns: {
  Row: {
    id: string
    name: string
    status: string  // ✅ existe
    // ...
  }
}

// opportunities
opportunities: {
  Row: {
    id: string
    stage: string  // ✅ existe (não status)
    value: number
    // ...
  }
}
```

---

## 6. PATCH MÍNIMO "ZERO REGRESSÃO"

### 📁 Arquivos a Editar

#### 1. `src/pages/Dashboard.tsx`
**Problema**: Queries erradas para Supabase.

```typescript:245:249:src/pages/Dashboard.tsx
// ANTES (errado)
supabase.from('opportunities').select('created_at, status, value, stage').gte('created_at', isoStart),
supabase.from('marketing_campaigns').select('id, status').eq('status', 'active')

// DEPOIS (correto)
supabase.from('opportunities').select('created_at, stage, value').gte('created_at', isoStart),
supabase.from('campaigns').select('id, status').eq('status', 'active')
```

#### 2. `src/lib/supabase/useAuthStore.ts`
**Problema**: Duplicação de lógica no auth listener.

```typescript:223:255:src/lib/supabase/useAuthStore.ts
// REMOVER auth state listener duplicado (causa race conditions)
auth.onAuthStateChange(async (event, session) => {
  // REMOVER TODO ESTE BLOCO
  if (event === 'SIGNED_IN' && session?.user) {
    // ...
  }
  // ...
})
```

#### 3. `src/App-new.tsx`
**Problema**: Catch-all redireciona sem verificar auth.

```typescript:63:65:src/App-new.tsx
// ANTES (problemático)
<Route path="*" element={<Navigate to="/dashboard" replace />} />

// DEPOIS (seguro)
<Route path="*" element={<Navigate to="/" replace />} />
```

#### 4. `src/lib/supabase/useAuthStore.ts`
**Problema**: Persistência excessiva permite bypass.

```typescript:211:219:src/lib/supabase/useAuthStore.ts
// ANTES (inseguro - permite bypass)
partialize: (state) => ({
  user: state.user,
  session: state.session,
  currentOrg: state.currentOrg,
  organizations: state.organizations
})

// DEPOIS (seguro - força re-auth)
partialize: (state) => ({
  // NÃO persistir user/session - força login sempre
  currentOrg: state.currentOrg,
  organizations: state.organizations
})
```

### 🧪 Checklist de Validação

#### Build Local
```bash
npm run build  # Deve passar sem erros
npm run preview  # Deve servir corretamente
```

#### Teste no Browser
1. **Login Flow**: 
   - ✅ Abrir app → Redirecionar para `/login`
   - ✅ Login válido → Ir para organization selector
   - ✅ Selecionar org → Entrar no dashboard

2. **Tema Switch**:
   - ✅ Ir para página de temas
   - ✅ Clicar em tema diferente → Visual mudar imediatamente
   - ✅ Refresh da página → Tema persistir

3. **Navegação**:
   - ✅ Clicar em links do sidebar → Página mudar
   - ✅ Usar botão voltar → Voltar corretamente
   - ✅ URL atualizar com navegação

4. **Dashboard**:
   - ✅ Carregar sem erros 400/404
   - ✅ Dados aparecerem corretamente

---

## 📊 RESUMO EXECUTIVO

| Problema | Gravidade | Causa Raiz | Patch Status |
|----------|-----------|------------|--------------|
| Auth Bypass | 🔴 CRÍTICA | Sessão persistida | ✅ Identificado |
| Navegação Travada | 🟡 ALTA | 2 sistemas conflitantes | ✅ Identificado |
| Tema Não Muda | 🟡 MÉDIA | Timing CSS/JS | ✅ Identificado |
| Supabase 404/400 | 🟡 MÉDIA | Schema incorreto | ✅ Identificado |

**Próximos Passos Recomendados**:
1. Aplicar patches na ordem apresentada
2. Testar em ambiente de staging
3. Deploy gradual com rollback plan
4. Monitoramento pós-deploy por 48h

---

*Relatório gerado em: $(date)*
*Engenheiro Forense: AI Assistant*
*SSOT Commit: d675bdf*



