Cypress.on('uncaught:exception', (err) => {
  if (!err?.message) {
    return true;
  }

  const message = err.message;
  if (
    message.includes('PushManager') ||
    message.includes('service worker') ||
    message.includes('signOut')
  ) {
    return false;
  }

  return true;
});

Cypress.on('window:before:load', (win) => {
  const auth = {
    signInWithPassword: () =>
      Promise.resolve({ data: { user: {}, session: {} }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    getSession: () =>
      Promise.resolve({ data: { session: null }, error: null })
  };

  win.supabase = {
    createClient: () => ({ auth }),
    auth
  };
});
