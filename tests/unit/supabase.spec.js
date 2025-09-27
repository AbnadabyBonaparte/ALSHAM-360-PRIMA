import { beforeEach, describe, expect, it, vi } from 'vitest';

const responses = new Map();
let queries = [];

const mockSupabase = {
  from: vi.fn()
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}));

function queueResponse(table, response) {
  if (!responses.has(table)) {
    responses.set(table, []);
  }
  responses.get(table).push(response);
}

function makeQuery(table) {
  const query = {
    table,
    calls: {
      select: [],
      eq: [],
      order: [],
      limit: [],
      insert: [],
      update: [],
      delete: 0
    }
  };

  query.select = vi.fn(arg => {
    query.calls.select.push(arg);
    return query;
  });
  query.eq = vi.fn((column, value) => {
    query.calls.eq.push([column, value]);
    return query;
  });
  query.order = vi.fn((column, options) => {
    query.calls.order.push([column, options]);
    return query;
  });
  query.limit = vi.fn(value => {
    query.calls.limit.push(value);
    return query;
  });
  query.insert = vi.fn(payload => {
    query.calls.insert.push(payload);
    return query;
  });
  query.update = vi.fn(payload => {
    query.calls.update.push(payload);
    return query;
  });
  query.delete = vi.fn(() => {
    query.calls.delete += 1;
    return query;
  });
  query.select.mockName(`select:${table}`);
  query.eq.mockName(`eq:${table}`);
  query.order.mockName(`order:${table}`);
  query.limit.mockName(`limit:${table}`);
  query.insert.mockName(`insert:${table}`);
  query.update.mockName(`update:${table}`);
  query.delete.mockName(`delete:${table}`);

  query.then = (resolve, reject) => {
    const queue = responses.get(table) || [];
    const result = queue.length ? queue.shift() : { data: null, error: null };
    return Promise.resolve(result).then(resolve, reject);
  };

  return query;
}

beforeEach(() => {
  responses.clear();
  queries = [];
  mockSupabase.from.mockReset();
  mockSupabase.from.mockImplementation(table => {
    const query = makeQuery(table);
    queries.push(query);
    return query;
  });
});

const { genericSelect, genericInsert, createAuditLog } = await import('../../src/lib/supabase.js');

describe('genericSelect', () => {
  it('retorna dados filtrados com ordenação e limite', async () => {
    queueResponse('example_table', { data: [{ id: 1, name: 'Lead' }], error: null });

    const result = await genericSelect('example_table', { org_id: 'org-123', status: '' }, {
      select: 'id,name',
      order: { column: 'created_at', ascending: false },
      limit: 5
    });

    expect(result.data).toEqual([{ id: 1, name: 'Lead' }]);
    const query = queries.find(q => q.table === 'example_table');
    expect(query).toBeTruthy();
    expect(query.calls.select[0]).toBe('id,name');
    expect(query.calls.eq).toContainEqual(['org_id', 'org-123']);
    const appliedColumns = query.calls.eq.map(([column]) => column);
    expect(appliedColumns).not.toContain('status');
    expect(query.calls.order).toContainEqual(['created_at', { ascending: false }]);
    expect(query.calls.limit).toContain(5);
  });
});

describe('genericInsert', () => {
  it('anexa org_id quando fornecido e retorna dados inseridos', async () => {
    queueResponse('leads_crm', { data: [{ id: 'lead-1', name: 'Teste', org_id: 'org-abc' }], error: null });

    const payload = { name: 'Teste' };
    const result = await genericInsert('leads_crm', payload, 'org-abc');

    expect(result.success).toBe(true);
    expect(result.data).toEqual([{ id: 'lead-1', name: 'Teste', org_id: 'org-abc' }]);

    const query = queries.find(q => q.table === 'leads_crm');
    expect(query.calls.insert[0]).toEqual({ name: 'Teste', org_id: 'org-abc' });
  });
});

describe('createAuditLog', () => {
  it('registra logs com action, detalhes e org', async () => {
    queueResponse('audit_log', { data: [{ id: 'log-1' }], error: null });

    const result = await createAuditLog('LOGIN_SUCCESS', { email: 'user@alsham.com' }, 'user-123', 'org-xyz');

    expect(result.success).toBe(true);
    const query = queries.find(q => q.table === 'audit_log');
    expect(query).toBeTruthy();
    const [inserted] = query.calls.insert;
    expect(inserted).toMatchObject({
      action: 'LOGIN_SUCCESS',
      details: { email: 'user@alsham.com' },
      user_id: 'user-123',
      org_id: 'org-xyz'
    });
    expect(typeof inserted.created_at).toBe('string');
    expect(Number.isNaN(Date.parse(inserted.created_at))).toBe(false);
  });
});
