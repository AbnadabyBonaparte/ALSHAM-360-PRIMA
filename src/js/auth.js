import { supabase } from '../lib/supabase.js';

function setError(message) {
  const wrapper = document.getElementById('error-message');
  if (!wrapper) return;
  wrapper.textContent = message;
  wrapper.classList.add('visible');
}

function setSuccess(message) {
  const wrapper = document.getElementById('success-message');
  if (!wrapper) return;
  wrapper.textContent = message;
  wrapper.classList.add('visible');
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value;

  document.getElementById('error-message')?.classList.remove('visible');
  document.getElementById('success-message')?.classList.remove('visible');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    setSuccess('Login realizado com sucesso');

    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1000);

    return data;
  } catch (err) {
    console.error('Erro ao autenticar usuário:', err);
    setError(err.message || 'Erro inesperado ao entrar.');
    throw err;
  }
}

async function initialize() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) {
    return;
  }

  loginForm.addEventListener('submit', handleLogin);

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw error;
    }

    if (data?.session) {
      window.location.href = '/dashboard.html';
      return;
    }
  } catch (err) {
    console.error('Erro ao recuperar sessão atual:', err);
    setError('Sessão inválida. Faça login novamente.');
  }

  if (loginForm.dataset.autoSubmit === 'true') {
    window.requestAnimationFrame(() => {
      loginForm.requestSubmit();
    });
  }
}

document.addEventListener('DOMContentLoaded', initialize);

window.LoginSystem = {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async logout() {
    await supabase.auth.signOut();
    window.location.href = '/login.html';
  }
};
