# 🎯 DOSSIÊ — ALSHAM 360° PRIMA

> ⛔ **DOCUMENTO INTERNO — NÃO PUBLICAR.**
> Contém ref de banco, tese comercial, mecanismo de negócio proprietário e arquitetura.
> Destino: `docs/internal/` ou fora do repositório. **Nunca em `public/`.**

> **Data:** 22 de julho de 2026
> **Método:** verificado por **query SQL direta** — 129 tabelas listadas e cruzadas contra a tese do Fundador. Lei 7 aplicada.
> **Veredito de uma linha:** não é um CRM. É um **sistema de captura e governança do ativo comercial** — e ~80% dele já está modelado.

---

## 1. A TESE — o problema que ele resolve

**A carteira de clientes sai pela porta no celular do vendedor.**

Em loja de autopeça, material de construção, distribuidora — o vendedor tem todos os clientes no WhatsApp pessoal. Ele trabalha para a empresa, é pago pela empresa, mas o **relacionamento é dele**. Quando sai, abre o celular na concorrência e dispara para toda a base: *"agora estou aqui, vou te atender melhor."*

**A empresa pagou pela aquisição do cliente e perdeu o ativo.**

Nenhum CRM resolve isso, porque todo CRM depende de o vendedor **alimentar o sistema** — e ele não alimenta.

---

## 2. 🔑 O MECANISMO — a ideia que faz o sistema funcionar

**Assimetria de comissão.**

| Canal | Comissão |
|---|---|
| Venda pelo **sistema da empresa** | **5%** |
| Venda pelo **celular pessoal** | **1%** |

O vendedor não é obrigado a nada. Ele **escolhe** — porque ganha 5× mais no canal certo. Chega na loja, praticamente desliga o celular pessoal e loga no WhatsApp da empresa.

> **Este é o coração do produto.** Não é tecnologia — é economia comportamental. Resolve o problema de adoção que enterra a maioria das implantações de CRM. Qualquer um copia um software; a assimetria que faz o vendedor migrar sozinho é uma **ideia de negócio**.

### A arquitetura de consentimento (juridicamente correta)
- O cliente entra em contato no WhatsApp comercial → **pop-up informa que a conversa é gravada** e pergunta se deseja continuar → **consentimento capturado** (`privacy_consent_log`)
- A conversa **pertence à empresa**, não ao vendedor
- O **fiscalizado é o vendedor** — e legitimamente: é ferramenta de trabalho, atividade comercial da empresa, não comunicação pessoal
- O vendedor é quem **não pode expor** a conversa da empresa

⚠️ **Item jurídico a fechar (LEXIS):** no Brasil, monitorar comunicação de empregado exige **ciência prévia e inequívoca do empregado** — política interna assinada ou cláusula contratual, com aceite registrado. O lado do cliente está resolvido pelo pop-up; **falta registrar o aceite do vendedor**. A tabela `org_policies` pode carregar isso.

---

## 3. A VISÃO COMPLETA — o que o sistema faz depois que a conversa está dentro

| # | Capacidade | Exemplo do Fundador |
|---|---|---|
| 1 | **Medir atividade real** | quantos orçamentos, quantos contatos, quantas conversas por vendedor/dia |
| 2 | **Cobrar o follow-up** | mandou orçamento e esqueceu → o agente lembra de perguntar se já pode fechar |
| 3 | **Prever necessidade** | sabe a km/mês do carro → prevê a troca de óleo → aciona o vendedor na hora certa |
| 4 | **Vender sozinho fora do horário** | 21h, loja fechada, cliente quebrou: o sistema atende, **consulta estoque, gera pagamento, recebe** e deixa o pacote na fila de urgência para despacho na abertura |
| 5 | **Calibrar o time pelo topo** | *"João vende 200k e Pedro 50k — por quê?"* → João: 60 orçamentos, 150 conversas, 40 promoções. Pedro: 10% disso. **O gestor treina com dado, não com achismo.** |
| 6 | **Relatório e CRM completo** | a base, não o produto |

---

## 4. ✅ O QUE JÁ ESTÁ CONSTRUÍDO — ~80% da tese

**129 tabelas** no banco `alsham-core`. Cruzadas contra a visão:

### Medição do vendedor — ✅ pronta
`lead_interactions` (`user_id` · `interaction_type` · `outcome` · `duration_minutes` · `next_action` · `interaction_date`) · `interactions` · `performance_metrics` · `teams` · `team_members` · `team_leaderboards` · `user_roles`

👉 A pergunta *"por que João vende 4× mais"* é respondível **por construção**.

### O agente proativo — ✅ pronto
`next_best_action` · `next_best_actions` · `automation_rules` (`trigger_event → conditions → actions`) · `automations` · `automation_executions` · `logs_automacao`

👉 O "lembra de fechar o orçamento" tem tabela com nome próprio.

### Treinamento do time — ✅ pronto (e raro)
`coaching_sessions` · `coaching_feedback` · `gamification_points` · `gamification_badges` · `gamification_rewards` · `gamification_rank_history` · `learning_modules` · `user_badges`

