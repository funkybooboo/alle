# Git Workflow

This document defines the Git workflow, branching strategy, commit standards, and best practices for the Alle project. These standards are **MANDATORY** and **ENFORCED** through Git hooks and code reviews.

## Philosophy

Our Git workflow prioritizes:

- **Clean, linear history** — easy to understand project evolution
- **Atomic commits** — each commit represents one logical change
- **Meaningful commit messages** — self-documenting history
- **Fast iteration** — minimal branching overhead
- **Safe collaboration** — protected main branch, required reviews

---

## GitHub Flow (Our Branching Strategy)

We use **GitHub Flow** — a simple, modern branching strategy that emphasizes continuous deployment.

### The Workflow

1. **Main branch is always deployable**
   - `main` branch contains production-ready code
   - Direct commits to `main` are **PROHIBITED**
   - All changes go through pull requests

2. **Create feature branch from `main`**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/user-authentication
   ```

3. **Work with atomic commits**
   - Make small, focused commits
   - Each commit should pass all tests
   - Use meaningful commit messages (see Conventional Commits below)

4. **Open pull request early**
   - Open as draft to share progress
   - Convert to ready when complete
   - Request reviews from team members

5. **Code review and CI validation**
   - All CI checks MUST pass
   - At least one approval REQUIRED
   - Address all review comments

6. **Merge to main**
   - Use squash merge for feature branches
   - Use rebase merge for small changes
   - Delete feature branch after merge

7. **Deploy automatically**
   - Main branch deploys to production automatically
   - Monitor deployment and rollback if needed

---

## Branch Naming Convention

**RULE**: Branch names MUST follow this format:

```
<type>/<description-in-kebab-case>
```

### Branch Types

- `feature/` — New features or enhancements
- `bugfix/` — Bug fixes for existing features
- `hotfix/` — Urgent production fixes
- `refactor/` — Code refactoring without behavior changes
- `docs/` — Documentation changes only
- `test/` — Test additions or modifications
- `infra/` — Infrastructure or deployment changes
- `spike/` — Research or experiments
- `experiment/` — A/B tests or experimental features
- `release/` — Release preparation branches

### Examples

✅ **GOOD**:
```bash
feature/user-authentication
feature/task-filtering-by-date
bugfix/login-redirect-loop
bugfix/memory-leak-in-task-list
hotfix/security-vulnerability-cve-2024-1234
refactor/extract-validation-logic
docs/api-documentation-update
infra/kubernetes-migration
spike/new-architecture-evaluation
experiment/ab-test-checkout-flow
```

❌ **BAD**:
```bash
my-changes
fix-bug
feature_user_auth     (use hyphens, not underscores)
Feature/UserAuth      (use lowercase)
john-dev              (not descriptive)
temp                  (not meaningful)
```

---

## Conventional Commits Standard

**RULE**: All commit messages MUST follow the Conventional Commits specification.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Commit Types

- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `style` — Code style changes (formatting, whitespace)
- `refactor` — Code refactoring without behavior changes
- `perf` — Performance improvements
- `test` — Test additions or modifications
- `build` — Build system or dependencies changes
- `ci` — CI/CD configuration changes
- `chore` — Other changes (maintenance, tooling)
- `revert` — Reverts a previous commit

### Scope (Optional)

The scope specifies which part of the codebase is affected:

- `auth` — Authentication/authorization
- `api` — API endpoints
- `ui` — User interface components
- `db` — Database changes
- `server` — Server-side code
- `client` — Client-side code
- `shared` — Shared code between packages
- `config` — Configuration files

### Examples

✅ **GOOD**:

```
feat(auth): add OAuth2 integration

Implement Google OAuth2 flow with:
- Authorization code exchange
- Token refresh mechanism
- User profile mapping

Resolves: #1234
```

```
fix(api): prevent duplicate task creation

Add unique constraint check before saving tasks to database.
Fixes race condition when user double-clicks submit button.

Closes: #456
```

```
docs: update testing philosophy

Add section on integration testing with Docker containers
and clarify NO MOCKS policy.
```

```
refactor(server): extract error handling to utility

Move error-to-response conversion logic into separate
errorHandler utility for better reusability.
```

```
perf(client): implement virtual scrolling for task list

Reduces DOM nodes for lists with >100 items.
Improves initial render time by 60%.
```

```
test(api): add comprehensive endpoint coverage

Add tests for all error scenarios, validation cases,
and authentication/authorization checks.

Coverage increased from 65% to 92%.
```

❌ **BAD**:

```
update stuff
```

```
fix bug
```

```
WIP
```

```
feat: added some new features and fixed a few bugs
```

```
Fixed the thing that was broken
```

### Breaking Changes

When introducing breaking changes, add `BREAKING CHANGE:` footer or `!` after type:

```
feat(api)!: change task date format to ISO 8601

