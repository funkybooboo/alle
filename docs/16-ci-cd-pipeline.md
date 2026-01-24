# CI/CD Pipeline

This document defines the continuous integration and continuous deployment pipeline for the Alle project, including quality gates, automated checks, and deployment workflows.

## Philosophy

Our CI/CD approach prioritizes:

- **Automated quality gates** — no manual approval for checks
- **Fast feedback** — results in under 5 minutes
- **Fail fast** — catch errors early in pipeline
- **Reproducible builds** — same code produces same artifact
- **Safe deployments** — gradual rollout with monitoring
- **Zero-downtime** — deploy without service interruption

---

## Pipeline Overview

```
┌──────────────────────────────────────────────────────────┐
│                   COMMIT TO BRANCH                       │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│              CONTINUOUS INTEGRATION (CI)                 │
│                                                          │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │  Code Quality   │  │  Build & Test   │              │
│  │  - Lint         │  │  - Type check   │              │
│  │  - Format       │  │  - Unit tests   │              │
│  │  - Security     │  │  - Integration  │              │
│  └─────────────────┘  │  - E2E tests    │              │
│                       │  - API tests    │              │
│                       └─────────────────┘              │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │           AI Agent Reviews (Parallel)                ││
│  │  - Security  - Performance  - Code Quality          ││
│  │  - Test Quality  - Documentation  - Git Quality     ││
│  └─────────────────────────────────────────────────────┘│
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│                   MERGE TO MAIN                          │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│          CONTINUOUS DEPLOYMENT (CD)                      │
│                                                          │
│  Build Production   →   Deploy Staging   →   Tests      │
│      Artifact               Auto Deploy       Smoke      │
│                                              Validate    │
│                                                  │       │
│                                                  ▼       │
│                        Deploy Production (Gradual)       │
│                        10% → 50% → 100%                 │
│                                                          │
│                        Monitor & Alert                   │
└──────────────────────────────────────────────────────────┘
```

---

## Quality Gates (ALL MUST PASS)

**RULE**: Merging to main is BLOCKED unless all gates pass.

### 1. Code Linting

```yaml
# .github/workflows/ci.yml
- name: Lint code
  run: bun run lint:check
```

**What it checks**:
- Biome linting rules
- Code style consistency
- Naming conventions
- Import organization
- Complexity limits

**Failure criteria**: Any linting error

### 2. Code Formatting

```yaml
- name: Check formatting
  run: bun run format:check
```

**What it checks**:
- Consistent indentation (4 spaces)
- Line length (100 chars)
- Trailing whitespace
- File endings (LF)

**Failure criteria**: Any formatting difference

### 3. Type Checking

```yaml
- name: Type check
  run: bun run type-check
```

**What it checks**:
- TypeScript strict mode compliance
- No implicit any
- All return types declared
- No type errors

**Failure criteria**: Any type error

### 4. Unit Tests

```yaml
- name: Run unit tests
  run: bun run test:unit --coverage
```

**What it checks**:
- All unit tests pass
- Code coverage ≥ 85%
- No flaky tests (run 3 times)

**Failure criteria**:
- Any test fails
- Coverage < 85%
- Tests take > 30 seconds

### 5. Integration Tests

```yaml
- name: Run integration tests
  run: bun run test:integration
```

**What it checks**:
- Database operations work
- Docker containers start correctly
- Service integrations function
- Data consistency maintained

**Failure criteria**:
- Any test fails
- Containers fail to start
- Tests take > 2 minutes

### 6. End-to-End Tests

```yaml
- name: Run E2E tests
  run: bun run test:e2e
```

**What it checks**:
- User workflows complete successfully
- Cross-browser compatibility
- Accessibility compliance (WCAG 2.1 AA)
- Performance benchmarks met

**Failure criteria**:
- Any test fails
- Accessibility violations
- Response time > 2x baseline
- Tests take > 5 minutes

### 7. API Tests

```yaml
- name: Run API tests
  run: bun run test:api
```