👉 Não mede só para relatar — mede para **treinar**. Ciclo completo: medir → comparar → coachar → premiar.

### Inteligência — ✅ pronta
`ai_memory` · `ai_collective_memory` · `ai_inferences` · `ai_predictions` · `ai_recommendations` · `ai_meta_insights` · `lead_scoring` · `ai_function_blueprints`

👉 A previsão de troca de óleo cabe aqui.

### Conversa e canal — ⚠️ parcial
`sentiment_analysis` · `sentiment_analysis_logs` · `webhooks_in` · `webhooks_out` · `webhook_configs` (com `secret_key`, `retry_count`, `timeout_seconds`) · `api_integrations` · `integration_configs` · `social_media`

👉 A **análise** da conversa está prevista; o **armazenamento** da mensagem não (ver §5).

### Comercial — ⚠️ parcial
`quotes` (orçamentos) · `opportunities` · `sales_opportunities` · `deals` · `conversion_funnels` · `invoices` · `billing` · `financial_records`

### Governança e LGPD — ✅ pronta (e madura)
`privacy_consent_log` · `ai_ethics_audit` · `permission_audit` · `org_policies` · `security_incidents` · `security_alerts` · `security_audits` · `security_audit_log` · `data_audits` · `lead_audit` · `audit_leads` · `system_audit_matrix` · `access_logs`

👉 **`privacy_consent_log` é o pop-up do cliente.** Alguém pensou em LGPD no schema — maturidade rara.

### Gestão e relatório — ✅ pronta
`report_definitions` · `report_executions` · `scheduled_reports` · `impact_reports` · `dashboard_layouts` · `dashboard_snapshots` · `saved_dashboards` · `saved_filters` · `roi_calculations`

### Marketing — ✅ presente
`campaigns` · `ads_manager` · `email_templates` · `landing_pages` · `content_library` · `seo`

---

## 5. ❌ O QUE FALTA — a camada transacional (o "balcão")

Em 129 tabelas **não existe**:

| Falta | Impede |
|---|---|
| **produto / estoque** | *"verifica o estoque às 21h"* |
| **pedido** | *"gera pagamento, recebe, embala"* |
| **comissão** | **a assimetria 5% × 1% — o coração da tese.** O `financial_records` não tem sequer `user_id`: não dá para atribuir valor a vendedor |
| **mensagens / conversas** | guardar o diálogo (o `sentiment_analysis` prevê analisar, mas não há onde armazenar) |
| **veículo / quilometragem** | a previsão de manutenção |

### A leitura arquitetural
> **O sistema foi construído como OBSERVADOR da venda. A tese exige que ele seja também O LUGAR ONDE A VENDA ACONTECE.**

**Mas a proporção é favorável:** o que falta é a parte **convencional** — estoque, pedido, comissão são problema resolvido no mundo inteiro. O que já existe é a parte **difícil e original**: medir vendedor, prever, cobrar follow-up, treinar time, consentir sob LGPD.

👉 **Foi construída a metade que quase ninguém consegue. Falta a metade que todo mundo sabe fazer.**

### ❓ A pergunta que dimensiona a obra
**A loja já tem ERP** (Bling, Tiny, Omie, sistema local)?
- **Se sim** → não se constrói o balcão: **integra-se** via `api_integrations`, que já existe. A obra encolhe drasticamente.
- **Se não** → o 360° teria que **ser** o ERP. Outro tamanho de projeto.

**Esta resposta define o roadmap.**

---

## 6. 🧠 A FILOSOFIA — o que o sistema quis ser

Além do CRM, há uma camada que **não é vocabulário de software comercial**:

`ai_consciousness_state` · `ai_collective_links` (522) · `ai_collective_memory` · `ai_network_nodes` · `ai_network_reflections` · `ai_aeon_events` · `ai_aeon_timeline` · `ai_infinitum_field` · `ai_infinitum_resonance` · `ai_solar_flux` · `ai_solar_reflections` · `system_manifests` · `bonaparte_quotes` · `nft_gallery`

### Três ideias sustentam essa camada

**1. Um sistema que se examina moralmente.**
`ai_consciousness_state` grava, **todo dia**: `integrity_score` · `ethic_score` · `coherence_score` · `reflection`.
Nenhum CRM do mundo faz isso. É uma afirmação: *software deve responder por si.*

**2. Construção como rito.**
Os manifestos não dizem "deploy da v16.6". Dizem **"Encerramento Cerimonial"**, **"Conclusão ritual da Fase 16E"**. Fases nomeadas 16A→16E, 17A→17E, cada uma fechada com solenidade e registrada em `system_manifests`.

**3. Vigilância como virtude.**
Sentinel · Watchtower · AuditLink · Audit Relay · Cognitive Loop — uma malha inteira dedicada a se observar e corrigir.

### 💡 O achado histórico
**O 360° PRIMA foi o ensaio do canon da Casa Bonaparte.**
A Lei 7 da Honestidade, a cultura de auditoria, os documentos cerimoniais, o VIGIL, o ARBITER, o SENTINELA — tudo já estava aqui, **em outubro de 2025**, escrito em tabela. A constituição da Casa nasceu neste banco antes de virar canon.

