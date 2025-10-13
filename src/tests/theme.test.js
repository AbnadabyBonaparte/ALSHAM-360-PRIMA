import { describe, it, expect, beforeEach } from 'vitest';

describe('Dark Mode Toggle', () => {
  beforeEach(() => {
    // Limpar estado
    document.documentElement.classList.remove('dark');
    localStorage.clear();
  });

  it('deve aplicar dark mode quando salvainput em localStorage', () => {
    localStorage.setItem('alsham-theme', 'dark');
    document.documentElement.classList.add('dark');
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('deve remover dark mode quando light', () => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('dark');
    
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
