/// <reference types="cypress" />

describe('Gestão de leads (CRUD)', () => {
  afterEach(() => {
    cy.mockSupabase(null);
  });

  it('carrega leads, aplica filtros e reage a operações de criação, atualização e exclusão', () => {
    const initialLeads = [
      {
        id: 'lead-1',
        name: 'Primeiro Lead',
        status: 'novo',
        prioridade: 'alta',
        origem: 'website',
        created_at: '2024-01-10T12:00:00.000Z'
      }
    ];

    const kpiData = [{ total_leads: 1, convertidos: 0, conversao: 0 }];
    const gamificationData = [{ points_awarded: 10 }];
    const automationsData = [{ id: 'auto-1', name: 'Follow-up', is_active: true }];

    let leadsDataset = [...initialLeads];
    let realtimeHandler;

    const genericSelect = cy.stub().callsFake((table) => {
      switch (table) {
        case 'leads_crm':
          return Promise.resolve({ data: leadsDataset, error: null });
        case 'dashboard_kpis':
          return Promise.resolve({ data: kpiData, error: null });
        case 'gamification_points':
          return Promise.resolve({ data: gamificationData, error: null });
        case 'automation_rules':
          return Promise.resolve({ data: automationsData, error: null });
        default:
          return Promise.resolve({ data: [], error: null });
      }
    });

    const subscribeToTable = cy.stub().callsFake((table, orgId, callback) => {
      realtimeHandler = callback;
      return { unsubscribe: cy.stub() };
    });

    cy.mockSupabase({
      getCurrentSession: cy.stub().resolves({ user: { id: 'user-1', email: 'user@example.com' } }),
      getCurrentOrgId: cy.stub().resolves('org-1'),
      genericSelect,
      subscribeToTable
    });

    cy.intercept('GET', '/__mockLeads__', (req) => {
      req.reply({ statusCode: 200, body: leadsDataset });
    }).as('mockLeads');

    cy.visit('/leads-real.html', {
      onBeforeLoad(win) {
        if (typeof win.fetch === 'function') {
          win.fetch('/__mockLeads__');
        }
      }
    });

    cy.wait('@mockLeads');

    cy.get('#leads-table', { timeout: 10000 })
      .should('contain.text', 'Primeiro Lead');

    cy.get('#leads-table').within(() => {
      cy.contains('novo').should('exist');
    });

    cy.get('#filter-search').type('Primeiro');
    cy.get('#leads-table', { timeout: 10000 })
      .should('contain.text', 'Primeiro Lead');

    cy.then(() => {
      leadsDataset = [
        ...leadsDataset,
        {
          id: 'lead-2',
          name: 'Lead Criado',
          status: 'contatado',
          prioridade: 'media',
          origem: 'indicacao',
          created_at: '2024-01-11T12:00:00.000Z'
        }
      ];
      realtimeHandler?.();
    });

    cy.get('#leads-table').within(() => {
      cy.contains('Lead Criado').should('exist');
      cy.contains('contatado').should('exist');
    });

    cy.then(() => {
      leadsDataset = leadsDataset.map(lead =>
        lead.id === 'lead-1' ? { ...lead, status: 'convertido' } : lead
      );
      realtimeHandler?.();
    });

    cy.get('#leads-table').within(() => {
      cy.contains('convertido').should('exist');
    });

    cy.then(() => {
      leadsDataset = leadsDataset.filter(lead => lead.id !== 'lead-2');
      realtimeHandler?.();
    });

    cy.get('#leads-table').within(() => {
      cy.contains('Lead Criado').should('not.exist');
    });

    cy.wrap(null).then(() => {
      expect(subscribeToTable).to.have.been.calledWith('leads_crm', 'org-1', Cypress.sinon.match.func);
    });
  });
});