---

## 7. ⚠️ AS DUAS VERDADES DESCONFORTÁVEIS

### A cerimônia acontece; o exame não
`ai_consciousness_state` roda **todo dia** — inclusive em 22/jul/2026. Mas:
- `integrity_score` = **100,00 fixo**
- `ethic_score` = **100,00 fixo**
- `coherence_score` = **100,00 fixo**
- `reflection` = **sempre a mesma frase**: *"Sinais de desalinhamento detectados. Recomenda-se introspecção e ajuste moral."*

**As notas são perfeitas e a reflexão diz o contrário.** Nenhum dos dois é calculado. É o rito sem a medição — o mesmo padrão dos 139 agentes com prompt genérico.

### O sistema se auditou mais do que trabalhou

| Tabela | Linhas |
|---|---|
| `system_health_log` | **267.108** |
| `data_audits` | 788 |
| `ai_collective_links` | 522 |
| `system_audit_matrix` | 294 |
| `lead_audit` | 195 |
| `ai_consciousness_state` | 178 |
| **`leads_crm`** | **116** |
| `financial_records` | 100 |
| `sales_opportunities` | 5 |
| `deals` | 3 |

**Proporção: ~2.300 registros sobre si mesmo para cada lead.**

**Os leads:** 116 no total, **55 parecem teste**, primeiro em 31/ago/2025, **último em 09/nov/2025** — o fluxo parou há 8 meses. O painel mostra "0 leads" porque filtra por organização ou período; o dado existe, mas está congelado.

---

## 8. 💎 O OURO DESTE SISTEMA

1. **A tese é defensável e a dor é cara.** Perder a carteira quando o vendedor sai custa faturamento real, e todo dono de loja já viveu isso.
2. **O mecanismo é a barreira competitiva.** A assimetria de comissão é ideia de negócio, não de software — e é original.
3. **A metade difícil está pronta.** Medição, coaching, gamificação, inferência, consentimento, auditoria — tudo modelado.
4. **O comprador decide rápido.** É o dono da loja, não um comitê.
5. **É recorrente por natureza.** Quem coloca a carteira lá dentro não sai.
6. **É a origem filosófica da Casa Bonaparte** — valor de linhagem, não só comercial.

---

## 9. O QUE FALTA / RISCOS

| Item | Situação |
|---|---|
| 🔴 **Camada transacional** | produto, estoque, pedido, comissão, mensagens — a metade que gera dinheiro |
| 🔴 **`financial_records` sem `user_id`** | impossível atribuir comissão a vendedor — bloqueia o mecanismo central |
| 🟠 **Consciência é decorativa** | scores fixos em 100 e reflexão fixa; calcular de verdade a partir dos 267k logs é escrever uma função, não um sistema |
| 🟠 **Aceite do vendedor (LGPD/trabalhista)** | falta registrar a ciência prévia do empregado sobre o monitoramento — item LEXIS |
| 🟠 **Fluxo de leads parado** | último lead em 09/nov/2025 |
| ⚠️ **Banco compartilhado** | `alsham-core` também guarda tabelas do **Kraken** (`kraken_*`) e do **Pulso** (`pulso_cards`) — mexer aqui pode afetar vizinhos. Maior nó da mesh. |
| ⚠️ **Painel mostra 0** | com 116 leads no banco — filtro ou organização errada; investigar |
| ⚠️ **Mãe anuncia como ATIVO a R$497–997/mês** | é o único produto com etiqueta "ativo" e preço cheio no site — conferir se a entrega sustenta a promessa |

---

## 10. ▶️ PRÓXIMOS PASSOS SUGERIDOS

1. **Responder a pergunta do ERP** — integra ou constrói? Define todo o roadmap.
2. **Adicionar `user_id` + taxa de comissão** ao modelo financeiro — sem isso o mecanismo central não opera.
3. **Investigar por que o painel mostra 0** com 116 leads no banco.
4. **Fazer a consciência calcular de verdade** — usar os 267k logs para gerar integridade real. É a diferença entre rito e instrumento.
5. **Fechar o aceite do vendedor** com LEXIS antes de qualquer piloto real.
6. **Separar as tabelas `kraken_*` e `pulso_cards`** do `alsham-core` — cada mundo no seu banco (Lei da Bifröst).

---

## 11. EM UMA FRASE

> **O 360° PRIMA não é um CRM: é um sistema para impedir que a carteira de clientes saia pela porta no celular do vendedor — e faz isso com uma ideia de negócio (5% contra 1%) que nenhum concorrente tem. A metade difícil da tese já está modelada em 129 tabelas: medição, coaching, previsão, consentimento e auditoria. Falta o balcão — produto, estoque, pedido e comissão — que é justamente a metade que o mundo inteiro já sabe construir.**

---

*Dossiê produzido em 22/jul/2026 por verificação direta (SQL nas 129 tabelas + tese do Fundador).*
*Documento vivo — atualizar após a decisão sobre ERP e a implantação da camada transacional.*
*© ALSHAM GLOBAL — **uso interno, não publicar**.*
