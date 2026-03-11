describe('Authentication Flow', () => {
  it('shows login page for unauthenticated users', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
  })

  it('redirects to login when accessing protected route', () => {
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
  })

  it('shows signup page', () => {
    cy.visit('/signup')
    cy.get('input[type="email"]').should('be.visible')
  })

  it('shows forgot password page', () => {
    cy.visit('/forgot-password')
    cy.get('input[type="email"]').should('be.visible')
  })
})
