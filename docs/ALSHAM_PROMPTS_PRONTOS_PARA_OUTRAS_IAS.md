# 📋 PROMPTS PRONTOS - COPIE E COLE NA OUTRA IA

---

## 🎯 PROMPT 1: CONTEXTO INICIAL (COLE PRIMEIRO)

```
Você é um engenheiro de software senior trabalhando no projeto ALSHAM 360° PRIMA.

CONTEXTO DO PROJETO:
- Repositório: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA
- Stack: React + TypeScript + Vite + Tailwind + Supabase
- Componentes: shadcn/ui (já instalado em src/components/ui/)
- Temas: 6 temas cyberpunk com CSS variables

MISSÃO ATUAL:
Migrar páginas para usar shadcn/ui e CSS variables (eliminar cores hardcoded).

PROGRESSO:
- 12 de 63 páginas já migradas (19%)
- Faltam 51 páginas

REGRAS ABSOLUTAS:
1. ❌ NUNCA usar cores hardcoded (bg-gray-500, text-white, #fff, etc.)
2. ✅ SEMPRE usar CSS variables: var(--bg), var(--surface), var(--text), etc.
3. ✅ SEMPRE usar componentes shadcn/ui: Card, Button, Table, Badge, etc.
4. ✅ MANTER 100% da funcionalidade existente (não remover features)
5. ✅ MANTER animações existentes (framer-motion)

MAPEAMENTO DE CORES:
bg-white → bg-[var(--surface)]
bg-gray-50/100 → bg-[var(--surface-strong)]
bg-gray-800/900 → bg-[var(--bg)]
text-white → text-[var(--text)]
text-gray-500/600 → text-[var(--text-secondary)]
text-gray-900 → text-[var(--text-primary)]
border-gray-200/300 → border-[var(--border)]
Status verde → bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)]
Status azul → bg-[var(--accent-sky)]/10 text-[var(--accent-sky)]
Status amarelo → bg-[var(--accent-warning)]/10 text-[var(--accent-warning)]
Status vermelho → bg-[var(--accent-alert)]/10 text-[var(--accent-alert)]

Confirme que entendeu e está pronto para começar.
```

---

## 🎯 PROMPT 2: MIGRAR BLOCO 4 (5 PÁGINAS)

```
MISSÃO: Migrar 5 páginas para shadcn/ui (Bloco 4)

PÁGINAS:
1. src/pages/Customer360.tsx (237 linhas)
2. src/pages/ExecutiveDashboard.tsx (403 linhas)
3. src/pages/Products.tsx (268 linhas)
4. src/pages/Campaigns.tsx (150 linhas)
5. src/pages/Automacoes.tsx (155 linhas)

PARA CADA PÁGINA:
1. Abra o arquivo
2. Adicione imports shadcn/ui no topo:
   import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
   import { Button } from '@/components/ui/button'
   import { Badge } from '@/components/ui/badge'
   (adicione mais conforme necessário)

3. Substitua TODAS as cores hardcoded:
   bg-white → bg-[var(--surface)]
   bg-gray-* → bg-[var(--surface)] ou bg-[var(--bg)]
   text-gray-* → text-[var(--text-secondary)]
   border-gray-* → border-[var(--border)]
   bg-green-* text-green-* → bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)]
   bg-blue-* text-blue-* → bg-[var(--accent-sky)]/10 text-[var(--accent-sky)]
   bg-red-* text-red-* → bg-[var(--accent-alert)]/10 text-[var(--accent-alert)]

4. Substitua elementos HTML por shadcn/ui:
   <div className="card..."> → <Card><CardContent>
   <button className="..."> → <Button>
   <table className="..."> → <Table>

VALIDAÇÃO APÓS CADA PÁGINA:
- Rodar: grep "bg-gray-\|bg-white\|text-gray-[0-9]" src/pages/[PAGINA].tsx
- DEVE retornar VAZIO (zero resultados)

COMMIT FINAL:
git add src/pages/Customer360.tsx src/pages/ExecutiveDashboard.tsx src/pages/Products.tsx src/pages/Campaigns.tsx src/pages/Automacoes.tsx
git commit -m "refactor: migrar 5 páginas para shadcn/ui (bloco 4)"
git push origin main

Comece pela Customer360.tsx
```

---

## 🎯 PROMPT 3: MIGRAR BLOCO 5 (5 PÁGINAS)

```
MISSÃO: Migrar 5 páginas para shadcn/ui (Bloco 5)

PÁGINAS:
1. src/pages/AdsManager.tsx (793 linhas)
2. src/pages/EmailMarketing.tsx (262 linhas)
3. src/pages/SocialMedia.tsx (261 linhas)
4. src/pages/ContentCalendar.tsx (298 linhas)
5. src/pages/SEO.tsx (262 linhas)

Seguir mesmo processo do Bloco 4:
1. Adicionar imports shadcn/ui
2. Substituir cores hardcoded por CSS variables
3. Substituir HTML por componentes shadcn/ui
4. Validar: zero cores hardcoded
5. Commit e push

Comece pela AdsManager.tsx (maior e mais complexa)
```

