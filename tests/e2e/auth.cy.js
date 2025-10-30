/// <reference types="cypress" />

describe('Fluxos de autenticação e proteção de sessão', () => {
  afterEach(() => {
    cy.mockSupabase(null);
  });

  it('realiza login com credenciais válidas e redireciona para o dashboard', () => {
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

    cy.get('#email').type('user@example.com');
    cy.get('#password').type('SenhaSegura1!');
    cy.get('#login-form').submit();

    cy.get('#success-message').should('contain', 'Login realizado com sucesso');
    cy.get('@signInWithPassword').should(
      'have.been.calledWithMatch',
      Cypress.sinon.match({ email: 'user@example.com', password: 'SenhaSegura1!' })
    );
    cy.get('@auditLog').should('have.been.calledWithMatch', 'LOGIN_SUCCESS', Cypress.sinon.match({ user_id: 'user-123' }));

    cy.tick(1000);
    cy.location('pathname').should('eq', '/dashboard.html');
  });

  it('exibe erro ao falhar no login', () => {
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
    cy.get('#email').type('user@example.com');
    cy.get('#password').type('SenhaSegura1!');
    cy.get('#login-form').submit();

    cy.get('#error-message').should('contain', 'Erro no login');
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

    cy.get('#first-name').type('Maria');
    cy.get('#last-name').type('Silva');
    cy.get('#email').type('nova@empresa.com');
    cy.get('#password').type('SenhaSegura1!');
    cy.get('#confirm-password').type('SenhaSegura1!');

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

    cy.get('#first-name').type('João');
    cy.get('#last-name').type('Souza');
    cy.get('#email').type('duplicado@empresa.com');
    cy.get('#password').type('SenhaSegura1!');
    cy.get('#confirm-password').type('SenhaSegura1!');

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
    cy.get('#email').type('user@example.com');
    cy.get('#reset-form').submit();

    cy.get('#reset-message').should('contain', 'Um link de redefinição');
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
    cy.get('#email').type('user@example.com');
    cy.get('#reset-form').submit();

    cy.get('#reset-error').should('contain', 'Falha Supabase');
    cy.get('@auditLog').should('have.been.calledWithMatch', 'PASSWORD_RESET_FAILURE', Cypress.sinon.match({ reason: 'Falha Supabase' }));
  });

  it('protege rota privada redirecionando usuários não autenticados', () => {
    const auditStub = cy.stub().as('auditLog').resolves({ success: true });

    cy.mockSupabase({
      getCurrentSession: cy.stub().resolves({ user: null }),
      createAuditLog: auditStub,
      onAuthStateChange: cy.stub().returns({ data: null })
    });

    cy.clock();
    cy.visit('/session-guard.html', {
      onBeforeLoad(win) {
        cy.stub(win.location, 'replace').as('locationReplace');
      }
    });

    cy.tick(1500);

    cy.get('@locationReplace').should('have.been.calledWith', '/login.html');
    cy.get('@auditLog').should('have.been.calledWithMatch', 'UNAUTHORIZED_ACCESS', Cypress.sinon.match({ route: '/session-guard.html' }));
  });

  it('mantém acesso quando a sessão é válida', () => {
    const auditStub = cy.stub().as('auditLog').resolves({ success: true });

    cy.mockSupabase({
      getCurrentSession: cy.stub().resolves({ user: { id: 'user-1', email: 'user@example.com' } }),
      createAuditLog: auditStub,
      onAuthStateChange: cy.stub().returns({ data: null })
    });

    cy.visit('/session-guard.html', {
      onBeforeLoad(win) {
        cy.stub(win.location, 'replace').as('locationReplace');
      }
    });

    cy.contains('Sessão válida', { timeout: 5000 }).should('exist');
    cy.get('@locationReplace').should('not.have.been.called');
    cy.get('@auditLog').should('have.been.calledWithMatch', 'AUTHORIZED_ACCESS', Cypress.sinon.match({ route: '/session-guard.html' }));
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

    cy.get('#logout-button').click();

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
