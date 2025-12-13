# ALSHAM 360° PRIMA — Theme System Canonical (SSOT) v1.0
**Status:** Canonical / Mandatory  
**Owner:** Frontend Architecture (ALSHAM)  
**Last updated:** 2025-12-13  
**Scope:** Theme tokens, runtime injection, CSS consumption, governance, QA

---

## 1. Objective
This document defines the **single canonical architecture** for theming in ALSHAM 360° PRIMA.

Goals:
- Eliminate duplicated theme definitions (CSS vs TS).
- Prevent silent visual regressions.
- Ensure deterministic theme behavior (no “half-theme changed” issues).
- Keep Tailwind-compatible layering and predictable overrides.
- Prepare the foundation for future advanced features (theme generator, previews, experiments).

This document is the **source of truth** for any current/future developer touching theming.

---

## 2. Core Principle
### SSOT — Single Source of Truth
> All theme definitions live in TypeScript (`themes.ts`).  
> CSS does not define themes. CSS only **consumes** injected variables.

---

## 3. Canonical Architecture (High Level)

themes.ts (SSOT)
  ↓
theme-variables.ts (public contract / adapter)
  ↓
useTheme.ts (runtime injection + switching + persistence)
  ↓
CSS (consumer: base/components/utilities) + theme-tokens.css (transitions/warp)

---

## 4. File Responsibilities (Non-Negotiable)

### 4.1 `src/lib/themes.ts` — SSOT (Canonical Theme Data)
Responsibilities:
- Define all themes and theme keys.
- Own the `Theme` and `ThemeKey` typing.
- Own `theme.colors` shape.

Rules:
- ✅ All new themes are created here.
- ❌ CSS is forbidden from creating per-theme token sets.
- ❌ Hooks are forbidden from inventing new token names.

---

### 4.2 `src/lib/theme-variables.ts` — Public Contract (Adapter)
Responsibilities:
- Convert `theme.colors.*` into stable CSS custom properties (variables).
- Define the official “contract” between runtime and CSS.

Rules:
- Variables names here are treated as a public API.
- Changes here can be breaking. If changed, update this document and run full QA.

---

### 4.3 `src/hooks/useTheme.ts` — Single Runtime Authority
Responsibilities:
- Apply `data-theme` on `<html>`.
- Set `color-scheme` properly.
- Inject CSS variables into `:root` (documentElement).
- Handle transition state (`theme-switching`) and timers.
- Persist theme to localStorage.

Rules:
- No other place may apply theme variables to the DOM.
- Theme switching logic must remain centralized here.

---

### 4.4 `src/styles/theme-tokens.css` — Transitions & Accessibility Only
Responsibilities:
- Define transition timing (`--theme-dur`, `--theme-ease`).
- Provide optional warp animation for theme switching.
- Respect `prefers-reduced-motion`.

Rules:
- Must not define color palettes.
- Must not define per-theme overrides.

---

