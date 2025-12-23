# 🚨 ALSHAM 360° PRIMA — REGRAS INVIOLÁVEIS (LEIA PRIMEIRO!)

**Versão:** 1.0  
**Status:** IMPERATIVO / NÃO-NEGOCIÁVEL  
**Prioridade:** MÁXIMA — LEIA ANTES DE QUALQUER AÇÃO  

---

## ⛔ AVISO CRÍTICO

Este documento contém **REGRAS ABSOLUTAS** que devem ser seguidas em **100% dos casos**, sem exceção. Qualquer violação destas regras resultará em retrabalho e será considerada falha grave.

---

## 🔴 REGRA #1: TUDO DEVE SER 100% REAL

### O que significa "100% REAL":

| ✅ CORRETO | ❌ PROIBIDO |
|------------|-------------|
| Dados vindo do Supabase | Dados hardcoded no código |
| Queries reais às tabelas | Arrays mockados |
| CRUD funcional conectado | Funções que retornam dados falsos |
| Estados baseados em dados reais | Estados simulados |
| Filtros que funcionam de verdade | Filtros visuais sem função |
| Paginação server-side real | Paginação fake no frontend |

### Exemplos PROIBIDOS:

```tsx
// ❌❌❌ ABSOLUTAMENTE PROIBIDO ❌❌❌

// Mock data
const mockContacts = [
  { id: 1, name: 'João Silva', email: 'joao@example.com' },
  { id: 2, name: 'Maria Santos', email: 'maria@example.com' },
]

// Dados fake
const FAKE_DATA = [...]
const DUMMY_DATA = [...]
const SAMPLE_DATA = [...]
const EXEMPLO_DATA = [...]

// Placeholder content
const contacts = [] // TODO: integrar com Supabase

// Funções que não fazem nada
const handleSave = () => {
  console.log('TODO: implementar')
}

// Comentários indicando incompletude
// MOCK - remover depois
// PLACEHOLDER
// COMING SOON
// EM CONSTRUÇÃO
// TODO: conectar ao banco
```

### Exemplos CORRETOS:

```tsx
// ✅✅✅ ASSIM DEVE SER ✅✅✅

// Dados reais do Supabase
const [contacts, setContacts] = useState<Contact[]>([])

useEffect(() => {
  async function fetchContacts() {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('org_id', currentOrgId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    setContacts(data || [])
  }
  fetchContacts()
}, [currentOrgId])

// CRUD funcional
const handleSave = async (formData: ContactForm) => {
  const { data, error } = await supabase
    .from('contacts')
    .insert({
      ...formData,
      org_id: currentOrgId,
      created_by: user?.id
    })
    .select()
    .single()
  
  if (error) {
    toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    return
  }
  
  toast({ title: 'Sucesso', description: 'Contato criado!' })
  refetch()
}
```

---

## 🔴 REGRA #2: ZERO PLACEHOLDERS

### Páginas "Under Construction" são PROIBIDAS

Se uma página não pode ser implementada completamente agora, ela **NÃO DEVE EXISTIR** no menu ou nas rotas.

| Situação | Ação Correta |
|----------|--------------|
| Funcionalidade não está pronta | NÃO adicionar no menu |
| Tabela do Supabase não existe | CRIAR a tabela primeiro |
| Não sabe como implementar | PERGUNTAR antes de criar placeholder |
| Falta tempo | Implementar depois, não criar vazio |

### PROIBIDO criar arquivos assim:

```tsx
// ❌ src/pages/Contacts.tsx
export default function Contacts() {
  return (
    <div className="p-6">
      <h1>Contatos</h1>
      <p>Em construção...</p>
      {/* TODO: implementar */}
    </div>
  )
}
```

---

## 🔴 REGRA #3: BANCO DE DADOS PRIMEIRO

### Antes de criar qualquer página, GARANTIR:

1. **Tabela existe no Supabase** com todos os campos necessários
2. **RLS Policies** configuradas (filtrar por org_id)
3. **Indexes** criados para performance
4. **Triggers** configurados (updated_at, etc.)

### Checklist obrigatório:

```sql
-- ANTES de criar a página, verificar/criar:

-- 1. Tabela existe?
SELECT * FROM information_schema.tables 
WHERE table_name = 'contacts';

-- 2. Campos corretos?
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contacts';

-- 3. RLS ativa?
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'contacts';

-- 4. Policies existem?
SELECT * FROM pg_policies 
WHERE tablename = 'contacts';
```

### Se a tabela NÃO EXISTE:

