Cypress.Commands.add('updateSupabaseState', updater => {
  cy.window().then(win => {
    const helpers = win.__supabaseTestHelpers;
    if (helpers?.state && typeof updater === 'function') {
      updater(helpers.state);
    }
  });
});

Cypress.Commands.add('triggerSupabaseRealtime', payload => {
  cy.window().then(win => {
    const helpers = win.__supabaseTestHelpers;
    helpers?.notifyRealtime(payload);
  });
});
