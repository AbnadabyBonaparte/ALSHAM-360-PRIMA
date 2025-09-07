// src/main.js - Ponto de Entrada Principal (Padrão Obra-Prima 10/10)

/**
 * =========================================================================
 * MÓDULOS GLOBAIS
 * Carregados em TODAS as páginas para garantir a funcionalidade essencial.
 * =========================================================================
 */
import './js/auth.js';
import './js/navigation.js';

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

const currentPath = window.location.pathname;

// Carregador de Módulo
const loadModule = () => {
    const path = (currentPath === '/' || currentPath === '') ? '/' : currentPath;
    if (pageModules[path]) {
        pageModules[path]().catch(err => console.error(`Falha ao carregar o módulo para ${path}:`, err));
    }
};

loadModule();

console.log(`🚀 ALSHAM 360° PRIMA - Módulo para "${currentPath}" carregado.`);
