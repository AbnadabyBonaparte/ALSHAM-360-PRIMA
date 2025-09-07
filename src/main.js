// src/main.js - Ponto de Entrada Principal (Padrão Obra-Prima 10/10)

// =========================================================================
// SCRIPTS GLOBAIS (Carregados em TODAS as páginas)
// =========================================================================
// 1. Autenticação e Proteção de Rotas: A primeira e mais importante tarefa.
import './js/auth.js';

// 2. Navegação Dinâmica: Garante um menu consistente em todo o sistema.
import './js/navigation.js';


// =========================================================================
// SCRIPTS ESPECÍFICOS DA PÁGINA (Carregados sob demanda)
// =========================================================================
// Esta técnica, chamada "Code Splitting", melhora drasticamente a performance,
// pois o navegador só baixa o código necessário para a página atual.

const path = window.location.pathname;

// Carrega o script do Dashboard
if (path.endsWith('/') || path.endsWith('/index.html')) {
    import('./js/dashboard.js');
}

// Carrega o script de Automações
if (path.endsWith('/automacoes.html')) {
    import('./js/automacoes.js');
}

// Carrega o script de Configurações
if (path.endsWith('/configuracoes.html')) {
    import('./js/configuracoes.js');
}

// Carrega o script de Gamificação
if (path.endsWith('/gamificacao.html')) {
    import('./js/gamificacao.js');
}

// Carrega o script de Leads
if (path.endsWith('/leads-real.html')) {
    import('./js/leads-real.js');
}

// Carrega o script de Relacionamentos
if (path.endsWith('/relacionamentos.html')) {
    import('./js/relacionamentos.js');
}

// As páginas de login e registro têm seus próprios scripts,
// mas poderiam ser adicionadas aqui se precisassem de lógica compartilhada.
// if (path.endsWith('/login.html')) { import('./js/login.js'); }
// if (path.endsWith('/register.html')) { import('./js/register.js'); }

console.log("🚀 ALSHAM 360° PRIMA - main.js carregado com sucesso!");
