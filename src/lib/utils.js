// src/lib/utils.js

/**
 * Formata um valor numérico como moeda (Real Brasileiro).
 * @param {number} value - O valor a ser formatado.
 * @returns {string} O valor formatado como R$ 0,00.
 */
export function formatCurrency(value) {
    if (typeof value !== 'number') {
        return 'N/A';
    }
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

/**
 * Formata uma data (string ou objeto Date) para o formato dd/mm/aaaa.
 * @param {string|Date} dateString - A data a ser formatada.
 * @returns {string} A data formatada.
 */
export function formatDate(dateString) {
    if (!dateString) {
        return 'Data inválida';
    }
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
    } catch (error) {
        console.error("Erro ao formatar data:", dateString, error);
        return 'Data inválida';
    }
}

/**
 * Formata uma data para exibir o tempo relativo (ex: "há 5 minutos").
 * @param {string|Date} dateString - A data a ser formatada.
 * @returns {string} O tempo relativo formatado.
 */
export function formatTimeAgo(dateString) {
    if (!dateString) {
        return 'N/A';
    }
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) {
        return `há ${seconds} seg`;
    } else if (minutes < 60) {
        return `há ${minutes} min`;
    } else if (hours < 24) {
        return `há ${hours}h`;
    } else {
        return `há ${days}d`;
    }
}
