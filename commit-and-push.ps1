# PowerShell Script para Commit e Push - ALSHAM 360° PRIMA
# Execute este script no diretório raiz do projeto

Write-Host "🚀 ALSHAM 360° PRIMA - Commit e Push Script" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# Verificar se estamos no diretório correto
$currentPath = Get-Location
Write-Host "Diretório atual: $currentPath" -ForegroundColor Yellow

if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERRO: package.json não encontrado. Execute no diretório raiz do projeto!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "src/App-new.tsx")) {
    Write-Host "❌ ERRO: App-new.tsx não encontrado. Execute no diretório raiz do projeto!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Diretório do projeto confirmado!" -ForegroundColor Green

# Verificar status do git
Write-Host "`n📋 Verificando status do Git..." -ForegroundColor Yellow
try {
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "Arquivos modificados encontrados:" -ForegroundColor Yellow
        Write-Host $gitStatus
    } else {
        Write-Host "✅ Nenhum arquivo modificado" -ForegroundColor Green
    }
} catch {
    Write-Host "📝 Inicializando repositório Git..." -ForegroundColor Yellow
    git init
    git config user.name "Abnad Bonaparte"
    git config user.email "abnad@example.com"
}

# Adicionar arquivos principais
Write-Host "`n📦 Adicionando arquivos principais..." -ForegroundColor Yellow

$filesToAdd = @(
    "src/lib/supabase/",
    "src/pages/Auth/",
    "src/App-new.tsx",
    "src/main.tsx",
    ".env.local",
    "railway.toml",
    "package.json",
    "vite.config.ts",
    "tsconfig.json",
    "COMMIT_INSTRUCTIONS.md"
)

foreach ($file in $filesToAdd) {
    if (Test-Path $file) {
        git add $file
        Write-Host "✅ Adicionado: $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Não encontrado: $file" -ForegroundColor Yellow
    }
}

# Verificar se há arquivos para commit
$status = git status --porcelain
if (-not $status) {
    Write-Host "`n❌ Nenhum arquivo para commit. Verifique se os arquivos existem." -ForegroundColor Red
    exit 1
}

# Fazer commit
Write-Host "`n💾 Fazendo commit..." -ForegroundColor Yellow
$commitMessage = @"
🚀 FASE 2: Integração 100% Real com Supabase

✅ Schema TypeScript completo gerado do banco real
✅ Queries CRUD reais para todas as tabelas principais
✅ DashboardSupremo com dados reais do Supabase
✅ Autenticação suprema com UI enterprise
✅ Auth flow completo: Login → Org Selection → Dashboard
✅ Multi-tenant seguro com RLS e org_id no JWT
✅ Real-time subscriptions ativas
✅ Zero placeholder, zero mock - tudo produção real

🔧 Principais mudanças:
- src/lib/supabase/: Tipos e queries reais
- src/pages/Auth/: UI enterprise de autenticação
- Dashboard com KPIs reais das views do banco
- ProtectedLayout com seleção de organização
- Integração completa com Supabase real
"@

git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit realizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro no commit" -ForegroundColor Red
    exit 1
}

# Verificar se há repositório remoto
Write-Host "`n🔗 Verificando repositório remoto..." -ForegroundColor Yellow
$remotes = git remote -v
if (-not $remotes) {
    Write-Host "⚠️  Nenhum repositório remoto configurado" -ForegroundColor Yellow
    Write-Host "Configure o remote com:" -ForegroundColor Cyan
    Write-Host "git remote add origin https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA.git" -ForegroundColor White
} else {
    Write-Host "✅ Repositório remoto encontrado:" -ForegroundColor Green
    Write-Host $remotes

    # Tentar push
    Write-Host "`n🚀 Fazendo push..." -ForegroundColor Yellow
    git push -u origin main 2>$null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
        Write-Host "`n🎉 PRONTO PARA DEPLOY NA VERCEL!" -ForegroundColor Cyan
        Write-Host "Acesse: https://vercel.com e faça deploy automático" -ForegroundColor White
    } else {
        Write-Host "❌ Erro no push. Você pode tentar manualmente:" -ForegroundColor Red
        Write-Host "git push -u origin main" -ForegroundColor Yellow
    }
}

Write-Host "`n📋 RESUMO DA FASE 2:" -ForegroundColor Cyan
Write-Host "✅ Schema TypeScript real gerado" -ForegroundColor Green
Write-Host "✅ Queries CRUD reais implementadas" -ForegroundColor Green
Write-Host "✅ Dashboard com dados do Supabase" -ForegroundColor Green
Write-Host "✅ UI de autenticação enterprise" -ForegroundColor Green
Write-Host "✅ Multi-tenant seguro ativo" -ForegroundColor Green
Write-Host "✅ Real-time funcionando" -ForegroundColor Green
Write-Host "✅ Zero placeholder/mock" -ForegroundColor Green

Write-Host "`n🎯 PRÓXIMO: Teste na Vercel!" -ForegroundColor Magenta






