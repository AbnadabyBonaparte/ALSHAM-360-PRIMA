const DEFAULT_USER = {
  id: 'user-123',
  email: 'user@example.com',
  user_metadata: { org_id: 'org-test-123' }
};

const DEFAULT_STATE = () => {
  const now = new Date().toISOString();
  return {
    leads: [
      {
        id: 'lead-1',
        name: 'Lead Inicial',
        status: 'novo',
        prioridade: 'alta',
        origem: 'website',
        created_at: now
      }
    ],
    kpis: {
      total_leads: 1,
      convertidos: 0,
      conversao: 0
    },
    gamification: [
      { points_awarded: 10 }
    ],
    automations: [
      { id: 'auto-1', name: 'Fluxo de boas-vindas', is_active: true }
    ],
    auditLogs: []
  };
};

function ensureNavigationStub(win) {
  if (win.__navigationStubbed) return;
  win.__testNavigations = [];
  const pushNavigation = url => {
    if (!url) return;
    win.__testNavigations.push(url);
  };
  const location = win.location;
  const proto = Object.getPrototypeOf(location);
  const hrefDescriptor = Object.getOwnPropertyDescriptor(proto, 'href');
  if (hrefDescriptor) {
    Object.defineProperty(location, 'href', {
      configurable: true,
      enumerable: true,
      get() {
        return hrefDescriptor.get.call(location);
      },
      set(value) {
        pushNavigation(value);
      }
    });
  }
  if (typeof location.assign === 'function') {
    location.assign = url => {
      pushNavigation(url);
    };
  }
  if (typeof location.replace === 'function') {
    location.replace = url => {
      pushNavigation(url);
    };
  }
  win.__navigationStubbed = true;
}

