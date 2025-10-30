/// <reference types="cypress" />

import { getTestCredentials } from '../support/testData.js';

describe('Fluxos de autenticação e proteção de sessão', () => {
  afterEach(() => {
    cy.mockSupabase(null);
  });

  it('realiza login com credenciais válidas e redireciona para o dashboard', () => {
    const { email, password } = getTestCredentials();
    const signInStub = cy.stub().as('signInWithPassword').resolves({
      data: { user: { id: 'user-123', email: 'user@example.com' }, session: {} },
      error: null
    });
    const auditStub = cy.stub().as('auditLog').resolves({ success: true });
    const sessionStub = cy.stub().resolves({ data: { session: null }, error: null });

    cy.mockSupabase({
      supabase: { auth: { signInWithPassword: signInStub, getSession: sessionStub } },
      auth: { signInWithPassword: signInStub, getSession: sessionStub },
      signInWithPassword: signInStub,
      createAuditLog: auditStub,
      getCurrentSession: sessionStub
    });

    cy.clock();
    cy.visit('/login.html');

    cy.log('Preenchendo formulário de login com credenciais de teste');
    cy.get('[data-cy=login-email]').type(email);
    cy.get('[data-cy=login-password]').type(password, { log: false });
    cy.get('[data-cy=login-form]').submit();

    cy.get('[data-cy=login-success]').should('contain', 'Login realizado com sucesso');
    cy.get('@signInWithPassword').should(
      'have.been.calledWithMatch',
      Cypress.sinon.match({ email, password })
    );
    cy.get('@auditLog').should('have.been.calledWithMatch', 'LOGIN_SUCCESS', Cypress.sinon.match({ user_id: 'user-123' }));

    cy.tick(1000);
    cy.location('pathname').should('eq', '/dashboard.html');
    cy.get('[data-cy=dashboard-root]', { timeout: 10000 }).should('exist');
    cy.screenshot('auth-login-success', { capture: 'viewport' });
  });

  it('exibe erro ao falhar no login', () => {
    const { email, password } = getTestCredentials();
    const loginError = new Error('Credenciais inválidas');
    const signInStub = cy.stub().as('signInWithPassword').resolves({ data: { user: null }, error: loginError });
    const auditStub = cy.stub().as('auditLog').resolves({ success: true });
    const sessionStub = cy.stub().resolves({ data: { session: null }, error: null });

    cy.mockSupabase({
      supabase: { auth: { signInWithPassword: signInStub, getSession: sessionStub } },
      auth: { signInWithPassword: signInStub, getSession: sessionStub },
      signInWithPassword: signInStub,
      createAuditLog: auditStub,
      getCurrentSession: sessionStub
    });

    cy.visit('/login.html');
    cy.get('[data-cy=login-email]').type(email);
    cy.get('[data-cy=login-password]').type(password, { log: false });
    cy.get('[data-cy=login-form]').submit();

    cy.get('[data-cy=login-error]').should('contain', 'Erro no login');
    cy.get('@auditLog').should('have.been.calledWithMatch', 'LOGIN_FAILURE', Cypress.sinon.match({ reason: 'Credenciais inválidas' }));
    cy.location('pathname').should('eq', '/login.html');
  });

  it('permite registrar um novo usuário e registra auditoria', () => {
    const signUpStub = cy.stub().as('signUp').resolves({
      data: { user: { id: 'new-user', email: 'nova@empresa.com' } },
      error: null
    });
    const profileStub = cy.stub().as('profile').resolves({ success: true });
    const auditStub = cy.stub().as('auditLog').resolves({ success: true });

    cy.mockSupabase({
      checkEmailExists: cy.stub().resolves(false),
      signUpWithEmail: signUpStub,
      createUserProfile: profileStub,
      createAuditLog: auditStub
    });

    cy.clock();
    cy.visit('/register.html');

    cy.get('[data-cy=register-first-name]').type('Maria');
    cy.get('[data-cy=register-last-name]').type('Silva');
    cy.get('[data-cy=register-email]').type('nova@empresa.com');
    cy.get('[data-cy=register-password]').type('SenhaSegura1!');
    cy.get('[data-cy=register-confirm-password]').type('SenhaSegura1!');

    cy.window().then(win => {
      win.RegistrationSystem.submit();
    });

    cy.get('@signUp').should('have.been.calledWith', 'nova@empresa.com', 'SenhaSegura1!');
    cy.get('@profile').should('have.been.called');
    cy.get('@auditLog').should('have.been.calledWithMatch', 'USER_REGISTERED', Cypress.sinon.match({ email: 'nova@empresa.com' }));

    cy.tick(2000);
    cy.location('pathname').should('eq', '/login.html');
  });

  it('impede registro com e-mail duplicado', () => {
    const warningStub = cy.stub().resolves(false);

    cy.mockSupabase({
      checkEmailExists: cy.stub().resolves(true),
      createAuditLog: warningStub
    });

    cy.visit('/register.html');

    cy.get('[data-cy=register-first-name]').type('João');
    cy.get('[data-cy=register-last-name]').type('Souza');
    cy.get('[data-cy=register-email]').type('duplicado@empresa.com');
    cy.get('[data-cy=register-password]').type('SenhaSegura1!');
    cy.get('[data-cy=register-confirm-password]').type('SenhaSegura1!');

    cy.window().then(win => {
      win.RegistrationSystem.submit();
    });

    cy.contains('E-mail já cadastrado').should('be.visible');
    cy.location('pathname').should('eq', '/register.html');
  });

  it('envia solicitação de redefinição de senha', () => {
    const resetStub = cy.stub().as('reset').resolves({ data: {}, error: null });
    const auditStub = cy.stub().as('auditLog').resolves({ success: true });

    cy.mockSupabase({
      resetPassword: resetStub,
      createAuditLog: auditStub
    });

    cy.visit('/reset-password.html');
    cy.get('[data-cy=reset-email]').type('user@example.com');
    cy.get('[data-cy=reset-form]').submit();

    cy.get('[data-cy=reset-success]').should('contain', 'Um link de redefinição');
    cy.get('@reset').should('have.been.calledWith', 'user@example.com');
    cy.get('@auditLog').should('have.been.calledWithMatch', 'PASSWORD_RESET_REQUEST', Cypress.sinon.match({ email: 'user@example.com' }));
  });

  it('exibe erro quando redefinição falha', () => {
    const error = new Error('Falha Supabase');
    const resetStub = cy.stub().as('reset').resolves({ data: null, error });
    const auditStub = cy.stub().as('auditLog').resolves({ success: true });

    cy.mockSupabase({
      resetPassword: resetStub,
      createAuditLog: auditStub
    });

    cy.visit('/reset-password.html');
    cy.get('[data-cy=reset-email]').type('user@example.com');
    cy.get('[data-cy=reset-form]').submit();

    cy.get('[data-cy=reset-error]').should('contain', 'Falha Supabase');
    cy.get('@auditLog').should('have.been.calledWithMatch', 'PASSWORD_RESET_FAILURE', Cypress.sinon.match({ reason: 'Falha Supabase' }));
  });

  it('protege rota privada redirecionando usuários não autenticados', () => {
    const auditStub = cy.stub().as('auditLog').resolves({ success: true });
    const replaceStub = cy.stub().as('locationReplace');

    cy.mockSupabase({
      getCurrentSession: cy.stub().resolves({ user: null }),
      createAuditLog: auditStub,
      onAuthStateChange: cy.stub().returns({ data: null })
    });

    cy.clock();
    cy.visit('/session-guard.html', {
      onBeforeLoad(win) {
        const safeLocation = Object.create(win.location);
        safeLocation.replace = replaceStub;

        Object.defineProperty(win, 'location', {
          configurable: true,
          value: safeLocation,
        });
      }
    });

    cy.tick(1500);

    cy.get('@locationReplace').should('have.been.calledWith', '/login.html');
    cy.get('@auditLog').should('have.been.calledWithMatch', 'UNAUTHORIZED_ACCESS', Cypress.sinon.match({ route: '/session-guard.html' }));
  });

  it('mantém acesso quando a sessão é válida', () => {
    const auditStub = cy.stub().as('auditLog').resolves({ success: true });
    const replaceStub = cy.stub().as('locationReplace');

    cy.mockSupabase({
      getCurrentSession: cy.stub().resolves({ user: { id: 'user-1', email: 'user@example.com' } }),
      createAuditLog: auditStub,
      onAuthStateChange: cy.stub().returns({ data: null })
    });

    cy.visit('/session-guard.html', {
      onBeforeLoad(win) {
        const safeLocation = Object.create(win.location);
        safeLocation.replace = replaceStub;

        Object.defineProperty(win, 'location', {
          configurable: true,
          value: safeLocation,
        });
      }
    });

    cy.get('[data-cy=session-user-info]', { timeout: 5000 })
      .should('be.visible')
      .and('contain', 'user@example.com');
    cy.get('@locationReplace').should('not.have.been.called');
    cy.get('@auditLog').should('have.been.calledWithMatch', 'AUTHORIZED_ACCESS', Cypress.sinon.match({ route: '/session-guard.html' }));
    cy.screenshot('session-guard-valid-session', { capture: 'viewport' });
  });

  it('executa logout completo e limpa sessão', () => {
    const signOutStub = cy.stub().as('signOut').resolves({ success: true });
    const auditStub = cy.stub().as('auditLog').resolves({ success: true });
    const sessionStub = cy.stub().resolves({ user: { id: 'user-321', email: 'logout@example.com' } });
    const userStub = cy.stub().resolves({ id: 'user-321', email: 'logout@example.com' });

    cy.mockSupabase({
      signOut: signOutStub,
      createAuditLog: auditStub,
      getCurrentSession: sessionStub,
      getCurrentUser: userStub
    });

    cy.clock();
    cy.visit('/logout.html');

    cy.window().then(win => {
      win.localStorage.setItem('alsham_auth_state', '1');
      win.localStorage.setItem('supabase.auth.token', 'token');
    });

    cy.get('[data-cy=logout-button]').click();

    cy.get('@signOut').should('have.been.called');
    cy.get('@auditLog').should('have.been.calledWithMatch', 'USER_LOGGED_OUT', Cypress.sinon.match({ user_id: 'user-321' }));

    cy.tick(1300);
    cy.location('pathname').should('eq', '/index.html');

    cy.window().then(win => {
      expect(win.localStorage.getItem('alsham_auth_state')).to.be.null;
      expect(win.localStorage.getItem('supabase.auth.token')).to.be.null;
    });
  });
});
