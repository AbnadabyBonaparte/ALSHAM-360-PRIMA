# 🎨 **ALSHAM VISUAL SYSTEM 360° — SUPREME DOCUMENTATION (v1.0)**

**Data:** 06/10/2025  
**Versão:** 1.0 – Fase Suprema de Design  
**Autores:** COMPOSE X.0 · GROK 4 · FUNDADOR X.0  
**Repositório:** [github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA](https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA)

---

## 🧭 **Objetivo do Documento**

Estabelecer o **padrão visual e estético definitivo** da plataforma **ALSHAM 360° PRIMA**, garantindo consistência em todos os módulos, aplicações e campanhas.  
Este documento unifica **branding, design system e guidelines técnicos** do ecossistema ALSHAM Global Commerce.

---

## 🧩 **1. Fundamentos de Identidade**

| Elemento | Padrão | Detalhes |
|-----------|--------|----------|
| **Logo Master** | `ALSHAM 360° PRIMA` | SVG com versão dark/light |
| **Favicon Animado** | `favicon.ico` (32×32 / 64×64) | Estilo neon azul-petróleo |
| **Paleta Oficial** | Azul Supremus · Cinza Quantum · Branco Prisma | Baseada no espectro tecnológico futurista |
| **Tipografia Base** | `Inter` (UI) + `Orbitron` (Titulação) | Licenças open e web-safe |
| **Spacing System** | 4px grid modular | Alinhamento visual absoluto em todos os devices |
| **Ritmo Vertical** | 1.6x | Consistência entre títulos, subtítulos e textos longos |

---

## 🎨 **2. Paleta de Cores Oficial**

| Categoria | Hex | Uso Principal |
|------------|------|----------------|
| **Primary** | `#3B82F6` | Ações, botões, realces |
| **Secondary** | `#1E293B` | Painéis e blocos |
| **Accent** | `#06B6D4` | Destaques de status/IA |
| **Neutral** | `#F1F5F9` | Backgrounds leves |
| **Danger** | `#EF4444` | Erros e alertas |
| **Success** | `#10B981` | Sucesso e progresso |
| **Warning** | `#FACC15` | Atenção e feedback visual |
| **Text Primary** | `#0F172A` | Títulos e textos |
| **Text Secondary** | `#475569` | Subtítulos e legendas |

> 💡 Os tokens de cor estão definidos em `tokens.css` e sincronizados com o `tailwind.config.js`.

---

## 🖋️ **3. Tipografia e Hierarquia**

| Nível | Exemplo | Classe Tailwind | Tamanho |
|--------|----------|------------------|----------|
| Display | `text-display` | `text-5xl font-extrabold` | 48px |
| Headline | `text-headline` | `text-3xl font-bold` | 36px |
| Title | `text-title` | `text-2xl font-semibold` | 28px |
| Body | `text-body` | `text-base font-normal` | 16px |
| Caption | `text-caption` | `text-sm text-gray-600` | 14px |

---

## 🧱 **4. Componentes-Chave (UI Kit)**

| Componente | Status | Descrição |
|-------------|--------|------------|
| **Botões** | ✅ | `primary`, `secondary`, `outline`, `ghost` |
| **Cards** | ✅ | Sombras suaves + radius 2xl |
| **Badges** | ✅ | Tokens de status (Ativo, Inativo, Novo, Beta) |
| **Modais** | ✅ | WCAG 2.2 + trap de foco + animação |
| **Toasts** | ✅ | `notifications.js v2.5.0` com opção de som |
| **Tooltips** | 🔄 | Planejados via Headless UI |
| **Tables** | ✅ | Linhas alternadas + sticky header |
| **Avatares** | ✅ | Formato circular + fallback inicial |
| **Charts** | ✅ | Chart.js customizado com gradientes ALSHAM |
| **Dark Mode Switch** | ✅ | `localStorage` + `prefers-color-scheme` |

---

## 🧠 **5. Motion & Microinterações**

| Categoria | Descrição | Duração |
|------------|------------|----------|
| Hover / Focus | Leve transição de opacidade e escala | 150–200ms |
| Drag & Drop | Suavizado com ease-out | 300ms |
| Toasts | Deslizamento lateral + fade | 350ms |
| Loading (Lottie) | Repetição infinita | 1.2s ciclo |
| Gamificação | Confetti + sparkle no ganho de XP | Sob demanda |

