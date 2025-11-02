describe('Task Management E2E Tests', () => {
  beforeEach(() => {
    // Clear tasks before each test
    cy.clearTasks();

    // Visit the application
    cy.visit('/');

    // Wait for the app to load
    cy.get('[data-testid="calendar-view"]', { timeout: 10000 }).should('be.visible');
  });

  describe('Task Creation', () => {
    it('should create a new task for today', () => {
      // Find today's column
      cy.contains('Today').parent().within(() => {
        // Type a new task
        cy.get('input[placeholder="Add a task..."]').type('Buy groceries{enter}');
      });

      // Verify the task appears
      cy.contains('Buy groceries').should('be.visible');
    });

    it('should create multiple tasks in the same day', () => {
      cy.contains('Today').parent().within(() => {
        cy.get('input[placeholder="Add a task..."]')
          .type('Task 1{enter}')
          .type('Task 2{enter}')
          .type('Task 3{enter}');
      });

      cy.contains('Task 1').should('be.visible');
      cy.contains('Task 2').should('be.visible');
      cy.contains('Task 3').should('be.visible');
    });

    it('should create tasks for different days', () => {
      // Create task for today
      cy.contains('Today').parent().within(() => {
        cy.get('input[placeholder="Add a task..."]').type('Today task{enter}');
      });

      // Create task for tomorrow
      cy.contains('Tomorrow').parent().within(() => {
        cy.get('input[placeholder="Add a task..."]').type('Tomorrow task{enter}');
      });

      cy.contains('Today task').should('be.visible');
      cy.contains('Tomorrow task').should('be.visible');
    });

    it('should not create empty tasks', () => {
      cy.contains('Today').parent().within(() => {
        cy.get('input[placeholder="Add a task..."]').type('{enter}');
      });

      // Count task items - should be 0
      cy.get('[data-testid="task-item"]').should('not.exist');
    });

    it('should clear input after creating a task', () => {
      cy.contains('Today').parent().within(() => {
        const input = cy.get('input[placeholder="Add a task..."]');
        input.type('New task{enter}');
        input.should('have.value', '');
      });
    });
  });

  describe('Task Completion', () => {
    beforeEach(() => {
      // Create a test task
      cy.createTask('Test task for completion', new Date().toISOString());
      cy.reload();
      cy.get('[data-testid="calendar-view"]').should('be.visible');
    });

    it('should toggle task completion', () => {
      // Find the task checkbox
      cy.contains('Test task for completion')
        .parent()
        .find('input[type="checkbox"]')
        .should('not.be.checked')
        .click()
        .should('be.checked');
    });

    it('should show completed tasks with strikethrough', () => {
      cy.contains('Test task for completion')
        .parent()
        .find('input[type="checkbox"]')
        .click();

      // Verify strikethrough styling
      cy.contains('Test task for completion').should(
        'have.class',
        'line-through'
      );
    });

    it('should toggle task back to incomplete', () => {
      const checkbox = cy
        .contains('Test task for completion')
        .parent()
        .find('input[type="checkbox"]');

      // Complete the task
      checkbox.click().should('be.checked');

      // Uncomplete the task
      checkbox.click().should('not.be.checked');

      // Verify no strikethrough
      cy.contains('Test task for completion').should(
        'not.have.class',
        'line-through'
      );
    });
  });

  describe('Task Deletion', () => {
    beforeEach(() => {
      cy.createTask('Task to delete', new Date().toISOString());
      cy.reload();
      cy.get('[data-testid="calendar-view"]').should('be.visible');
    });

    it('should delete a task when delete button is clicked', () => {
      cy.contains('Task to delete').should('be.visible');

      // Click delete button
      cy.contains('Task to delete')
        .parent()
        .find('[data-testid="delete-task-button"]')
        .click();

      // Verify task is removed
      cy.contains('Task to delete').should('not.exist');
    });

    it('should delete multiple tasks', () => {
      // Create multiple tasks
      cy.createTask('Task 1', new Date().toISOString());
      cy.createTask('Task 2', new Date().toISOString());
      cy.reload();
      cy.get('[data-testid="calendar-view"]').should('be.visible');

      // Delete first task
      cy.contains('Task to delete')
        .parent()
        .find('[data-testid="delete-task-button"]')
        .click();

      // Delete second task
      cy.contains('Task 1')
        .parent()
        .find('[data-testid="delete-task-button"]')
        .click();

      // Verify both are gone
      cy.contains('Task to delete').should('not.exist');
      cy.contains('Task 1').should('not.exist');
      cy.contains('Task 2').should('be.visible');
    });
  });

  describe('Task Persistence', () => {
    it('should persist tasks after page reload', () => {
      // Create a task
      cy.contains('Today').parent().within(() => {
        cy.get('input[placeholder="Add a task..."]').type('Persistent task{enter}');
      });

      // Reload the page
      cy.reload();

      // Verify task still exists
      cy.contains('Persistent task').should('be.visible');
    });

    it('should persist task completion status after reload', () => {
      // Create and complete a task
      cy.contains('Today').parent().within(() => {
        cy.get('input[placeholder="Add a task..."]').type('Complete me{enter}');
      });

      cy.contains('Complete me')
        .parent()
        .find('input[type="checkbox"]')
        .click();

      // Reload
      cy.reload();

      // Verify it's still completed
      cy.contains('Complete me')
        .parent()
        .find('input[type="checkbox"]')
        .should('be.checked');
    });
  });

  describe('Special Characters and Edge Cases', () => {
    it('should handle special characters in task text', () => {
      const specialText = 'Task with @#$%^&*() "quotes" <html>';

      cy.contains('Today').parent().within(() => {
        cy.get('input[placeholder="Add a task..."]').type(`${specialText}{enter}`);
      });

      cy.contains(specialText).should('be.visible');
    });

    it('should handle very long task text', () => {
      const longText = 'A'.repeat(200);

      cy.contains('Today').parent().within(() => {
        cy.get('input[placeholder="Add a task..."]').type(`${longText}{enter}`);
      });

      cy.contains(longText.substring(0, 50)).should('be.visible');
    });

    it('should handle emoji in task text', () => {
      const emojiText = 'Task with emoji 🎉 🚀 ✨';

      cy.contains('Today').parent().within(() => {
        cy.get('input[placeholder="Add a task..."]').type(`${emojiText}{enter}`);
      });

      cy.contains(emojiText).should('be.visible');
    });
  });
});
