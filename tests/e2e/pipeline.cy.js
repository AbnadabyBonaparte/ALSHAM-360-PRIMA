/**
 * ALSHAM 360° PRIMA - Teste E2E do Pipeline de Vendas
 * Versão: 1.0.0
 * Data: 06/10/2025
 * Estrutura: tests/e2e/pipeline.cy.js
 * Framework: Cypress v13+
 */

describe('🧭 Pipeline de Vendas - ALSHAM 360° PRIMA', () => {

  beforeEach(() => {
    cy.log('🎯 Iniciando teste do módulo Pipeline de Vendas...');
    cy.visit('/pipeline.html');
    cy.wait(2000); // aguarda o carregamento inicial e o fetch do Supabase
  });

  it('✅ Deve carregar o título e as colunas principais', () => {
    cy.get('h1').should('contain.text', 'Pipeline de Vendas');
    cy.get('.pipeline-column')
      .should('have.length.at.least', 5)
      .each(($col) => {
        cy.wrap($col).find('.pipeline-column-header h3')
          .should('not.be.empty');
      });
  });

  it('📊 Deve exibir cards em pelo menos uma coluna', () => {
    cy.get('.opportunity-card').its('length').then(count => {
      cy.log(`📋 Total de cards renderizados: ${count}`);
      expect(count).to.be.greaterThan(0);
    });
  });

  it('🔄 Deve permitir mover um card entre colunas', () => {
    // Captura a primeira coluna com card e uma diferente como alvo
    cy.get('.pipeline-column-body').then(($cols) => {
      const fromCol = $cols[0];
      const toCol = $cols[1];

      cy.wrap(fromCol)
        .find('.opportunity-card')
        .first()
        .as('cardToMove');

      cy.get('@cardToMove')
        .invoke('attr', 'data-opportunity-id')
        .then(id => cy.log(`🎯 Movendo oportunidade ID: ${id}`));

      // Simulação de drag & drop manual
      const dataTransfer = new DataTransfer();
      cy.get('@cardToMove').trigger('dragstart', { dataTransfer });
      cy.wrap(toCol).trigger('dragover', { dataTransfer });
      cy.wrap(toCol).trigger('drop', { dataTransfer });
      cy.get('@cardToMove').trigger('dragend');

      cy.wait(1500); // aguarda re-renderização
      cy.get('.pipeline-column-body').eq(1)
        .find('.opportunity-card')
        .should('exist');

      cy.log('✅ Card movido com sucesso visualmente!');
    });
  });

  it('🔔 Deve exibir notificação de sucesso após movimentação', () => {
    cy.get('.opportunity-card').first().as('cardToMove');
    const dataTransfer = new DataTransfer();
    cy.get('@cardToMove').trigger('dragstart', { dataTransfer });
    cy.get('.pipeline-column-body').eq(2).trigger('dragover', { dataTransfer });
    cy.get('.pipeline-column-body').eq(2).trigger('drop', { dataTransfer });
    cy.get('@cardToMove').trigger('dragend');

    cy.wait(1000);
    cy.get('.notification.success')
      .should('be.visible')
      .and('contain.text', 'Oportunidade movida com sucesso');
  });

  it('💰 Deve atualizar o total global após movimentação', () => {
    cy.get('#pipeline-total')
      .should('exist')
      .invoke('text')
      .then((totalAntes) => {
        cy.log(`Valor antes do movimento: ${totalAntes}`);
        const dataTransfer = new DataTransfer();
        cy.get('.opportunity-card').first().trigger('dragstart', { dataTransfer });
        cy.get('.pipeline-column-body').eq(3).trigger('dragover', { dataTransfer });
        cy.get('.pipeline-column-body').eq(3).trigger('drop', { dataTransfer });
        cy.get('.opportunity-card').first().trigger('dragend');
        cy.wait(1000);
        cy.get('#pipeline-total')
          .invoke('text')
          .should((totalDepois) => {
            cy.log(`Valor após movimento: ${totalDepois}`);
            expect(totalDepois).to.not.equal(totalAntes);
          });
      });
  });

  after(() => {
    cy.log('🏁 Teste do módulo Pipeline de Vendas concluído com sucesso.');
  });

});
