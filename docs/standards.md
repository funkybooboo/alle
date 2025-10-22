# Coding Standards

Project-wide coding standards and best practices for Alle.

## General Principles

- **Readability First**: Write code that is easy to understand and maintain
- **DRY**: Avoid code duplication through abstraction
- **SOLID**: Follow SOLID design principles
- **KISS**: Prefer simple solutions over complex ones
- **YAGNI**: Don't add functionality until it's needed
- **Always Test**: All code must include tests (80%+ coverage for critical paths)
- **Minimize Mocks**: Use real implementations; only mock external services

## Version Control

- **Commits**: Present tense, under 72 chars ("Add feature" not "Added feature")
- **Branches**: `feature/`, `fix/`, `refactor/`, `hotfix/` + description
- **PRs**: Clear descriptions, link issues, ensure CI passes

## Architecture

### 12-Factor App

Follow [12-Factor App](https://12factor.net/) principles: one codebase, explicit dependencies, config in environment, stateless processes, dev/prod parity, logs as streams.

### SLSA Compliance

Follow [SLSA](https://slsa.dev/) guidelines: reproducible builds, source integrity, dependency verification, build provenance.

## Security

- **Input**: Validate and sanitize all user input; use strong types
- **Auth**: Proper authentication/authorization; use argon2/bcrypt for passwords
- **Secrets**: Store in environment variables; never commit credentials
- **Dependencies**: Keep updated; run security audits regularly

## API Design

- **REST**: Resource-based endpoints, appropriate HTTP methods and status codes
- **Errors**: Consistent format, helpful messages, no sensitive data exposure
- **Docs**: Use OpenAPI/Swagger with examples
- **Versioning**: Version breaking changes

## Performance & Monitoring

- **Optimize**: Profile before optimizing; focus on correctness first
- **Cache**: Implement caching for critical paths
- **Monitor**: Structured logging, metrics, alerting, distributed tracing

## Accessibility

- **WCAG 2.1 AA**: Full keyboard navigation, screen reader support, color contrast, semantic HTML

## CI/CD

- **CI**: Automated tests, linting, builds must pass; code review required
- **CD**: Automated deployments, rollback strategy, environment parity

## Package-Specific Standards

For detailed standards specific to each package, see:

- [Client Standards](../packages/client/docs/standards.md) - React/TypeScript frontend standards
- [Server Standards](../packages/server/docs/standards.md) - Rust backend standards
