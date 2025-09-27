const { sinon } = Cypress;

describe('Proteção de rotas com Session Guard', () => {
  it('redireciona visitantes não autenticados', () => {
    cy.visit('/session-guard.html', {
      onBeforeLoad(win) {
        win.__supabaseTestOverrides = {
          getCurrentSession: sinon.stub().resolves({ user: null })
        };
        win.AlshamAuth = { isAuthenticated: false };
      }
    });

    cy.wait(1300);
    cy.window().its('__testNavigations').should('include', '/login.html');

    cy.window().its('__supabaseTestHelpers.state.auditLogs').then(logs => {
      const found = logs.some(log => log.action === 'UNAUTHORIZED_ACCESS');
      expect(found, 'audit log de acesso não autorizado').to.be.true;
    });
  });

  it('permite acesso para usuários autenticados', () => {
    cy.visit('/session-guard.html', {
      onBeforeLoad(win) {
        win.__supabaseTestOverrides = {
          getCurrentSession: sinon.stub().resolves({
            user: { id: 'user-777', email: 'auth@alsham.com', user_metadata: { org_id: 'org-test-123' } }
          })
        };
      }
    });

    cy.contains('#user-info', 'auth@alsham.com', { timeout: 5000 }).should('be.visible');

    cy.window().its('__supabaseTestHelpers.state.auditLogs').then(logs => {
      const found = logs.some(log => log.action === 'AUTHORIZED_ACCESS');
      expect(found, 'audit log de acesso autorizado').to.be.true;
    });
  });
});
