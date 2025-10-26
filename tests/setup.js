import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';

beforeEach(() => {
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
  document.documentElement.classList.remove('dark');
});

afterEach(() => {
  document.body.innerHTML = '';
});