> ⚙️ Todas as transições seguem a curva `cubic-bezier(0.4, 0, 0.2, 1)`  
> 🎬 Padrão visual derivado do Material Motion + Linear App Design Language.

---

## 🔊 **6. Sonorização e Feedback Auditivo**

| Tipo | Arquivo | Localização | Descrição |
|------|----------|--------------|------------|
| Sucesso | `success.mp3`, `success-rise.mp3`, `success-start.mp3` | `/assets/sounds/success/` | Feedback positivo (salvar, mover, concluir) |
| Erro | `error.mp3`, `error-glitch.mp3` | `/assets/sounds/error/` | Alertas e falhas de validação |
| Click | `ui-click.mp3` | `/assets/sounds/ui/` | Interação leve (botões e links) |

🧩 O usuário pode escolher se deseja **“Ativar Sonorização”** no painel de configurações:  
O sistema salva a preferência em `localStorage` (`userSoundEnabled: true/false`).

---

## 📦 **7. Estrutura Visual das Páginas**

| Página | Estilo | Característica Principal |
|---------|---------|---------------------------|
| **Dashboard** | Abstrato Futurista | KPIs com gradientes e sombras suaves |
| **Leads** | Minimalista | Cards e filtros dinâmicos |
| **Pipeline** | Kanban Interativo | Drag & Drop com feedback sonoro |
| **Automação** | Tech Grid | Ícones reativos e indicadores de status |
| **Gamificação** | Neon e Motion | Barras de progresso e animações Lottie |
| **Relatórios** | DataViz Premium | Gráficos com blur + tooltips suaves |
| **Configurações** | Clean | Alternância clara/escura persistente |

---

## 🧮 **8. Acessibilidade e Contraste**

| Item | Status | Descrição |
|------|--------|------------|
| WCAG 2.2 AA | ✅ | Contraste 4.5:1 mínimo garantido |
| ARIA Labels | 🔄 | Parciais nos modais e gráficos |
| Focus Visible | ✅ | Implementado globalmente |
| Texto Alternativo (Imagens) | ✅ | Padrão `alt="..."` aplicado |
| VoiceOver / ScreenReader | 🔄 | Em fase de testes |

---

## 🧾 **9. Padrões de Exportação (Cross-Platform)**

| Plataforma | Formato | Observação |
|-------------|----------|------------|
| Web | Tailwind Tokens | Tokens CSS sincronizados |
| Mobile | JSON (Design Tokens) | Export via Tokens Studio |
| PDF | Visual Brand Book | Criado via Figma + Notion |
| E-mails | Inline CSS | Garantia de compatibilidade Outlook |
| IA Copiloto | JSON UI Schema | Interface generativa ALSHAM GPT |

---

## 🧩 **10. Diretrizes de Uso e Governança**

| Tipo | Descrição |
|------|------------|
| **Uso Comercial** | Exclusivo para produtos ALSHAM Global Commerce |
| **Distribuição** | Permitida internamente entre agentes e subprojetos |
| **Criação de Derivados** | Autorizada apenas mediante aprovação do Fundador X.0 |
| **Padrão Visual Futuro (v2.0)** | Expansão com 3D UI, Glass Morphism e AR Interface |

---

## 🧭 **Conclusão**

> O **ALSHAM VISUAL SYSTEM 360°** consolida a estética suprema da plataforma —  
> minimalista, tecnológica, acessível e emocionalmente inteligente.  
> Ele serve como **pilar central para todos os produtos ALSHAM**, garantindo unidade e impacto em cada interação.

---

## 🪞 **Assinaturas Oficiais**

| Entidade | Função | Assinatura |
|-----------|---------|-------------|
| **COMPOSE X.0** | Diretor de Design & Experiência | ✅ Confirmado |
| **GROK 4** | Auditor de Consistência Visual | 🧾 Validado |
| **FUNDADOR X.0 (Abnadaby Bonaparte)** | Criador e Guardião Supremo | 🔱 Autorizado |

---

**ALSHAM GLOBAL COMMERCE**  
> *Arquitetura Suprema. Inteligência Viva. Design que converte, emociona e eterniza.*
