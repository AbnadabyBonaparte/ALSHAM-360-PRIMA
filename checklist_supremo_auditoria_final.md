# ✅ CHECKLIST SUPREMO — AUDITORIA FINAL & ROADMAP  
**Projeto:** ALSHAM 360° PRIMA  
**Objetivo:** Garantir que o sistema esteja 100% validado, auditado e pronto para produção enterprise.

---

## 1. 🔐 Autenticação & Sessão
- **Login**
  - Entrar com credenciais válidas → redirecionar `/dashboard.html`.
  - Entrar com inválidas → erro claro, log `LOGIN_FAILURE`.
- **Logout**
  - Sessão encerrada (Supabase + localStorage).
  - Redirecionar `/login.html`.
  - Log `USER_LOGGED_OUT`.
- **Registro**
  - Criar novo usuário.
  - Enviar e-mail verificação.
  - Preencher `user_profiles`.
- **Reset Password**
  - Enviar e-mail de redefinição.
  - Link válido/seguro, log `PASSWORD_RESET_REQUEST`.
- **Session Guard**
  - Bloquear rotas privadas sem login.
  - Permitir acesso a rotas públicas.
- **Token Refresh**
  - Renovação automática antes da expiração.
  - Log `SESSION_REFRESHED` / `SESSION_EXPIRED`.

---

## 2. 📊 Painel & Operações
- **Dashboard**
  - KPIs carregam de `dashboard_summary`.
  - Atualização realtime (Supabase Realtime).
- **Leads**
  - CRUD completo em `leads_crm`.
  - Leads filtrados por `org_id`.
- **Automações**
  - Listar automações da org.
  - Ativar/desativar funcionando.
- **Gamificação**
  - Ranking carregando de `gamification_scores`.
  - Pontuação atualizada realtime.
- **Relatórios**
  - KPIs calculados corretamente.
  - Gráficos renderizados (Chart.js).
  - Exportações CSV/PDF funcionando.
- **Configurações**
  - Perfil: editar nome/email.
  - Organização: editar nome/logo.
  - Time: adicionar/remover membros.
  - Logs salvos em `audit_log`.

---

## 3. 🛠️ Diagnóstico e Utilidades
- **`test-supabase.html`**
  - Validar autenticação, queries e inserts.
  - Confirmar conexão em produção.
- **`src/lib/supabase.js`**
  - Funções (`genericSelect`, `genericInsert`, `auditLog`) retornam dados reais.
  - UUIDs válidos.
  - Sanitização de inputs ativa.

---

## 4. 🧪 Testes Automáticos
- **Cypress (E2E)**
  - Login/logout.
  - Registro de usuário.
  - Reset password.
  - Proteção de rotas.
  - CRUD de leads.
  - Visualização de relatórios.
- **Vitest (Unitário)**
  - Funções de `supabase.js`.
  - Validações de e-mail/senha.
  - UI helpers (toasts, loaders).

---

## 5. 🎨 UX/UI
- **Dark Mode**
  - Toggle persistente via `localStorage`.
- **Acessibilidade**
  - ARIA labels em botões.
  - Navegação por teclado.
  - Screen readers compatíveis.
- **Responsividade**
  - Testes em mobile, tablet e desktop.
  - Ajustes navbar, tabelas e gráficos.

---

## 6. 📦 Deploy & Infraestrutura
- Variáveis no Vercel (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DEFAULT_ORG_ID`).
- Testar Service Worker e manifest PWA.
- Validar cache/bundle Vite.
- **Smoke Test Pós-Deploy**
  1. Abrir `/login.html`.
  2. Entrar → `/dashboard.html`.
  3. Ver dados reais de leads.
  4. Sair → redirecionar `/login.html`.

---

## 7. 🚀 Roadmap Próximo
- Painel de administração (multi-org).
- Logs avançados exportáveis.
- Módulo financeiro (Stripe/Pix).
- Integração com n8n.
- Painel de analytics realtime.

---

# 📋 MANUAL DE AUDITORIA FINAL — TESTES PÁGINA POR PÁGINA

## 1. 🔐 Autenticação
**/login.html**
- Caso 1: login válido → redireciona dashboard, log `USER_LOGGED_IN`.
- Caso 2: login inválido → erro claro, log `LOGIN_FAILURE`.

**/register.html**
- Caso 1: registro novo → conta criada, log `USER_REGISTERED`.
- Caso 2: e-mail duplicado → erro “já cadastrado”.

**/reset-password.html**
- Caso 1: e-mail válido → link enviado, log `PASSWORD_RESET_REQUEST`.
- Caso 2: inválido → erro “link não enviado”.

**/logout.html**
- Logout → encerrar sessão/localStorage, log `USER_LOGGED_OUT`.

---

## 2. 🛡️ Segurança de Sessão
**/session-guard.html**
- Caso 1: logado → mostra info, log `AUTHORIZED_ACCESS`.
- Caso 2: não logado → redireciona login, log `UNAUTHORIZED_ACCESS`.

**/token-refresh.html**
- Caso 1: sessão ativa → “Sessão renovada”, log `SESSION_REFRESHED`.
- Caso 2: expirada → redireciona login, log `SESSION_EXPIRED`.

---

## 3. 📊 Operações
**/dashboard.html**
- Caso 1: KPIs → dados de `dashboard_summary`, log `DASHBOARD_VIEWED`.
- Caso 2: realtime → inserir lead manualmente, KPI atualiza.

**/leads-real.html**
- Caso 1: listar leads por `org_id`.
- Caso 2: criar lead → aparece na lista, log `LEAD_CREATED`.

**/automacoes.html**
- Caso 1: listar automações.
- Caso 2: toggle → estado atualizado, log `AUTOMATION_UPDATED`.

**/gamificacao.html**
- Caso 1: ranking usuários.
- Caso 2: alterar score → ranking atualiza realtime.

**/relatorios.html**
- Caso 1: KPIs → log `REPORTS_VIEWED`.
- Caso 2: gráfico Chart.js renderizado.

**/configuracoes.html**
- Caso 1: editar perfil → update em `user_profiles`, log `PROFILE_UPDATED`.
- Caso 2: editar org → update em org, log `ORG_UPDATED`.
- Caso 3: alterar direto no banco → refletir na UI (subscribeToTable).

---

## 4. 🧪 QA Automatizado
- **Cypress E2E**
  - Login/logout, registro duplicado, reset password.
  - Proteção de rotas.
  - CRUD leads.
  - Visualizar relatórios.
  - Alterar perfil.
- **Vitest Unitário**
  - `supabase.js`: insert/select/audit.
  - `auth.js`: validação senha/e-mail.
  - UI helpers: toasts, loaders.

---

## 5. 🎨 UX/UI
- Dark mode persistente.
- Acessibilidade: teclado + screen readers.
- Responsividade: mobile, tablet e desktop.

---

📌 **Resultado esperado:**  
Se todos os testes passarem, o **ALSHAM 360° PRIMA** estará **100% pronto para produção enterprise**.
