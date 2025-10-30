/// <reference types="cypress" />

export function getTestCredentials() {
  return {
    email: Cypress.env('TEST_USER_EMAIL') || 'user@example.com',
    password: Cypress.env('TEST_USER_PASSWORD') || 'SenhaSegura1!'
  };
}

export function getDefaultLeadsDataset() {
  const dataset = Cypress.env('TEST_LEADS_DATASET');
  if (Array.isArray(dataset) && dataset.length > 0) {
    return dataset;
  }
  return [
    {
      id: 'lead-1',
      name: 'Primeiro Lead',
      status: 'novo',
      prioridade: 'alta',
      origem: 'website',
      created_at: '2024-01-10T12:00:00.000Z'
    }
  ];
}
