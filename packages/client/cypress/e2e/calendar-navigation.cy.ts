describe('Calendar Navigation E2E Tests', () => {
  beforeEach(() => {
    cy.clearTasks();
    cy.visit('/');
    cy.get('[data-testid="calendar-view"]', { timeout: 10000 }).should('be.visible');
  });

  describe('Calendar Display', () => {
    it('should display all 5 day columns', () => {
      // Should show 5 days (2 past, today, 2 future)
      cy.get('[data-testid="day-column"]').should('have.length', 5);
    });

    it('should display correct day labels', () => {
      // Should show the correct labels
      cy.contains('Today').should('be.visible');
      cy.contains('Tomorrow').should('be.visible');
    });

    it('should highlight today column', () => {
      cy.contains('Today')
        .parent('[data-testid="day-column"]')
        .should('have.class', 'bg-blue-50');
    });
  });

  describe('Today Button Navigation', () => {
    it('should have a Today button visible', () => {
      cy.get('[data-testid="today-button"]').should('be.visible');
    });

    it('should scroll to today when Today button is clicked', () => {
      // Click today button
      cy.get('[data-testid="today-button"]').click();

      // Verify today column is visible and in view
      cy.contains('Today').should('be.visible');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support Escape key to clear input', () => {
      cy.contains('Today').parent().within(() => {
        const input = cy.get('input[placeholder="Add a task..."]');

        // Type some text
        input.type('Some text');

        // Press Escape
        input.type('{esc}');

        // Input should be cleared
        input.should('have.value', '');
      });
    });

    it('should support Enter key to submit task', () => {
      cy.contains('Today').parent().within(() => {
        cy.get('input[placeholder="Add a task..."]').type('New task{enter}');
      });

      cy.contains('New task').should('be.visible');
    });
  });

  describe('Responsive Behavior', () => {
    it('should display correctly on desktop viewport', () => {
      cy.viewport(1280, 720);
      cy.get('[data-testid="calendar-view"]').should('be.visible');
      cy.get('[data-testid="day-column"]').should('have.length', 5);
    });

    it('should display correctly on tablet viewport', () => {
      cy.viewport(768, 1024);
      cy.get('[data-testid="calendar-view"]').should('be.visible');
    });

    it('should display correctly on mobile viewport', () => {
      cy.viewport(375, 667);
      cy.get('[data-testid="calendar-view"]').should('be.visible');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no tasks exist', () => {
      // Verify empty state message
      cy.contains('Today').parent().within(() => {
        cy.get('[data-testid="task-item"]').should('not.exist');
      });
    });

    it('should show input placeholder in empty columns', () => {
      cy.get('input[placeholder="Add a task..."]').should('have.length.at.least', 5);
    });
  });

  describe('Date Formatting', () => {
    it('should display dates in correct format', () => {
      // Today and Tomorrow should be labeled
      cy.contains('Today').should('be.visible');
      cy.contains('Tomorrow').should('be.visible');

      // Other days should show date format (e.g., "Nov 3" or similar)
      cy.get('[data-testid="day-column"]').should('contain.text', /\w{3}\s\d{1,2}/);
    });
  });
});
