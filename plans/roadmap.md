# Roadmap

This document outlines the development roadmap for Alle. We use semantic versioning to define chunks of work and track our progress.

## v0.1.0: Foundations

This release focuses on establishing the project's foundation, including the core architecture, development environment, and documentation.

- [x] **Monorepo Setup:** Set up a monorepo with `bun` to manage the `client`, `server`, and `shared` packages.
- [x] **Tech Stack:**
    -   Frontend: Svelte with SvelteKit
    -   Backend: Bun
    -   Language: TypeScript
- [x] **Architecture:** Implement a clean, modular architecture using the Adapter Pattern.
- [x] **Code Quality:** Configure Biome for formatting and linting.
- [x] **API:**
    -   Setup basic CRUD endpoints for tasks.
    -   Use Bun's built-in HTTP server.
- [x] **Client:**
    -   Setup basic client with a simple UI to display tasks.
- [x] **Documentation:**
    -   Create comprehensive documentation for architecture, code standards, testing, and more.
- [x] **Testing:**
    -   Setup Playwright for E2E testing.
    -   Setup Bruno for API testing.

## v0.1.1: Refactor to Svelte
This release is dedicated to replacing the initial React client with a new SvelteKit application.
- [ ] **Scaffold SvelteKit App:** Create a new SvelteKit application in the `packages/client` directory.
- [ ] **Setup Basic UI:** Re-create the basic UI for displaying tasks in Svelte.
- [ ] **Ensure Feature Parity:** The Svelte client should have the same basic functionality as the original React client.

### Technical Notes & Considerations
- This will be a "rip and replace" of the `packages/client` directory.
- Storybook and Playwright configurations will need to be updated for Svelte.

### Definition of Done
- The `packages/client` directory contains a clean, working SvelteKit application.
- The basic UI for displaying tasks is functional.
- All previous client-side functionality (as of `v0.1.0`) is implemented in the new Svelte client.

## v0.2.0: Core Task Model
This release focuses on the in-memory data structures and business logic for tasks.
- [ ] **Task CRUD:** Implement the fundamental Create, Read, Update, and Delete operations for tasks in memory.
- [ ] **Task Completion:** Allow tasks to be marked as complete and visually distinguished from incomplete tasks.
- [ ] **Future & Someday Tasks:**
    - [ ] Implement the ability to assign tasks to a future date.
    - [ ] Create a dedicated "Someday" or "Inbox" area for tasks without a specific due date.

### Technical Notes & Considerations
- The `Task` model should be defined in the `packages/shared` directory to be used by both the client and server.
- Business logic (e.g., how tasks are sorted, what fields are required) should be kept within the core model definition.

### Definition of Done
- The `Task` model is fully defined with all necessary fields.
- All CRUD operations are functional and have unit tests.
- The concept of "Someday" tasks is implemented and tested.

## v0.3.0: API Endpoints
This release focuses on creating the API for interacting with the task model.
- [ ] **Task API:** Create API endpoints for all Task CRUD operations.
- [ ] **Date API:** Create API endpoints for fetching tasks by date.

### Technical Notes & Considerations
- A RESTful API design should be used.
- All API endpoints should be documented using a standard like OpenAPI.
- Zod or a similar library should be used for robust input validation on the server.

### Definition of Done
- All API endpoints are implemented and tested with Bruno.
- API documentation is generated and up-to-date.
- Input validation is implemented for all endpoints.

## v0.4.0: Basic UI
This release focuses on creating a minimal UI to display and interact with tasks.
- [ ] **Display Tasks:** Create a UI to display tasks for a given day.
- [ ] **Interact with Tasks:** Create a UI to create, edit, delete, and complete tasks.

### Technical Notes & Considerations
- The UI should be built with Svelte and SvelteKit.
- Svelte's built-in stores should be sufficient for state management in the early stages.
- All new UI components should be developed in Storybook for isolation and testing.

