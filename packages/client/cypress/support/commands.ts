/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to clear the database via GraphQL
Cypress.Commands.add('clearTasks', () => {
  const query = `
    query {
      tasks {
        id
      }
    }
  `;

  cy.request({
    method: 'POST',
    url: 'http://localhost:8000/graphql',
    body: { query },
  }).then((response) => {
    const tasks = response.body.data.tasks;
    tasks.forEach((task: { id: string }) => {
      const deleteMutation = `
        mutation {
          deleteTask(id: ${task.id})
        }
      `;
      cy.request({
        method: 'POST',
        url: 'http://localhost:8000/graphql',
        body: { query: deleteMutation },
      });
    });
  });
});

// Custom command to create a task via GraphQL
Cypress.Commands.add('createTask', (text: string, date: string) => {
  const mutation = `
    mutation {
      createTask(title: "${text}", date: "${date}") {
        id
        title
        completed
        date
      }
    }
  `;

  return cy.request({
    method: 'POST',
    url: 'http://localhost:8000/graphql',
    body: { query: mutation },
  });
});

// Extend Cypress namespace for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to clear all tasks from the database
       * @example cy.clearTasks()
       */
      clearTasks(): Chainable<void>;

      /**
       * Custom command to create a task via GraphQL
       * @example cy.createTask('Task text', '2025-11-05')
       */
      createTask(text: string, date: string): Chainable<Response<any>>;
    }
  }
}

export {};
