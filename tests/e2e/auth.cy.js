const { sinon } = Cypress;

describe('Fluxos de autenticação', () => {
  it('realiza login com credenciais válidas', () => {
    cy.visit('/login.html', {
      onBeforeLoad(win) {
        win.__supabaseTestOverrides = {
          getCurrentSession: sinon.stub().resolves({ user: null }),
          getCurrentUser: sinon.stub().resolves(null)
        };
      }
    });

    cy.clock();
    cy.get('#email').type('usuario@alsham.com');
    cy.get('#password').type('SenhaForte@123');
    cy.get('#login-form').submit();

    cy.contains('Login realizado com sucesso!', { timeout: 5000 }).should('be.visible');
    cy.tick(1100);

    cy.window().its('__testNavigations').should('include', '/dashboard.html');
    cy.window().its('__supabaseStubs.createAuditLog').should('have.been.calledWith', 'LOGIN_SUCCESS', sinon.match.object);
  });

  it('registra um novo usuário com sucesso', () => {
    const signUpStub = sinon.stub().callsFake((email) => Promise.resolve({
      data: { user: { id: 'user-789', email } }
    }));

    cy.visit('/register.html', {
      onBeforeLoad(win) {
        win.__supabaseTestOverrides = {
          checkEmailExists: sinon.stub().resolves(false),
          signUpWithEmail: signUpStub
        };
      }
    });

    cy.clock();
    cy.get('#first-name').type('Teste');
    cy.get('#last-name').type('Usuário');
    cy.get('#email').type('novo@alsham.com');
    cy.get('#submit-button').click();

    cy.get('#password').type('SenhaUltra@123', { force: true });
    cy.get('#confirm-password').type('SenhaUltra@123', { force: true });
    cy.get('#submit-button').click();

    cy.get('#verification-code').type('123456', { force: true });
    cy.get('#submit-button').click();

    cy.contains('Conta criada!', { timeout: 5000 }).should('be.visible');
    cy.tick(2100);

    cy.window().its('__testNavigations').should('include', '/login.html');
    cy.window().its('__supabaseStubs.createAuditLog').should('have.been.calledWith', 'USER_REGISTERED', sinon.match.object);
  });

  it('envia e-mail de redefinição de senha', () => {
    cy.visit('/reset-password.html', {
      onBeforeLoad(win) {
        win.__supabaseTestOverrides = {
          resetPassword: sinon.stub().resolves({ data: { status: 'sent' } })
        };
      }
    });

    cy.get('#email').type('usuario@alsham.com');
    cy.get('#reset-form').submit();

    cy.contains('✅ Um link de redefinição foi enviado para seu e-mail.', { timeout: 5000 }).should('be.visible');
    cy.window().its('__supabaseStubs.createAuditLog').should('have.been.calledWith', 'PASSWORD_RESET_REQUEST', sinon.match.object);
  });

  it('encerra a sessão do usuário', () => {
    cy.visit('/logout.html', {
      onBeforeLoad(win) {
        win.__supabaseTestOverrides = {
          getCurrentSession: sinon.stub().resolves({ user: { id: 'user-123', email: 'usuario@alsham.com' } })
        };
      }
    });

    cy.clock();
    cy.contains('Sair com segurança').click();
    cy.tick(1300);

    cy.window().its('__testNavigations').should('include', '/index.html');
    cy.window().its('__supabaseStubs.createAuditLog').should('have.been.calledWith', 'USER_LOGGED_OUT', sinon.match.object);
  });
});
