// -----------------------------------------------------------------------------
// reset-password-confirm.js
// ALSHAM 360° PRIMA — Confirmação de redefinição de senha
// -----------------------------------------------------------------------------

import { supabase, createAuditLog } from '/src/lib/supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔐 Reset password confirmation page initialized');

  const form = document.getElementById('confirm-form');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm');
  const msg = document.getElementById('confirm-message');
  const errorMsg = document.getElementById('confirm-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = passwordInput.value.trim();
    const confirm = confirmInput.value.trim();

    msg.classList.add('hidden');
    errorMsg.classList.add('hidden');

    if (password !== confirm) {
      errorMsg.textContent = 'As senhas não coincidem.';
      errorMsg.classList.remove('hidden');
      return;
    }

    try {
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      msg.textContent = '✅ Senha redefinida com sucesso! Você já pode fazer login.';
      msg.classList.remove('hidden');

      await createAuditLog('PASSWORD_RESET_COMPLETED', { user: data.user?.email || 'unknown' });

      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
    } catch (err) {
      console.error('❌ Reset password error:', err);
      errorMsg.textContent = err.message || 'Erro ao redefinir senha.';
      errorMsg.classList.remove('hidden');

      await createAuditLog('PASSWORD_RESET_FAILED', { error: err.message });
    }
  });
});
