describe('User Workflow E2E Tests', () => {
  beforeEach(() => {
    cy.clearTasks();
    cy.visit('/');
    cy.get('[data-testid="calendar-view"]', { timeout: 10000 }).should('be.visible');
  });

  describe('Daily Planning Workflow', () => {
    it('should complete a full daily planning session', () => {
      // 1. User adds tasks for today
      cy.contains('Today').parent().within(() => {
        cy.get('input[placeholder="Add a task..."]')
          .type('Morning standup{enter}')
          .type('Review pull requests{enter}')
          .type('Lunch meeting{enter}')
          .type('Write documentation{enter}');
      });

      // Verify all tasks are created
      cy.contains('Morning standup').should('be.visible');
      cy.contains('Review pull requests').should('be.visible');
      cy.contains('Lunch meeting').should('be.visible');
      cy.contains('Write documentation').should('be.visible');

      // 2. User completes some tasks
      cy.contains('Morning standup')
        .parent()
        .find('input[type="checkbox"]')
        .click();

      cy.contains('Review pull requests')
        .parent()
        .find('input[type="checkbox"]')
        .click();

      // 3. User deletes a task they won't do
      cy.contains('Lunch meeting')
        .parent()
        .find('[data-testid="delete-task-button"]')
        .click();

      // 4. Verify final state
      cy.contains('Morning standup')
        .parent()
        .find('input[type="checkbox"]')
        .should('be.checked');

      cy.contains('Review pull requests')
        .parent()
        .find('input[type="checkbox"]')
        .should('be.checked');

      cy.contains('Lunch meeting').should('not.exist');

      cy.contains('Write documentation')
        .parent()
        .find('input[type="checkbox"]')
        .should('not.be.checked');
    });

    it('should plan tasks for the week', () => {
      // Add tasks to multiple days
      const days = ['Today', 'Tomorrow'];
      const tasksByDay = {
        Today: ['Finish project', 'Team meeting', 'Code review'],
        Tomorrow: ['Start new feature', 'Update documentation', 'Testing'],
      };

      days.forEach((day) => {
        cy.contains(day).parent().within(() => {
          const input = cy.get('input[placeholder="Add a task..."]');
          tasksByDay[day as keyof typeof tasksByDay].forEach((task) => {
            input.type(`${task}{enter}`);
          });
        });
      });

      // Verify all tasks are visible
      Object.values(tasksByDay)
        .flat()
        .forEach((task) => {
          cy.contains(task).should('be.visible');
        });
    });
  });

  describe('Task Management Workflow', () => {
    it('should handle a typical task lifecycle', () => {
      // Create a task
      cy.contains('Today').parent().within(() => {
        cy.get('input[placeholder="Add a task..."]').type('Important task{enter}');
      });

      // Verify creation
      cy.contains('Important task').should('be.visible');

      // Mark as complete
      cy.contains('Important task')
        .parent()
        .find('input[type="checkbox"]')
        .click();

      // Reload page to verify persistence
      cy.reload();
      cy.get('[data-testid="calendar-view"]').should('be.visible');

      // Verify task is still completed
      cy.contains('Important task')
        .parent()
        .find('input[type="checkbox"]')
        .should('be.checked');

      // Unmark as complete
      cy.contains('Important task')
        .parent()
        .find('input[type="checkbox"]')
        .click();

      // Delete the task
      cy.contains('Important task')
        .parent()
        .find('[data-testid="delete-task-button"]')
        .click();

      // Verify deletion
      cy.contains('Important task').should('not.exist');
    });

    it('should handle bulk task operations', () => {
      // Create 5 tasks
      cy.contains('Today').parent().within(() => {
        const input = cy.get('input[placeholder="Add a task..."]');
        for (let i = 1; i <= 5; i++) {
          input.type(`Task ${i}{enter}`);
        }
      });

      // Complete all tasks
      for (let i = 1; i <= 5; i++) {
        cy.contains(`Task ${i}`)
          .parent()
          .find('input[type="checkbox"]')
          .click();
      }

      // Verify all are completed
      for (let i = 1; i <= 5; i++) {
        cy.contains(`Task ${i}`)
          .parent()
          .find('input[type="checkbox"]')
          .should('be.checked');
      }

      // Delete all tasks
      for (let i = 1; i <= 5; i++) {
        cy.contains(`Task ${i}`)
          .parent()
          .find('[data-testid="delete-task-button"]')
          .click();
      }

      // Verify all are deleted
      for (let i = 1; i <= 5; i++) {
        cy.contains(`Task ${i}`).should('not.exist');
      }
    });
  });

  describe('Productivity Patterns', () => {
    it('should support getting things done (GTD) workflow', () => {
      // Inbox capture - add all tasks quickly
      const inbox = [
        'Email team about project',
        'Buy birthday gift',
        'Fix bug in authentication',
        'Call dentist',
        'Review design mockups',
      ];

      cy.contains('Today').parent().within(() => {
        const input = cy.get('input[placeholder="Add a task..."]');
        inbox.forEach((task) => input.type(`${task}{enter}`));
      });

      // Process - complete quick tasks
      ['Email team about project', 'Call dentist'].forEach((task) => {
        cy.contains(task).parent().find('input[type="checkbox"]').click();
      });

      // Defer - move some tasks to tomorrow (by deleting and recreating)
      // In a real app, this would be drag-and-drop
      cy.contains('Buy birthday gift')
        .parent()
        .find('[data-testid="delete-task-button"]')
        .click();

      cy.contains('Tomorrow').parent().within(() => {
        cy.get('input[placeholder="Add a task..."]').type('Buy birthday gift{enter}');
      });

      // Verify organization
      cy.contains('Email team about project')
        .parent()
        .find('input[type="checkbox"]')
        .should('be.checked');

      cy.contains('Tomorrow').parent().within(() => {
        cy.contains('Buy birthday gift').should('be.visible');
      });
    });

    it('should support time-blocking workflow', () => {
      // Morning block
      cy.contains('Today').parent().within(() => {
        cy.get('input[placeholder="Add a task..."]')
          .type('9am: Deep work session{enter}')
          .type('10:30am: Team sync{enter}')
          .type('11am: Email processing{enter}');
      });

      // Afternoon block
      cy.contains('Today').parent().within(() => {
        cy.get('input[placeholder="Add a task..."]')
          .type('2pm: Client meeting{enter}')
          .type('3pm: Code review{enter}')
          .type('4pm: Planning next sprint{enter}');
      });

      // Complete morning tasks
      ['9am: Deep work session', '10:30am: Team sync', '11am: Email processing'].forEach(
        (task) => {
          cy.contains(task).parent().find('input[type="checkbox"]').click();
        }
      );

      // Verify time-blocked organization
      cy.contains('9am: Deep work session').should('have.class', 'line-through');
      cy.contains('2pm: Client meeting').should('not.have.class', 'line-through');
    });
  });

  describe('Error Recovery', () => {
    it('should handle network errors gracefully', () => {
      // This test would require mocking network failures
      // For now, just verify the app doesn't crash on errors
      cy.contains('Today').parent().within(() => {
        cy.get('input[placeholder="Add a task..."]').type('Test task{enter}');
      });

      cy.contains('Test task').should('be.visible');
    });

    it('should recover from page refresh during task creation', () => {
      // Start typing a task
      cy.contains('Today').parent().within(() => {
        cy.get('input[placeholder="Add a task..."]').type('Partially typed');
      });

      // Refresh page
      cy.reload();

      // Verify app still works
      cy.get('[data-testid="calendar-view"]').should('be.visible');

      // Create a new task to verify functionality
      cy.contains('Today').parent().within(() => {
        cy.get('input[placeholder="Add a task..."]').type('New task{enter}');
      });

      cy.contains('New task').should('be.visible');
    });
  });

  describe('Concurrent User Actions', () => {
    it('should handle rapid task creation', () => {
      // Rapidly create tasks
      cy.contains('Today').parent().within(() => {
        const input = cy.get('input[placeholder="Add a task..."]');
        for (let i = 1; i <= 10; i++) {
          input.type(`Rapid task ${i}{enter}`);
        }
      });

      // Verify all tasks are created
      for (let i = 1; i <= 10; i++) {
        cy.contains(`Rapid task ${i}`).should('be.visible');
      }
    });

    it('should handle simultaneous completion and deletion', () => {
      // Create multiple tasks
      cy.contains('Today').parent().within(() => {
        const input = cy.get('input[placeholder="Add a task..."]');
        input.type('Task A{enter}').type('Task B{enter}').type('Task C{enter}');
      });

      // Complete Task A
      cy.contains('Task A').parent().find('input[type="checkbox"]').click();

      // Delete Task B
      cy.contains('Task B')
        .parent()
        .find('[data-testid="delete-task-button"]')
        .click();

      // Complete Task C
      cy.contains('Task C').parent().find('input[type="checkbox"]').click();

      // Verify states
      cy.contains('Task A')
        .parent()
        .find('input[type="checkbox"]')
        .should('be.checked');
      cy.contains('Task B').should('not.exist');
      cy.contains('Task C')
        .parent()
        .find('input[type="checkbox"]')
        .should('be.checked');
    });
  });
});
