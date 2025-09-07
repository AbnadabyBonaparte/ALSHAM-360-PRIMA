// src/main.js - Ponto de Entrada Principal (Versão com Caminhos Simplificados)

// Módulos Globais
import './js/auth.js';
import './js/navigation.js'; // Agora assume que navigation.js está em /js/

// Mapeamento de Módulos de Página
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
    if (pageModules[currentPath]) {
        pageModules[currentPath]();
    } else if (currentPath === '/' || currentPath === '') {
        pageModules['/']();
    }
};

loadModule();

console.log(`🚀 ALSHAM 360° PRIMA - Módulo para "${currentPath}" carregado.`);
