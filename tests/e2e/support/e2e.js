function createDefaultSupabaseStubs() {
  const sinon = Cypress.sinon;
  const auth = {
    signInWithPassword: sinon.stub().resolves({
      data: { user: { id: 'default-user', email: 'default@example.com' }, session: null },
      error: null
    }),
    signOut: sinon.stub().resolves({ error: null }),
    getSession: sinon.stub().resolves({ data: { session: null }, error: null })
  };

  return {
    supabase: { auth },
    auth,
    genericSignIn: sinon.stub().resolves({ data: { user: { id: 'default-user', email: 'default@example.com' } }, error: null }),
    signInWithPassword: auth.signInWithPassword,
    signInWithOAuth: sinon.stub().resolves({ data: {}, error: null }),
    resetPassword: sinon.stub().resolves({ data: {}, error: null }),
    getCurrentSession: sinon.stub().resolves({ data: { session: null }, session: null }),
    getCurrentUser: sinon.stub().resolves({ id: 'default-user', email: 'default@example.com' }),
    onAuthStateChange: sinon.stub().returns({ data: null }),
    signOut: auth.signOut,
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
  if (baseStubs.auth) {
    baseStubs.supabase = baseStubs.supabase || {};
    baseStubs.supabase.auth = baseStubs.auth;
  }
  win.AlshamSupabase = baseStubs;
  win.supabase = {
    createClient: () => ({ auth: baseStubs.auth }),
    auth: baseStubs.auth
  };
  if (!win.AlshamAuth) {
    win.AlshamAuth = {
      isAuthenticated: false,
      currentUser: null,
      checkRouteAccess: () => true
    };
  }
});
