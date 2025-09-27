import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const fromMock = vi.fn();
let mockClientInstance;
const createClientMock = vi.fn(() => {
  mockClientInstance = {
    from: fromMock,
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn()
    }
  };
  return mockClientInstance;
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: createClientMock
}));

function createThenable(response) {
  const chain = {
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    then: (resolve, reject) => Promise.resolve(response).then(resolve, reject)
  };
  return chain;
}

describe('Supabase utilitários genéricos', () => {
  beforeEach(() => {
    vi.resetModules();
    fromMock.mockReset();
    createClientMock.mockClear();
    mockClientInstance = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('executa genericSelect com filtros, ordenação e limite', async () => {
    const selectResponse = { data: [{ id: 1 }], error: null };
    const chain = createThenable(selectResponse);
    const selectSpy = vi.fn(() => chain);

    fromMock.mockReturnValue({ select: selectSpy });

    const { genericSelect } = await import('../../src/lib/supabase.js');
    const result = await genericSelect('leads_crm', { org_id: 'org-1' }, {
      order: { column: 'created_at', ascending: false },
      limit: 5
    });

    expect(result).toEqual({ data: selectResponse.data });
    expect(selectSpy).toHaveBeenCalledWith('*');
    expect(chain.eq).toHaveBeenCalledWith('org_id', 'org-1');
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(chain.limit).toHaveBeenCalledWith(5);
  });

  it('retorna erro normalizado no genericSelect', async () => {
    const error = new Error('falha select');
    const chain = createThenable({ data: null, error });
    const selectSpy = vi.fn(() => chain);
    fromMock.mockReturnValue({ select: selectSpy });

    const { genericSelect } = await import('../../src/lib/supabase.js');
    const result = await genericSelect('leads_crm', { org_id: 'org-1' });

    expect(result.data).toBeNull();
    expect(result.error).toMatchObject({ message: 'falha select', context: 'select:leads_crm' });
  });

  it('insere registros com genericInsert anexando org_id', async () => {
    const insertResponse = { data: [{ id: '1', name: 'Lead' }], error: null };
    const chain = createThenable(insertResponse);
    const selectSpy = vi.fn(() => chain);
    const insertSpy = vi.fn(() => ({ select: selectSpy }));

    fromMock.mockReturnValue({ insert: insertSpy });

    const { genericInsert } = await import('../../src/lib/supabase.js');
    const payload = { name: 'Lead' };
    const result = await genericInsert('leads_crm', payload, 'org-55');

    expect(insertSpy).toHaveBeenCalledWith({ name: 'Lead', org_id: 'org-55' });
    expect(result).toEqual({ success: true, data: insertResponse.data });
  });

  it('propaga erros no genericInsert', async () => {
    const error = new Error('falha insert');
    const chain = createThenable({ data: null, error });
    const selectSpy = vi.fn(() => chain);
    const insertSpy = vi.fn(() => ({ select: selectSpy }));
    fromMock.mockReturnValue({ insert: insertSpy });

    const { genericInsert } = await import('../../src/lib/supabase.js');
    const result = await genericInsert('leads_crm', { name: 'Lead' });

    expect(result.success).toBe(false);
    expect(result.error).toMatchObject({ message: 'falha insert', context: 'insert:leads_crm' });
  });

  it('registra auditoria com createAuditLog usando org fornecido', async () => {
    vi.useFakeTimers();
    const fixedDate = new Date('2024-03-01T10:00:00.000Z');
    vi.setSystemTime(fixedDate);

    const response = { data: [{ id: 'log-1' }], error: null };
    const chain = createThenable(response);
    const selectSpy = vi.fn(() => chain);
    const insertSpy = vi.fn(() => ({ select: selectSpy }));

    fromMock.mockImplementation(table => {
      if (table === 'audit_log') {
        return { insert: insertSpy };
      }
      return { select: vi.fn(() => createThenable({ data: [], error: null })) };
    });

    const { createAuditLog } = await import('../../src/lib/supabase.js');
    const result = await createAuditLog('ACTION_TEST', { foo: 'bar' }, 'user-1', 'org-88');

    expect(insertSpy).toHaveBeenCalledWith(expect.objectContaining({
      action: 'ACTION_TEST',
      details: { foo: 'bar' },
      user_id: 'user-1',
      org_id: 'org-88',
      created_at: fixedDate.toISOString()
    }));
    expect(result).toEqual({ success: true, data: response.data });
  });

  it('obtém org atual ao criar auditoria sem org explícito', async () => {
    const response = { data: [{ id: 'log-2' }], error: null };
    const auditChain = createThenable(response);
    const auditSelectSpy = vi.fn(() => auditChain);
    const auditInsertSpy = vi.fn(() => ({ select: auditSelectSpy }));

    const resolvedOrgId = '11111111-1111-4111-8111-111111111111';
    const profileResponse = { data: { org_id: resolvedOrgId }, error: null };
    const profileChain = {
      eq: vi.fn(() => profileChain),
      limit: vi.fn(() => profileChain),
      maybeSingle: vi.fn(() => profileChain),
      then: (resolve, reject) => Promise.resolve(profileResponse).then(resolve, reject)
    };
    const profileSelectSpy = vi.fn(() => profileChain);

    fromMock.mockImplementation(table => {
      if (table === 'audit_log') {
        return { insert: auditInsertSpy };
      }
      if (table === 'user_profiles') {
        return { select: profileSelectSpy };
      }
      return { select: vi.fn(() => createThenable({ data: [], error: null })) };
    });

    const module = await import('../../src/lib/supabase.js');
    mockClientInstance.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-9' } } }, error: null });

    const result = await module.createAuditLog('ACTION', { foo: 'bar' }, 'user-9');

    expect(profileSelectSpy).toHaveBeenCalledWith('org_id');
    expect(auditInsertSpy).toHaveBeenCalledWith(expect.objectContaining({ org_id: resolvedOrgId }));
    expect(result.success).toBe(true);
  });

  it('retorna erro quando createAuditLog falha', async () => {
    const error = new Error('falha audit');
    const chain = createThenable({ data: null, error });
    const selectSpy = vi.fn(() => chain);
    const insertSpy = vi.fn(() => ({ select: selectSpy }));

    fromMock.mockImplementation(table => ({ insert: insertSpy }));

    const { createAuditLog } = await import('../../src/lib/supabase.js');
    const result = await createAuditLog('ACTION_FAIL', {}, 'user-1', 'org-1');

    expect(result.success).toBe(false);
    expect(result.error).toMatchObject({ message: 'falha audit', context: 'auditLog' });
  });
});