```sql
-- CRIAR TABELA PRIMEIRO!
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  tags TEXT[],
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "org_isolation" ON contacts
  FOR ALL USING (org_id IN (
    SELECT org_id FROM user_organizations 
    WHERE user_id = auth.uid()
  ));

-- Index
CREATE INDEX idx_contacts_org_id ON contacts(org_id);

-- Trigger updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔴 REGRA #4: MODO DEMO É SEPARADO

### Entenda a arquitetura:

```
📁 PRODUÇÃO (app.alshamglobal.com.br)
├── Dados REAIS do cliente
├── Supabase PRODUÇÃO
├── Multi-tenant com org_id
└── 100% funcional

📁 DEMO (demo.alshamglobal.com.br) ← SERÁ CRIADO DEPOIS
├── Dados de demonstração
├── Supabase SEPARADO ou seed data
├── Org específica para demo
└── Reset automático periódico
```

### O que isso significa:

| Ambiente | Dados | Quando criar |
|----------|-------|--------------|
| **Produção** | 100% REAIS | AGORA |
| **Demo** | Dados de exemplo | DEPOIS de tudo pronto |

### NUNCA misturar:

```tsx
// ❌ PROIBIDO - Condicional para mostrar dados fake
const contacts = isDemoMode ? MOCK_CONTACTS : realContacts

// ❌ PROIBIDO - Flag para dados de teste
if (process.env.VITE_DEMO_MODE) {
  return fakeDashboardData
}

// ✅ CORRETO - Sempre dados reais
const { data: contacts } = await supabase
  .from('contacts')
  .select('*')
  .eq('org_id', currentOrgId)
```

---

## 🔴 REGRA #5: ESTADOS OBRIGATÓRIOS

Toda página DEVE ter tratamento para:

### 1. Estado de LOADING
```tsx
if (loading) {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
```

### 2. Estado de ERRO
```tsx
if (error) {
  return (
    <Card className="m-6 border-[var(--accent-alert)]/30">
      <CardContent className="p-6">
        <p className="text-[var(--accent-alert)]">Erro: {error.message}</p>
        <Button variant="outline" onClick={refetch}>
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 3. Estado VAZIO (dados reais, mas zero registros)
```tsx
if (data.length === 0) {
  return (
    <EmptyState
      icon={Users}
      title="Nenhum contato encontrado"
      description="Comece adicionando seu primeiro contato."
      action={
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Criar Contato
        </Button>
      }
    />
  )
}
```

### 4. Estado de SUCESSO (dados reais carregados)
```tsx
// Renderizar tabela/cards com dados REAIS do Supabase
return (
  <Table>
    {data.map(contact => (
      <TableRow key={contact.id}>
        {/* Dados REAIS */}
      </TableRow>
    ))}
  </Table>
)
```

---

## 📋 CHECKLIST PRÉ-COMMIT

Antes de fazer commit de QUALQUER código, verificar:

- [ ] **Zero mock data** no código
- [ ] **Zero placeholders** ou "TODO: implementar"
- [ ] **Zero comentários** indicando incompletude
- [ ] **Tabela existe** no Supabase
- [ ] **RLS configurado** na tabela
- [ ] **Queries filtram** por org_id
- [ ] **CRUD funciona** de verdade
- [ ] **Estados tratados** (loading, error, empty, success)
- [ ] **Toast notifications** para feedback
- [ ] **Build passa** sem erros

---

## 🚫 PALAVRAS PROIBIDAS NO CÓDIGO

Se o código contiver QUALQUER uma destas palavras, está ERRADO:

```
mock
fake
dummy
sample
exemplo
placeholder
TODO
FIXME
coming soon
em construção
under construction
não implementado
remover depois
temporary
temp
test data
dados de teste
```

### Comando para verificar:

```bash
# Rodar antes de cada commit
grep -rni "mock\|fake\|dummy\|placeholder\|TODO\|coming.soon\|em.construção" src/pages/
```

Se retornar QUALQUER resultado, **NÃO FAZER COMMIT**.

---

## 🎯 RESUMO EXECUTIVO

| Regra | Descrição |
|-------|-----------|
| #1 | Tudo 100% real - dados do Supabase |
| #2 | Zero placeholders - página existe ou não existe |
| #3 | Banco primeiro - tabela antes de página |
| #4 | Demo separado - será criado depois |
| #5 | Estados obrigatórios - loading, error, empty, success |

---

## ⚠️ CONSEQUÊNCIAS DE VIOLAÇÃO

Se estas regras forem violadas:

1. **Código será rejeitado** no review
2. **Retrabalho garantido** 
3. **Atraso no cronograma**
4. **Dívida técnica** acumulada

---

## 🔥 LEMBRETE FINAL

> **"Não existe 'depois eu arrumo'. Existe CERTO ou ERRADO."**

> **"Mock data é a mentira que você conta para si mesmo."**

> **"Se não está conectado ao Supabase, não existe."**

---

**Autor:** ALSHAM Engineering  
**Versão:** 1.0  
**Data:** 2025-12-19  
**Status:** IMPERATIVO — CUMPRA OU JUSTIFIQUE
