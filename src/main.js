// src/main.js - Ponto de Entrada Principal (Padrão Obra-Prima 10/10 - Versão Refinada)

/**
 * =========================================================================
 * MÓDULOS GLOBAIS
 * Carregados em TODAS as páginas para garantir a funcionalidade essencial.
 * =========================================================================
 */

// CORREÇÃO CRÍTICA: Aponta para o local correto do navigation.js
import './components/navigation.js';

// O auth.js já está no local correto.
import './js/auth.js';


/**
 * =========================================================================
 * CARREGADOR DE MÓDULOS DE PÁGINA (CODE SPLITTING)
 * Carrega dinamicamente o script específico da página atual para máxima performance.
 * =========================================================================
 */

// Mapeamento centralizado de rotas para seus respectivos módulos.
const pageModules = {
    '/': () => import('./js/dashboard.js'),
    '/index.html': () => import('./js/dashboard.js'),
    '/automacoes.html': () => import('./js/automacoes.js'),
    '/configuracoes.html': () => import('./js/configuracoes.js'),
    '/gamificacao.html': () => import('./js/gamificacao.js'),
    '/leads-real.html': () => import('./js/leads-real.js'),
    '/relacionamentos.html': () => import('./js/relacionamentos.js'),
    '/login.html': () => import('./js/login.js'),
    '/register.html': () => import('./js/register.js'),
    '/relatorios.html': () => import('./js/relatorios.js'),
    '/leads.html': () => import('./js/leads.js')
};

// Obtém o caminho da página atual.
const currentPath = window.location.pathname;

// Procura e executa o carregador do módulo correspondente à página atual.
if (pageModules[currentPath]) {
    pageModules[currentPath]();
} else if (currentPath === '/' || currentPath === '') {
    // Fallback para o dashboard se o caminho for a raiz do domínio
    pageModules['/']();
}

console.log(`🚀 ALSHAM 360° PRIMA - Módulo para a página "${currentPath}" carregado.`);
