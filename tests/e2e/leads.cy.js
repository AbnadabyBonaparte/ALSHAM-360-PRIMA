describe('Gestão de Leads (CRUD)', () => {
  it('sincroniza lista de leads com eventos realtime', () => {
    cy.visit('/leads-real.html', {
      onBeforeLoad(win) {
        const now = new Date().toISOString();
        win.__supabaseTestState = {
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
          gamification: [{ points_awarded: 25 }],
          automations: [{ id: 'auto-1', name: 'Boas-vindas', is_active: true }],
          auditLogs: []
        };
      }
    });

    cy.contains('#leads-table', 'Lead Inicial', { timeout: 5000 }).should('be.visible');

    cy.updateSupabaseState(state => {
      state.leads.push({
        id: 'lead-2',
        name: 'Lead Criado',
        status: 'novo',
        prioridade: 'media',
        origem: 'linkedin',
        created_at: new Date().toISOString()
      });
    });
    cy.triggerSupabaseRealtime();
    cy.contains('#leads-table', 'Lead Criado', { timeout: 5000 }).should('be.visible');

    cy.updateSupabaseState(state => {
      const lead = state.leads.find(item => item.id === 'lead-2');
      if (lead) {
        lead.name = 'Lead Atualizado';
        lead.status = 'qualificado';
      }
    });
    cy.triggerSupabaseRealtime();
    cy.contains('#leads-table', 'Lead Atualizado', { timeout: 5000 }).should('be.visible');

    cy.updateSupabaseState(state => {
      const index = state.leads.findIndex(item => item.id === 'lead-2');
      if (index >= 0) {
        state.leads.splice(index, 1);
      }
    });
    cy.triggerSupabaseRealtime();
    cy.contains('#leads-table', 'Lead Atualizado').should('not.exist');
  });
});
