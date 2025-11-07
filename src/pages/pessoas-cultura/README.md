# Módulo: pessoas-cultura

## 📍 Localização
- **Atual (React):** `src/pages/pessoas-cultura/`
- **Referência (HTML):** `legacy/html_pages/pessoas-cultura/`

## 📊 Páginas a migrar
Consulte `legacy/html_pages/pessoas-cultura/` para ver todas as páginas HTML deste módulo.

## 🎯 Como migrar uma página:

### 1. Consultar HTML de referência:
```bash
cat legacy/html_pages/pessoas-cultura/[nome-da-pagina].html
```

### 2. Criar componente React:
```bash
touch src/pages/pessoas-cultura/[NomeDaPagina].tsx
```

### 3. Estrutura básica:
```typescript
import React from 'react';

export default function NomeDaPagina() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Nome da Página
      </h1>
      
      {/* Conteúdo aqui */}
    </div>
  );
}
```

### 4. Adicionar rota:
Adicionar em `src/App.tsx` ou router config.

## ✅ Status de migração:
- [ ] Página 1
- [ ] Página 2
- [ ] Página 3
...