### 4.5 `src/styles/themes.css` — CSS Consumer (Base + Components + Utilities)
Responsibilities:
- Typography tokens (font size/weight/line heights).
- Base application styles (html/body/#root background/text using injected variables).
- Component styles that consume injected variables (buttons, etc.).
- Utility classes that consume variables.

Rules:
- ✅ Allowed: `:root` fallback minimal tokens for legibility if JS fails.
- ❌ Forbidden: any `[data-theme="..."] { ... }` blocks defining token sets.
- ❌ Forbidden: duplicating theme tokens that exist in TS/injection.

---

## 5. Canonical Variable Contract (Minimum Required)
Runtime must guarantee these variables exist (fallbacks must exist in CSS):
- `--bg`
- `--text`

The following are consumed by gradients/buttons:
- `--color-primary-from`, `--color-primary-to`, `--color-primary-hover-from`, `--color-primary-hover-to`
- `--color-secondary-from`, `--color-secondary-to`, `--color-secondary-hover-from`, `--color-secondary-hover-to`
- `--color-success-from`, `--color-success-to`, `--color-success-hover-from`, `--color-success-hover-to`
- `--color-warning-from`, `--color-warning-to`, `--color-warning-hover-from`, `--color-warning-hover-to`
- `--color-error-from`, `--color-error-to`, `--color-error-hover-from`, `--color-error-hover-to`
- `--color-info-from`, `--color-info-to`, `--color-info-hover-from`, `--color-info-hover-to`

Note:
- Advanced tokens (surfaces/borders/glows/gradients) can exist, but MUST be mapped in `theme-variables.ts`.

---

## 6. Fallback (JS Off / Runtime Failure)
We must keep a **minimal fallback** in CSS so the UI remains legible if JS fails.

Required fallback pattern:
```css
:root{
  --bg: #0f172a;
  --text: rgba(255,255,255,0.96);
  --color-primary-from: #10b981;
  --color-primary-to: #14b8a6;
  color-scheme: dark;
}
html, body, #root{
  background: var(--bg);
  color: var(--text);
  min-height: 100%;
}
7. Import Order (Critical)
Single global import location (recommended src/index.css or global stylesheet):

Tailwind base/components/utilities

src/styles/theme-tokens.css

src/styles/themes.css

Never import theme CSS inside React components.

8. Migration Plan (Approved Workflow)
Commit 1 — Safe Introduction
Goal: introduce SSOT + runtime injection without changing visuals.

Ensure themes.ts and theme-variables.ts are in place.

Ensure useTheme.ts injects variables and handles theme-switching.

Keep any old CSS [data-theme] blocks ONLY temporarily if needed for safety.

Commit 2 — Remove Duplication (Mandatory)
Goal: eliminate all duplicated theme definitions in CSS.

Remove ALL [data-theme="..."] { ... } blocks from themes.css.

Keep only fallback :root minimal and consumer styles.

Run QA checklist across critical pages.

9. QA Checklist (Mandatory)
Functional
Theme persists after refresh (localStorage).

<html data-theme="..."> updates correctly.

color-scheme matches theme (light/dark).

Rapid theme switching does not break transition state.

prefers-reduced-motion disables warp animation.

Visual
No white flash on load or switch.

Buttons and gradients reflect theme immediately.

Inputs / scrollbars consistent in light/dark.

Text contrast remains acceptable.

Technical
No console errors during theme switch.

No duplicated token definitions (TS + CSS conflict).

Build/lint passes.

10. Governance Rules (To Prevent Future Chaos)
Add/modify theme → only src/lib/themes.ts

Add/modify CSS variable contract → only src/lib/theme-variables.ts

Apply theme → only src/hooks/useTheme.ts

CSS must never define per-theme token sets

Any structural change requires updating this document

11. Operational “Definition of Done”
This system is considered DONE when:

themes.css contains zero [data-theme="..."] token blocks

runtime injection drives every theme consistently

fallback ensures legible UI without JS

theme switching warp works and respects accessibility settings

12. Roadmap (Post-Foundation)
Once foundation is stable, we can safely build:

Theme generator (image → palette → theme)

Enhanced preview (live swatches / device frames)

Experimentation (A/B testing theme variants)

Marketplace (optional)

These are out of scope for v1.0 and must not compromise SSOT.

13. Current Action Items (What We Do Next)
Update src/styles/themes.css to be a pure consumer:

Remove [data-theme] blocks

Keep fallback :root

Keep typography + components + utilities

Confirm global import order:

theme-tokens.css before themes.css

Run QA checklist on critical pages:

Dashboard, Settings, Leads, Boardroom

yaml
Copiar código

---

## Resposta direta: “Nosso plano está 100% redondo?”
**Sim — o plano está redondo como arquitetura.**  
O único ponto que ainda precisava “fechar” (e é o seu próximo passo) é: **finalizar o `themes.css` como consumidor puro** removendo os blocos `[data-theme]`. Isso é execução do plano, não uma decisão nova.

## Preciso consultar o time mais alguma coisa?
Não para decidir arquitetura. Só para:
- aprovar o PR (processo)
- rodar o checklist de QA (responsabilidade compartilhada)

---

## “Tudo que você está fazendo está seguindo esses arquivos?”
Sim: a estratégia está desenhada exatamente em cima do trio:
- `themes.ts` (SSOT)  
- `theme-variables.ts` (contrato)  
- `useTheme.ts` (runtime)

E os CSS ficam como:
- `theme-tokens.css` (animação/acessibilidade)  
- `themes.css` (consumo + fallback)

---

## Próximo passo (sem conversa paralela)
Se você quiser, eu já te mando **a versão final do `src/styles/themes.css` “consumer-only”**, pronta para colar (sem `[data-theme]`), alinhada ao seu `injectThemeVariables()`.

Diga apenas: **“manda o themes.css final consumer-only”** e eu devolvo o arquivo completo.
::contentReference[oaicite:0]{index=0}
