// -----------------------------------------------------------------------------
// reset-password.js
// ALSHAM 360° PRIMA — Solicitação de link de redefinição
// -----------------------------------------------------------------------------

import { supabase, createAuditLog } from '/src/lib/supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('📩 Reset password request page initialized');

  const form = document.getElementById('reset-form');
  const emailInput = document.getElementById('email');
  const msg = document.getElementById('reset-message');
  const errorMsg = document.getElementById('reset-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    msg.classList.add('hidden');
    errorMsg.classList.add('hidden');

    try {
      const email = emailInput.value.trim();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password-confirm.html`
      });

      if (error) throw error;

      msg.textContent = '📨 Enviamos um link para redefinição da sua senha.';
      msg.classList.remove('hidden');

      await createAuditLog('PASSWORD_RESET_REQUESTED', { email });
    } catch (err) {
      console.error('❌ Reset password request error:', err);
      errorMsg.textContent = err.message || 'Erro ao solicitar redefinição.';
      errorMsg.classList.remove('hidden');

      await createAuditLog('PASSWORD_RESET_REQUEST_FAILED', { error: err.message });
    }
  });
});
