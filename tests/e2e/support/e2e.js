function createDefaultSupabaseStubs() {
  const sinon = Cypress.sinon;
  return {
    genericSignIn: sinon.stub().resolves({ data: { user: { id: 'default-user', email: 'default@example.com' } }, error: null }),
    signInWithOAuth: sinon.stub().resolves({ data: {}, error: null }),
    resetPassword: sinon.stub().resolves({ data: {}, error: null }),
    getCurrentSession: sinon.stub().resolves({ user: null }),
    getCurrentUser: sinon.stub().resolves({ id: 'default-user', email: 'default@example.com' }),
    onAuthStateChange: sinon.stub().returns({ data: null }),
    signOut: sinon.stub().resolves({ success: true }),
    createAuditLog: sinon.stub().resolves({ success: true }),
    healthCheck: sinon.stub().resolves({ status: 'ok' }),
    checkEmailExists: sinon.stub().resolves(false),
    signUpWithEmail: sinon.stub().resolves({ data: { user: { id: 'default-user', email: 'default@example.com' } }, error: null }),
    createUserProfile: sinon.stub().resolves({ success: true }),
    getCurrentOrgId: sinon.stub().resolves('org-default'),
    genericSelect: sinon.stub().resolves({ data: [], error: null }),
    genericInsert: sinon.stub().resolves({ success: true, data: [] }),
    genericUpdate: sinon.stub().resolves({ success: true, data: [] }),
    genericDelete: sinon.stub().resolves({ success: true, data: [] }),
    subscribeToTable: sinon.stub().returns({ unsubscribe: sinon.stub() })
  };
}

Cypress.Commands.add('mockSupabase', overrides => {
  return cy.wrap(null, { log: false }).then(() => {
    Cypress.env('supabaseStubOverrides', overrides || null);
  });
});

afterEach(() => {
  Cypress.env('supabaseStubOverrides', null);
});

Cypress.on('window:before:load', win => {
  const overrides = Cypress.env('supabaseStubOverrides') || {};
  const baseStubs = createDefaultSupabaseStubs();
  Object.assign(baseStubs, overrides);
  win.AlshamSupabase = baseStubs;
  if (!win.AlshamAuth) {
    win.AlshamAuth = {
      isAuthenticated: false,
      currentUser: null,
      checkRouteAccess: () => true
    };
  }
});