BREAKING CHANGE: Task dates now use ISO 8601 format (YYYY-MM-DD)
instead of Unix timestamps. Clients must update their date parsing.

Migration guide: docs/migrations/2024-01-task-date-format.md
```

---

## Modern Git Practices

### 1. Interactive Rebase for Clean History

**RULE**: Use interactive rebase to clean up commits before merging.

```bash
# Rebase last 5 commits
git rebase -i HEAD~5

# In the editor, you can:
# - pick (keep commit as-is)
# - reword (change commit message)
# - edit (modify commit content)
# - squash (combine with previous commit)
# - fixup (like squash but discard message)
# - drop (remove commit)
```

**WHEN TO USE**:
- Before opening pull request
- After code review to incorporate feedback
- To combine "fix typo" commits with main feature commits

**NEVER**:
- Rebase commits that have been pushed to shared branches
- Rebase `main` or `develop` branches
- Rebase published release commits

### 2. Patch Mode for Selective Staging

**RULE**: Use `git add -p` to stage specific changes within files.

```bash
# Review each change and decide whether to stage it
git add -p

# Options:
# y - stage this hunk
# n - do not stage this hunk
# s - split into smaller hunks
# e - manually edit the hunk
# q - quit; do not stage this or remaining hunks
# a - stage this and all remaining hunks in the file
```

**BENEFITS**:
- Create atomic commits from working directory with multiple changes
- Review changes before committing
- Separate formatting changes from logic changes

### 3. Meaningful Merge Strategies

**RULE**: Choose merge strategy based on context.

**Squash Merge** (default for feature branches):
```bash
git merge --squash feature/user-auth
```
- Combines all feature commits into one
- Clean linear history
- Use for feature branches with many WIP commits

**Rebase Merge** (for small changes):
```bash
git rebase main
git merge --ff-only feature/small-fix
```
- Preserves individual commits
- Maintains linear history
- Use for small, well-crafted commit series

**Merge Commit** (for preserving branch context):
```bash
git merge --no-ff feature/important-refactor
```
- Creates merge commit
- Preserves branch history
- Use for important architectural changes

### 4. Amend Last Commit

**RULE**: Use `--amend` to fix the most recent commit (before pushing).

```bash
# Modify last commit message
git commit --amend -m "feat(auth): add OAuth2 integration"

# Add forgotten files to last commit
git add forgotten-file.ts
git commit --amend --no-edit
```

**NEVER**:
- Amend commits that have been pushed to shared branches
- Amend commits that others have based work on

### 5. Stash for Context Switching

**RULE**: Use stash to save work-in-progress when switching contexts.

```bash
# Save current changes
git stash push -m "WIP: user authentication form"

# List stashes
git stash list

# Apply most recent stash
git stash pop

# Apply specific stash
git stash apply stash@{1}

# Drop stash
git stash drop stash@{0}
```

---

## Git Hooks for Quality

**RULE**: Use Git hooks to enforce quality standards automatically.

### Pre-Commit Hook

Runs before commit is created. Use for fast checks.

```bash
# .git/hooks/pre-commit
#!/bin/sh

# Run linting
bun run lint:check || {
  echo "❌ Linting failed. Run 'bun run lint' to fix."
  exit 1
}

# Run type checking
bun run type-check || {
  echo "❌ Type checking failed. Fix type errors before committing."
  exit 1
}

# Check for secrets
git diff --cached --name-only | while read file; do
  if grep -qE '(password|secret|api[-_]?key|token).*=.*["\047]' "$file"; then
    echo "❌ Possible secret found in $file"
    exit 1
  fi
done

echo "✅ Pre-commit checks passed"
```

### Pre-Push Hook

Runs before push to remote. Use for longer checks.

```bash
# .git/hooks/pre-push
#!/bin/sh

# Run tests
bun run test || {
  echo "❌ Tests failed. Fix tests before pushing."
  exit 1
}

# Check test coverage
bun run test --coverage || {
  echo "❌ Test coverage below threshold."
  exit 1
}

echo "✅ Pre-push checks passed"
```

### Commit-Msg Hook

Validates commit message format.

```bash
# .git/hooks/commit-msg
#!/bin/sh

commit_msg_file=$1
commit_msg=$(cat "$commit_msg_file")

# Check if message follows Conventional Commits
if ! echo "$commit_msg" | grep -qE '^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,}'; then
  echo "❌ Commit message must follow Conventional Commits format:"
  echo "   type(scope): description"
  echo ""
  echo "   Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert"
  exit 1
fi

echo "✅ Commit message format valid"
```

### Installing Hooks

```bash
# Make hooks executable
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push
chmod +x .git/hooks/commit-msg