### Definition of Done
- Users can view a list of tasks for a given day.
- Users can create, edit, delete, and complete tasks through the UI.
- All new UI components have stories in Storybook.

## v0.5.0: Keyboard Navigation & Actions
This release focuses on the core keyboard navigation and actions.
- [ ] **Keyboard Navigation:** Implement a system for navigating between days, weeks, and tasks using only the keyboard (e.g., arrow keys, `j`/`k`).
- [ ] **Keyboard Actions:** All core actions (create, edit, delete, complete, move) must be triggerable via keyboard shortcuts (e.g., `n` for new, `e` for edit, `d` for delete).

### Technical Notes & Considerations
- A library like `mousetrap` or `hotkeys-js` could be used to manage keyboard shortcuts.
- The focus management system will be critical for a good keyboard-first experience. Pay close attention to how focus shifts after an action is performed.

### Definition of Done
- All UI elements are navigable using the keyboard.
- All core actions are triggerable with keyboard shortcuts.
- E2E tests are created to verify all keyboard interactions.

## v0.6.0: Drag-and-Drop
This release introduces drag-and-drop as a secondary interaction method.
- [ ] **Drag-and-Drop:** Allow tasks to be reordered and moved between days via drag-and-drop.

### Technical Notes & Considerations
- A library like `svelte-dnd-action` should be evaluated for this feature.
- Accessibility is a key concern for drag-and-drop. Ensure that there is a keyboard-accessible alternative for all drag-and-drop actions (this is covered in v0.5.0).

### Definition of Done
- Tasks can be reordered within a day using drag-and-drop.
- Tasks can be moved between days using drag-and-drop.
- E2E tests are created to verify all drag-and-drop interactions.

## v0.7.0: Layout & Responsiveness
This release focuses on the visual organization of the UI and ensuring it works on different screen sizes.
- [ ] **Weekly Layout:** Design and implement a primary view that shows tasks for an entire week, providing context and clarity.
- [ ] **Responsive Design:** Ensure the layout is usable on a variety of screen sizes, from mobile to desktop.

### Technical Notes & Considerations
- A CSS-in-JS library (e.g., Styled Components, Emotion) or a utility-first CSS framework (e.g., Tailwind CSS) should be chosen to handle styling. The choice will have a significant impact on the developer experience.
- The weekly layout should be the default on larger screens, while a daily or agenda view might be more appropriate for smaller screens.

### Definition of Done
- The weekly layout is implemented and functional.
- The application is fully responsive and usable on mobile, tablet, and desktop screen sizes.
- E2E tests are created to verify the responsive behavior.

## v0.8.0: I/O & Data
This release implements the I/O agnostic persistence layer and data export functionality.
- [ ] **I/O Abstraction Layer:** Solidify the I/O adapter pattern to ensure the application core is completely independent of the data source.
- [ ] **Persistence Adapters:**
    - [ ] **In-Memory:** Create an adapter for storing data in memory, suitable for testing and ephemeral sessions.
    - [ ] **File System:** Implement an adapter that persists data to a local file (e.g., JSON, or a self-contained SQLite database).
    - [ ] **Database:** Implement an adapter for a full-fledged database like PostgreSQL, with Redis for optional caching to improve performance.
- [ ] **Configuration:** Allow the user to easily configure their desired persistence method via a configuration file or environment variables.
- [ ] **Data Export:**
    - [ ] Implement a one-click "Export All Data" feature.
    - [ ] Ensure the export format is well-documented and portable (e.g., a structured JSON or a set of human-readable Markdown files).

### Technical Notes & Considerations
- The choice of file system adapter (single JSON file vs. directory of Markdown files) will impact the complexity of the implementation. A single JSON file is likely simpler to start with.
- For the database adapter, a lightweight ORM like Prisma or Drizzle ORM could be used to simplify database interactions.
- The configuration system should be able to read from both environment variables and a configuration file. A library like `dotenv` can be used for this.

### Definition of Done
- The I/O abstraction layer is fully implemented and tested.
- All three persistence adapters (in-memory, file system, database) are implemented and have unit tests.
- The data export feature is functional and produces a well-formatted output.

