import './commands.js';
import { applySupabaseStubs } from './supabase-stubs.js';

Cypress.on('window:before:load', win => {
  applySupabaseStubs(win);
});