# Or use husky for team-wide hooks
bun add -d husky
bunx husky install
bunx husky add .husky/pre-commit "bun run lint:check && bun run type-check"
bunx husky add .husky/pre-push "bun run test"
```

---

## Protected Main Branch

**RULE**: `main` branch MUST be protected with these settings:

### GitHub Branch Protection Rules

Required settings:
- ✅ Require pull request before merging
- ✅ Require approvals (minimum: 1)
- ✅ Dismiss stale pull request approvals
- ✅ Require review from code owners
- ✅ Require status checks to pass
  - ✅ Linting
  - ✅ Type checking
  - ✅ Tests (unit, integration, E2E, API)
  - ✅ Coverage threshold
  - ✅ Build succeeds
- ✅ Require branches to be up to date
- ✅ Require conversation resolution
- ✅ Require signed commits (optional but recommended)
- ✅ Include administrators (no exceptions)
- ✅ Restrict who can push (no direct pushes)
- ✅ Allow force pushes: NO
- ✅ Allow deletions: NO

---

## Pull Request Standards

### PR Title Format

MUST follow Conventional Commits format:

```
feat(auth): add OAuth2 integration
fix(api): prevent duplicate task creation
docs: update testing philosophy
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does and why.

## Type of Change
- [ ] feat: New feature
- [ ] fix: Bug fix
- [ ] docs: Documentation update
- [ ] refactor: Code refactoring
- [ ] test: Test additions/modifications
- [ ] chore: Maintenance or tooling

## Related Issues
Closes #123
Relates to #456

## Changes Made
- Added OAuth2 integration with Google
- Updated user model to include OAuth provider
- Added tests for OAuth flow

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Deployment Notes
Any special deployment considerations or migration steps required.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex logic
- [ ] Updated documentation
- [ ] No new warnings generated
- [ ] Added tests that prove fix/feature works
- [ ] New and existing tests pass locally
- [ ] Dependent changes have been merged
```

---

## Git Troubleshooting

### Undo Last Commit (Before Push)

```bash
# Keep changes in working directory
git reset --soft HEAD~1

# Discard changes
git reset --hard HEAD~1
```

### Recover Deleted Commit

```bash
# Find commit hash
git reflog

# Restore commit
git checkout <commit-hash>
git cherry-pick <commit-hash>
```

### Fix Commit Message (Before Push)

```bash
git commit --amend -m "New commit message"
```

### Remove File from Last Commit (Before Push)

```bash
git reset HEAD~1
git add <files-to-keep>
git commit -c ORIG_HEAD
```

### Find Bug-Introducing Commit

```bash
# Start bisect
git bisect start
git bisect bad                    # Current commit is bad
git bisect good <known-good-hash> # Known good commit

# Git will checkout commits for testing
# Mark each as good or bad
git bisect good   # if bug not present
git bisect bad    # if bug present

# When found, bisect will show the bad commit
git bisect reset  # return to original branch
```

### Cherry-Pick Specific Commits

```bash
# Apply specific commit to current branch
git cherry-pick <commit-hash>

# Cherry-pick without committing (review first)
git cherry-pick -n <commit-hash>
```

---

## Best Practices Summary

✅ **DO**:
- Keep commits small and focused
- Write descriptive commit messages
- Use Conventional Commits format
- Rebase to clean up history before PR
- Request reviews early
- Respond to review feedback promptly
- Keep PRs under 400 lines of code
- Link PRs to issues
- Update tests with code changes
- Update documentation with code changes

❌ **DON'T**:
- Commit directly to main
- Force push to shared branches
- Create commits with "WIP" or "fix typo" messages (squash them)
- Mix multiple unrelated changes in one commit
- Push sensitive data or secrets
- Ignore CI failures
- Merge your own PRs without approval
- Leave unresolved review comments
- Create PRs with failing tests
- Rebase published commits

---

## Workflow Examples

### Feature Development

```bash
# 1. Start from main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/task-filtering

# 3. Make changes and commit
git add .
git commit -m "feat(client): add date range filter for tasks"

# 4. Push to remote
git push -u origin feature/task-filtering

# 5. Open PR on GitHub
# 6. Address review feedback
# 7. Squash and merge when approved
```

### Hotfix

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/security-vulnerability

# 2. Fix and commit
git add .
git commit -m "fix(auth): patch SQL injection vulnerability"

# 3. Push and create PR
git push -u origin hotfix/security-vulnerability

# 4. Fast-track review and merge
# 5. Deploy immediately
```

### Sync Feature Branch with Main

```bash
# On feature branch
git fetch origin
git rebase origin/main

# Resolve any conflicts
git add <resolved-files>
git rebase --continue

# Force push (only to your feature branch)
git push --force-with-lease
```

This Git workflow ensures clean history, clear communication, and safe collaboration across the team.
