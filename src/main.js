// src/main.js - Ponto de Entrada Principal (Com Caminhos Corrigidos)

/**
 * =========================================================================
 * MÓDULOS GLOBAIS
 * Carregados em TODAS as páginas para garantir a funcionalidade essencial.
 * =========================================================================
 */

// CORREÇÃO: O caminho para navigation.js foi ajustado para apontar para a pasta 'components'.
import './components/navigation.js';

// O auth.js já estava no local correto.
import './js/auth.js';


/**
 * =========================================================================
 * CARREGADOR DE MÓDULOS DE PÁGINA (CODE SPLITTING)
 * =========================================================================
 */

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

if (pageModules[currentPath]) {
    pageModules[currentPath]();
} else if (currentPath === '/' || currentPath === '') {
    pageModules['/']();
}

console.log(`🚀 ALSHAM 360° PRIMA - Módulo para a página "${currentPath}" carregado.`);