function createDefaultApi(win, state, realtimeCallbacks) {
  const sinon = Cypress.sinon;

  const notifyRealtime = payload => {
    realtimeCallbacks.forEach(cb => {
      try {
        cb(payload);
      } catch (error) {
        console.error('Realtime callback error', error);
      }
    });
  };

  const genericSelect = sinon.stub().callsFake((table) => {
    switch (table) {
      case 'leads_crm':
        return Promise.resolve({ data: [...state.leads], error: null });
      case 'dashboard_kpis':
        return Promise.resolve({ data: [state.kpis], error: null });
      case 'gamification_points':
        return Promise.resolve({ data: [...state.gamification], error: null });
      case 'automation_rules':
        return Promise.resolve({ data: [...state.automations], error: null });
      default:
        return Promise.resolve({ data: [], error: null });
    }
  });

  const genericInsert = sinon.stub().callsFake((table, payload) => {
    if (table === 'leads_crm') {
      const newLead = {
        id: payload.id || `lead-${Date.now()}`,
        created_at: payload.created_at || new Date().toISOString(),
        ...payload
      };
      state.leads.push(newLead);
      notifyRealtime({ eventType: 'INSERT', new: newLead });
      return Promise.resolve({ success: true, data: [newLead] });
    }
    return Promise.resolve({ success: true, data: [payload] });
  });

  const genericUpdate = sinon.stub().callsFake((table, id, updates) => {
    if (table === 'leads_crm') {
      const lead = state.leads.find(item => item.id === id);
      if (lead) {
        Object.assign(lead, updates);
        notifyRealtime({ eventType: 'UPDATE', new: { ...lead } });
        return Promise.resolve({ success: true, data: [lead] });
      }
      return Promise.resolve({ success: false, error: { message: 'Lead not found' } });
    }
    return Promise.resolve({ success: true, data: [updates] });
  });

  const genericDelete = sinon.stub().callsFake((table, id) => {
    if (table === 'leads_crm') {
      const index = state.leads.findIndex(item => item.id === id);
      if (index !== -1) {
        const [removed] = state.leads.splice(index, 1);
        notifyRealtime({ eventType: 'DELETE', old: removed });
        return Promise.resolve({ success: true, data: [removed] });
      }
      return Promise.resolve({ success: false, error: { message: 'Lead not found' } });
    }
    return Promise.resolve({ success: true, data: [] });
  });

  const createAuditLog = sinon.stub().callsFake((action, details) => {
    state.auditLogs.push({ action, details });
    return Promise.resolve({ success: true });
  });

  const subscribeToTable = sinon.stub().callsFake((table, orgId, callback) => {
    if (typeof callback === 'function') {
      const wrapped = payload => callback(payload);
      realtimeCallbacks.push(wrapped);
      return {
        unsubscribe: () => {
          const idx = realtimeCallbacks.indexOf(wrapped);
          if (idx >= 0) realtimeCallbacks.splice(idx, 1);
        }
      };
    }
    return { unsubscribe: () => {} };
  });

  const getCurrentSession = sinon.stub().resolves({ user: DEFAULT_USER });
  const getCurrentUser = sinon.stub().resolves(DEFAULT_USER);
  const getCurrentOrgId = sinon.stub().resolves('org-test-123');
  const getDefaultOrgId = sinon.stub().returns('org-test-123');
  const signOut = sinon.stub().resolves({ success: true });
  const onAuthStateChange = sinon.stub().callsFake((callback) => {
    if (typeof callback === 'function') {
      callback('SIGNED_IN', { user: DEFAULT_USER });
    }
    return { data: { subscription: { unsubscribe: sinon.stub() } } };
  });
  const genericSignIn = sinon.stub().callsFake((email) => {
    return Promise.resolve({ data: { user: { ...DEFAULT_USER, email } }, error: null });
  });
  const signInWithOAuth = sinon.stub().resolves({ data: {} });
  const resetPassword = sinon.stub().resolves({ data: { status: 'sent' } });
  const signUpWithEmail = sinon.stub().callsFake((email) => {
    return Promise.resolve({ data: { user: { id: 'user-456', email } }, error: null });
  });
  const createUserProfile = sinon.stub().callsFake(profile => {
    return Promise.resolve({ success: true, data: [{ ...profile }] });
  });
  const checkEmailExists = sinon.stub().resolves(false);
  const healthCheck = sinon.stub().resolves({ ok: true });

  return {
    DEFAULT_ORG_ID: 'org-test-123',
    supabase: {},
    supabaseClient: {},
    getDefaultOrgId,
    getCurrentOrgId,
    getCurrentSession,
    getCurrentUser,
    signOut,
    onAuthStateChange,
    genericSignIn,
    signInWithOAuth,
    resetPassword,
    signUpWithEmail,
    createUserProfile,
    checkEmailExists,
    createAuditLog,
    genericSelect,
    genericInsert,
    genericUpdate,
    genericDelete,
    subscribeToTable,
    createAuditLogForTests: createAuditLog,
    createLead: genericInsert,
    healthCheck
  };
}

export function applySupabaseStubs(win) {
  ensureNavigationStub(win);

  if (!win.__supabaseRealtimeCallbacks) {
    win.__supabaseRealtimeCallbacks = [];
  }
  const realtimeCallbacks = win.__supabaseRealtimeCallbacks;

  if (!win.__supabaseTestState) {
    win.__supabaseTestState = DEFAULT_STATE();
  }
  const state = win.__supabaseTestState;

  if (!win.Chart) {
    win.Chart = class {
      constructor() {}
      destroy() {}
    };
  }

  if (!win.AlshamAuth) {
    win.AlshamAuth = {
      isAuthenticated: true,
      currentUser: DEFAULT_USER
    };
  }

  if (!win.showToast) {
    win.showToast = () => {};
  }

  const defaultApi = createDefaultApi(win, state, realtimeCallbacks);
  const overrides = win.__supabaseTestOverrides || {};
  const api = { ...defaultApi, ...overrides };

  win.AlshamSupabase = api;
  win.supabaseClient = api;
  win.__supabaseStubs = api;
  win.__supabaseTestHelpers = {
    state,
    realtimeCallbacks,
    notifyRealtime: payload => {
      realtimeCallbacks.forEach(cb => {
        try {
          cb(payload);
        } catch (error) {
          console.error('Realtime callback error', error);
        }
      });
    }
  };
}