**What it checks**:
- All endpoints respond correctly
- Request/response schemas valid
- Error scenarios handled
- Authentication/authorization works

**Failure criteria**:
- Any endpoint fails
- Schema validation errors
- Status codes incorrect

### 8. Build Validation

```yaml
- name: Build application
  run: bun run build
```

**What it checks**:
- Code compiles successfully
- No build warnings
- Bundle size within limits
- Dependencies resolve correctly

**Failure criteria**:
- Build fails
- Bundle size > 500KB (client)
- Critical warnings present

### 9. Security Scanning

```yaml
- name: Security audit
  run: bun audit
```

**What it checks**:
- Known vulnerabilities in dependencies
- Security advisories
- Outdated packages with CVEs

**Failure criteria**:
- High or critical vulnerabilities
- Security advisories unaddressed

### 10. Performance Tests

```yaml
- name: Performance benchmarks
  run: bun run test:performance
```

**What it checks**:
- API response times
- Database query performance
- Frontend load times
- Memory usage

**Failure criteria**:
- Response time regression > 20%
- Memory leak detected
- Failed performance budget

---

## AI Agent Integration

**NOTE**: AI agents provide recommendations but don't block merges (yet).

See `.ai-agents/` folder for detailed prompts (when implemented).

### Agent Execution

```yaml
- name: AI Code Review
  run: |
    bun run ai-agents/security-agent.ts
    bun run ai-agents/performance-agent.ts
    bun run ai-agents/code-quality-agent.ts
    bun run ai-agents/test-quality-agent.ts
    bun run ai-agents/documentation-agent.ts
    bun run ai-agents/git-quality-agent.ts
```

### Agent Output

Agents post comments on pull requests with:
- **Score** (0-10)
- **Issues Found** (critical, warnings, suggestions)
- **Recommendations**
- **Decision** (AUTO-APPROVE, REQUEST-CHANGES, MANUAL-REVIEW)

---

## GitHub Actions Workflow

### Complete CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Lint code
        run: bun run lint:check

      - name: Check formatting
        run: bun run format:check

      - name: Type check
        run: bun run type-check

  tests:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run unit tests
        run: bun run test:unit --coverage

      - name: Run integration tests
        run: bun run test:integration
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db

      - name: Run E2E tests
        run: bun run test:e2e

      - name: Run API tests
        run: bun run test:api

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  build:
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Build application
        run: bun run build

      - name: Check bundle size
        run: |
          SIZE=$(du -sb dist/client | cut -f1)
          MAX_SIZE=512000  # 500KB
          if [ $SIZE -gt $MAX_SIZE ]; then
            echo "Bundle size $SIZE exceeds limit $MAX_SIZE"
            exit 1
          fi

  security:
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Security audit
        run: bun audit

      - name: Dependency review
        uses: actions/dependency-review-action@v3
        if: github.event_name == 'pull_request'
```

### Deployment Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Build application
        run: bun run build
        env:
          NODE_ENV: production

      - name: Deploy to staging
        run: |
          # Deploy to staging environment
          # (e.g., Cloud Run, Vercel, etc.)

      - name: Run smoke tests
        run: |
          # Verify deployment is healthy
          curl -f https://staging.alle.app/health

      - name: Notify team
        run: echo "Staging deployed successfully"

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to production (gradual rollout)
        run: |
          # Deploy 10% traffic
          deploy.sh --traffic=10

          # Wait and monitor
          sleep 300  # 5 minutes

          # If healthy, deploy 50%
          deploy.sh --traffic=50

          # Wait and monitor
          sleep 300

          # If healthy, deploy 100%
          deploy.sh --traffic=100
```

---

## Branch Protection Rules

**REQUIRED GitHub settings for `main` branch**:

### Merge Requirements

- ✅ Require pull request before merging
- ✅ Require approvals: **1 minimum**
- ✅ Dismiss stale pull request approvals when new commits pushed
- ✅ Require review from code owners
- ✅ Require approval of the most recent reviewable push

### Status Checks

- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- **Required checks**:
  - `quality-checks` (lint, format, type-check)
  - `tests` (unit, integration, E2E, API)
  - `build` (successful build)
  - `security` (audit passing)

### Additional Rules

- ✅ Require conversation resolution before merging
- ✅ Require signed commits (recommended)
- ✅ Include administrators (no bypass)
- ✅ Restrict who can push to matching branches
- ❌ Allow force pushes: **DISABLED**
- ❌ Allow deletions: **DISABLED**

---

## Deployment Strategies

### 1. Staging Environment

**Purpose**: Pre-production validation

**Deployment**:
- Automatic on merge to `main`
- Same infrastructure as production
- Real data anonymized or synthetic

**Validation**:
- Smoke tests run automatically
- Manual QA testing
- Performance monitoring
- Product owner approval

### 2. Production Deployment

**Strategy**: Gradual rollout (canary deployment)

**Steps**:
1. **10% traffic** — Deploy to 10% of users
   - Monitor error rates
   - Monitor response times
   - Monitor user complaints
   - Duration: 5-10 minutes

2. **50% traffic** — If healthy, deploy to 50%
   - Continue monitoring
   - Duration: 5-10 minutes

3. **100% traffic** — If healthy, deploy to all users
   - Final monitoring
   - Announcement to team

**Rollback Criteria** (automatic):
- Error rate > 1%
- Response time > 2x baseline
- Memory usage > 90%
- Critical errors in logs

### 3. Hotfix Deployment

**When**: Critical bugs in production

**Process**:
1. Create hotfix branch from main
2. Fix bug with minimal changes
3. Fast-track code review (1 approval)
4. Run all CI checks
5. Deploy directly to production (skip staging)
6. Monitor closely

---

## Monitoring and Alerting

### Metrics to Monitor

**Application Health**:
- Error rate (target: < 0.1%)
- Response time (target: < 200ms p95)
- Throughput (requests per second)
- Availability (target: 99.9%)

**Infrastructure**:
- CPU usage (target: < 70%)
- Memory usage (target: < 80%)
- Disk usage (target: < 80%)
- Network latency

**Business Metrics**:
- Active users
- Task creation rate
- Task completion rate
- User engagement

### Alerts

**Critical (immediate response)**:
- Service down (availability < 99%)
- Error rate > 5%
- Database connection failures
- Security breach detected

**Warning (review within 1 hour)**:
- Error rate > 1%
- Response time > 500ms
- Memory usage > 85%
- Disk usage > 85%

**Info (review daily)**:
- Error rate > 0.1%
- Response time > 300ms
- Low test coverage on new code
- Dependencies with updates

---

## Rollback Procedures

### Automatic Rollback

Triggered when:
- Error rate exceeds 1% for 5 minutes
- Critical errors detected
- Health checks fail
- Deployment validation fails

### Manual Rollback

```bash
# Revert to previous version
git revert HEAD
git push origin main

# Or rollback deployment
deploy.sh --rollback --version=v1.2.3
```

### Post-Rollback

1. Investigate root cause
2. Fix issue in branch
3. Add tests to prevent recurrence
4. Create new PR
5. Deploy fix

---

## Summary: Deployment Checklist

Before every deployment:

- [ ] All CI checks pass (green)
- [ ] Code reviewed and approved
- [ ] All conversations resolved
- [ ] Documentation updated
- [ ] Database migrations tested
- [ ] Rollback plan documented
- [ ] Monitoring dashboards ready
- [ ] Team notified of deployment
- [ ] Gradual rollout configured
- [ ] Rollback criteria defined

After every deployment:

- [ ] Smoke tests pass
- [ ] Error rates normal
- [ ] Response times normal
- [ ] No user complaints
- [ ] Metrics trending positive
- [ ] Team notified of success
- [ ] Deployment notes documented

---

## Further Reading

- GitHub Actions Documentation: https://docs.github.com/en/actions
- Continuous Delivery: https://continuousdelivery.com/
- Deployment Strategies: https://cloud.google.com/architecture/application-deployment-and-testing-strategies
- Site Reliability Engineering: https://sre.google/books/