## v0.9.0: UI Polish & Theming
This release is dedicated to refining the user interface and experience, creating a calm, modern, and productive aesthetic.
- [ ] **UI/UX Vision:**
    - [ ] Conduct a design pass to create a cohesive visual language that borrows the simplicity of TeuxDeux and the clarity of Basecamp.
    - [ ] Ensure all necessary UI elements are readily accessible, minimizing clicks and context switching.
- [ ] **Theming:**
    - [ ] Implement a robust theming system.
    - [ ] Create polished, high-contrast light and dark modes.
- [ ] **Focus & Clarity:** Refine animations, transitions, and visual feedback to create a calm, focused, and productive feel.

### Technical Notes & Considerations
- A design system should be established to ensure consistency across the application. This includes defining a color palette, typography, spacing, and component styles.
- The theming system should be built in a way that makes it easy to add new themes in the future. CSS variables are a good choice for this.
- Svelte's built-in transition and animation functions should be sufficient for most animations.

### Definition of Done
- A clear, consistent design system is in place.
- The light and dark themes are fully implemented and polished.
- The application has a calm, focused, and productive feel, with subtle and meaningful animations.

## v0.10.0: Basic Automation
This release introduces the first set of automation features to reduce manual effort and make the app smarter.
- [ ] **Task Rollover:** Automatically move any unfinished tasks from the previous day to the current day.
- [ ] **Recurring Tasks:**
    - [ ] Implement a system for creating tasks that recur on a daily, weekly, or monthly basis.
    - [ ] Ensure recurring tasks are automatically created for the appropriate day.

### Technical Notes & Considerations
- A library for handling recurring dates (e.g., `rrule.js`) will be necessary.
- The logic for creating recurring tasks should be handled by a background job or a cron job to avoid blocking the main thread.
- The task rollover feature should be configurable by the user (e.g., they can turn it on or off).

### Definition of Done
- The task rollover feature is fully functional and configurable.
- The recurring tasks feature is fully functional and supports daily, weekly, and monthly recurrence.
- Unit and E2E tests are created for both features.

## v0.11.0: User Accounts
This release adds multi-user support.
- [ ] **User Authentication:**
    - [ ] Implement user registration and login.
    - [ ] Securely store user credentials.
- [ ] **Data Scoping:** Associate all tasks and related data with a specific user account.

### Technical Notes & Considerations
- A library like Passport.js could be used to handle authentication strategies.
- JWTs (JSON Web Tokens) should be used for session management.
- All API endpoints must be protected to ensure that users can only access their own data. This will require a middleware that checks for a valid JWT on each request.

### Definition of Done
- Users can register, login, and logout.
- All tasks are associated with a user account.
- All API endpoints are protected and properly scoped to the authenticated user.
- E2E tests are created for all authentication and authorization flows.

## v0.12.0: Markdown Support
This release enhances the task description format.
- [ ] **Markdown Rendering:**
    - [ ] Integrate a Markdown parser to render task descriptions.
    - [ ] Support basic formatting like headers, bold, italics, lists, and links.

### Technical Notes & Considerations
- A library like `marked` should be used for rendering Markdown.
- Sanitization of the user-provided Markdown is critical to prevent XSS attacks. A library like `dompurify` should be used.

### Definition of Done
- Task descriptions are rendered as Markdown.
- All user-provided HTML is sanitized to prevent XSS attacks.
- E2E tests are created to verify Markdown rendering and sanitization.


## v1.0.0: Public Release

This will be the first stable, public release of Alle. It will include all the features from the previous releases, plus any additional polishing and bug fixes.

*   **[ ] Polishing:**
    *   [ ] Finalize the UI/UX.
    *   [ ] Ensure the application is responsive and works well on all devices.
    *   [ ] Implement an "Undo" feature for common actions.