---

## 🎯 PROMPT 4: MIGRAR BLOCO 6 (5 PÁGINAS)

```
MISSÃO: Migrar 5 páginas para shadcn/ui (Bloco 6)

PÁGINAS:
1. src/pages/LandingPageBuilder.tsx (337 linhas)
2. src/pages/LandingPages.tsx (229 linhas)
3. src/pages/Blog.tsx (277 linhas)
4. src/pages/Webinars.tsx (255 linhas)
5. src/pages/Gamificacao.tsx (260 linhas)

Seguir mesmo processo dos blocos anteriores.
```

---

## 🎯 PROMPT 5: MIGRAR BLOCO 7 (5 PÁGINAS)

```
MISSÃO: Migrar 5 páginas para shadcn/ui (Bloco 7)

PÁGINAS:
1. src/pages/SupportTickets.tsx (266 linhas)
2. src/pages/LiveChat.tsx (280 linhas)
3. src/pages/OmnichannelInbox.tsx (329 linhas)
4. src/pages/CallCenter.tsx (274 linhas)
5. src/pages/KnowledgeBase.tsx (271 linhas)

Seguir mesmo processo dos blocos anteriores.
```

---

## 🎯 PROMPT 6: MIGRAR BLOCO 8 (5 PÁGINAS)

```
MISSÃO: Migrar 5 páginas para shadcn/ui (Bloco 8)

PÁGINAS:
1. src/pages/Whatsapp.tsx (206 linhas)
2. src/pages/SMS.tsx (239 linhas)
3. src/pages/Financeiro.tsx (285 linhas)
4. src/pages/Invoices.tsx (255 linhas)
5. src/pages/Orders.tsx (261 linhas)

Seguir mesmo processo dos blocos anteriores.
```

---

## 🎯 PROMPT 7: VERIFICAR PROGRESSO

```
Execute os seguintes comandos para verificar o progresso:

# Total de páginas com shadcn/ui
echo "Páginas migradas:"
grep -rl "@/components/ui" src/pages/*.tsx | wc -l

# Páginas que ainda faltam
echo ""
echo "Páginas sem shadcn/ui:"
for file in src/pages/*.tsx; do
  if ! grep -q "@/components/ui" "$file" 2>/dev/null; then
    basename "$file"
  fi
done

# Páginas com cores hardcoded (problema)
echo ""
echo "Páginas com cores hardcoded:"
grep -rl "bg-gray-\|bg-white\|text-gray-[0-9]" src/pages/*.tsx | wc -l

Me mostre os resultados.
```

---

## 🎯 PROMPT 8: MIGRAR PÁGINA INDIVIDUAL

```
MISSÃO: Migrar a página [NOME].tsx para shadcn/ui

1. Abra src/pages/[NOME].tsx
2. Me mostre o conteúdo atual
3. Eu vou te dizer quais substituições fazer
4. Faça as alterações
5. Valide que não tem cores hardcoded
6. Commit

Comece mostrando o arquivo.
```

---

## 📋 LISTA COMPLETA DE PÁGINAS PARA MIGRAR

### Já Migradas (12):
✅ Dashboard, Leads, LeadsDetails, Pipeline, Contacts, Tasks, Calendar, Inbox, Opportunities, Home, Settings, Reports

### Bloco 4 (próximo):
⏳ Customer360, ExecutiveDashboard, Products, Campaigns, Automacoes

### Bloco 5:
⏳ AdsManager, EmailMarketing, SocialMedia, ContentCalendar, SEO

### Bloco 6:
⏳ LandingPageBuilder, LandingPages, Blog, Webinars, Gamificacao

### Bloco 7:
⏳ SupportTickets, LiveChat, OmnichannelInbox, CallCenter, KnowledgeBase

### Bloco 8:
⏳ Whatsapp, SMS, Financeiro, Invoices, Orders

### Bloco 9:
⏳ Quotes, Contracts, Proposals, Partners, Events

### Bloco 10:
⏳ Leaderboard, Achievements, AIAssistant, APIStatus, Compliance

### Bloco 11:
⏳ Seguranca, Sustainability, CarbonFootprint, ESG, NFTGallery

### Bloco 12:
⏳ Metaverse, VirtualOffice, WarArena, TheBoardroomOmega, Investors

### Bloco 13 (últimas):
⏳ Gamification, AutomationBuilder, Publicacao, Affiliates, AlshamOS, UnderConstruction

---

## 🚨 AVISOS IMPORTANTES

1. **SEMPRE validar** que não tem cores hardcoded após migrar
2. **NUNCA remover** funcionalidades existentes
3. **SEMPRE manter** animações (framer-motion)
4. **SEMPRE fazer** commit após cada bloco
5. **Build deve passar** antes de fazer push

---

## 📊 META FINAL

```
Antes: 12/63 páginas (19%)
Meta: 63/63 páginas (100%)

Cada bloco = +5 páginas = +8% de progresso
```

---

**Copie estes prompts e use na ordem!**
