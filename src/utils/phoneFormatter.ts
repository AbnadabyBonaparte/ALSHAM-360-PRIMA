// src/utils/phoneFormatter.ts

/**
 * Formata número de telefone brasileiro para WhatsApp
 * Adiciona +55 se necessário e remove caracteres especiais
 */
export function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  
  // Remove tudo que não é número
  let clean = phone.replace(/\D/g, '');
  
  // Se não tem código do país, adiciona +55
  if (!clean.startsWith('55')) {
    clean = '55' + clean;
  }
  
  return clean;
}

/**
 * Formata número para exibição (11) 98765-4321
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';
  
  const clean = phone.replace(/\D/g, '');
  
  // (11) 98765-4321
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  
  // (11) 8765-4321
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  
  return phone;
}

/**
 * Valida se é um número de telefone brasileiro válido
 */
export function isValidBrazilianPhone(phone: string): boolean {
  if (!phone) return false;
  
  const clean = phone.replace(/\D/g, '');
  
  // Deve ter 10 ou 11 dígitos (com DDD)
  return clean.length === 10 || clean.length === 11;
}
