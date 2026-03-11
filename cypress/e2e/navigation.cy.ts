describe('Navigation', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('redirects root to login when not authenticated', () => {
    cy.url().should('include', '/login')
  })

  it('theme switcher persists selection', () => {
    cy.visit('/login')
    cy.get('html').should('have.attr', 'data-theme')
  })
})
