Cypress.on('uncaught:exception', (err) => {
  if (!err?.message) {
    return true;
  }

  const message = err.message;
  if (message.includes('PushManager') || message.includes('service worker')) {
    return false;
  }

  return true;
});