*   **[ ] Core Features:**
    *   [ ] Implement a system for sending reminders.
    *   [ ] Allow users to define custom colors for tasks and display a legend.
    *   [ ] Allow users to set their local timezone.
    *   [ ] Allow users to select and act on multiple tasks at once.
    *   [ ] Implement a powerful and intuitive search functionality.
    *   [ ] Automatically detect and render links in task descriptions.
*   **[ ] Deployment:**
    *   [ ] Dockerize the application.
    -   [ ] Set up a CI/CD pipeline for automated testing and deployment.
*   **[ ] Internationalization:**
    *   [ ] Add support for multiple languages.

### Technical Notes & Considerations
- A library like `i18next` should be used to manage translations.
- The CI/CD pipeline should be configured to run all tests, and then build and deploy the application to a hosting provider (e.g., Vercel, Netlify, or a cloud provider like AWS or GCP).
- Docker images should be optimized for size and security.

### Definition of Done
- The application is feature-complete as defined by the previous releases.
- The application is stable and has been thoroughly tested.
- The application is deployed and publicly accessible.

## v1.1.0: Advanced Task Management
- [ ] **Multi-select Items:** Allow users to select and act on multiple tasks at once.
- [ ] **Turn Recurring Tasks On/Off:** Easily toggle recurring tasks without deleting them.
- [ ] **Order Recurring Items:** Allow users to define a specific order for recurring tasks.
- [ ] **Better Searching:** Implement a more powerful and intuitive search functionality.
- [ ] **Support for Links:** Automatically detect and render links in task descriptions.

## v1.2.0: Advanced Automation
- [ ] **2-Day Rule:** Priority rises over time for recurring items that are not completed. Non-recurring items are moved to the next day.
- [ ] **Conditional Tasks:** Set conditions on tasks (e.g., "complete X tasks this week to unlock Y").
- [ ] **Smart Task Sorting:** Automatically sort and prioritize tasks based on due dates, priority flags, or other user-defined rules.
- [ ] **Auto Project/Course Scheduling:** Automatically schedule and shift project or course-related tasks based on user-defined timelines and dependencies.
- [ ] **Cron Scheduling:** Advanced scheduling options for tasks using cron expressions.

## v1.3.0: UI & Customization
- [ ] **Custom Colors & Legend:** Let users define custom colors for tasks and display a legend.
- [ ] **Adjustable Panes:** Allow users to resize different parts of the UI.
- [ ] **Custom Keybindings:** Allow users to create their own custom keybindings.
- [ ] **Timezone Support:** Allow users to set their local timezone.

## v1.4.0: Collaboration
- [ ] **Share Calendars:**
    - [ ] Share calendars/task lists with other users.
    - [ ] Set read-only or edit access.
- [ ] **Email Sharing:** Integrate with the standard email sharing API to share tasks.

## v1.5.0: Personal Wellness
- [ ] **Habit Trackers:**
    - [ ] Track habits and view statistics over time.
    - [ ] Include a happiness tracker.
- [ ] **Daily Journal:**
    - [ ] A space for daily journaling.
    - [ ] Sync with Obsidian.

## v2.0.0: Major New Features

- [ ] **Project Boards:** Introduce Kanban-style project boards for more complex workflows.
- [ ] **Integrations:** Integrate with other services like calendars or project management tools.
- [ ] **Expense Tracker:**
    - [ ] Basic expense tracking and budgeting.
    - [ ] Potential integration with services like [Fintable](https://fintable.io/).
- [ ] **Automatic Meal Planner:**
    - [ ] Generate meal plans and recipes.
    - [ ] Integrate with a recipe API like [TheMealDB](https://www.themealdb.com/api.php).
- [ ] **Automatic Exercise Planner:**
    - [ ] Suggest workouts based on user goals and available equipment.
    - [ ] Integrate with data from sources like [Kaggle Gym Exercise Data](https://www.kaggle.com/datasets/niharika41298/gym-exercise-data).
- [ ] **Mobile App:** Create a native mobile app for iOS and Android.
