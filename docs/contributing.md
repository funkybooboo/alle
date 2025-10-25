# Contributing Guide

## Code Comments and Issue Creation

This project uses automated TODO scanning to convert code comments into GitHub issues.

### Supported Keywords

The workflow scans for **TODO** comments in your code and automatically creates GitHub issues.

> **Note**: All TODO comments are tracked as issues with the `todo` label. You'll need to manually add additional labels (like `bug`, `enhancement`, etc.) through GitHub after the issue is created.

While you can use other keywords like FIXME, HACK, XXX, BUG, or NOTE for clarity in your code, they will also be treated as TODOs by the automation system.

### Comment Format

Use this format for comments that should become issues:

```rust
// TODO: Add authentication middleware
// FIXME: Handle edge case when database is unavailable
// HACK: Temporary workaround until upstream library is fixed
// XXX: This needs performance optimization
// BUG: Race condition in concurrent updates
// NOTE: Document the retry logic here
```

**Multi-line TODOs:**

```rust
// TODO: Implement user authentication
//  - Add JWT token validation
//  - Create middleware for protected routes
//  - Add rate limiting
```

### How It Works

1. Push code with TODO comments to `main`, `test`, or `dev` branch
2. GitHub Action scans all files for keywords
3. Creates GitHub issues with:
   - Title from the comment
   - `todo` label applied automatically
   - Link to source code location
   - Context from surrounding code
4. When TODO is removed, the issue is automatically closed

### Best Practices

1. **Be specific** - Write clear, actionable TODO comments
   ```rust
   // Good
   // TODO: Add input validation for email field in user registration

   // Avoid
   // TODO: Fix this
   ```

2. **One task per comment** - Don't combine multiple unrelated tasks
   ```rust
   // Good
   // TODO: Add email validation
   // TODO: Add password strength check

   // Avoid
   // TODO: Add email validation and password strength check and 2FA
   ```

3. **Include context** - Add relevant details
   ```rust
   // TODO: Replace SQLite with PostgreSQL for production deployments
   //  See issue #123 for performance benchmarks
   ```

4. **Use descriptive keywords** for clarity in your code (all are treated as TODOs by the automation)
   - `TODO` - General tasks and improvements
   - `FIXME` - Bugs that need fixing
   - `HACK` - Temporary workarounds
   - `XXX` - Code that needs review

   Remember to add appropriate GitHub labels manually after the issue is created.

5. **Clean up** - Remove TODO comments when done
   - The GitHub issue will automatically close
   - Keeps codebase clean

### Labels

All issues created from TODO comments automatically receive the `todo` label. Additional labels should be added manually through GitHub based on the type of task:

| Suggested Labels | Use Case |
|-----------------|----------|
| `enhancement` | New features (TODO) |
| `bug` | Bugs that need fixing (FIXME, BUG) |
| `tech-debt` | Temporary workarounds (HACK) |
| `needs-review` | Code needing review (XXX) |
| `documentation` | Documentation improvements (NOTE) |

### Disabling Auto-Issue Creation

To write a TODO comment that should NOT create an issue, use lowercase:

```rust
// todo: just a personal reminder, not an issue
```

Or use alternative formats:
```rust
/* todo in a block comment */
```

### Workflow Triggers

The TODO scanner runs on:
- Every push to `main`, `test`, or `dev` branches (creates issues)
- Pull requests to `main`, `test`, or `dev` (scan only, no issue creation)
- Manual trigger via GitHub Actions UI

### Example

**Code:**
```rust
// TODO: Add caching layer for frequently accessed tasks
//  - Use Redis for caching
//  - Implement cache invalidation on updates
//  - Add cache hit metrics
pub async fn find_all(&self) -> Result<Vec<task::Model>, DbErr> {
    task::Entity::find().all(self.db()).await
}
```

**Creates GitHub Issue:**
```
Title: Add caching layer for frequently accessed tasks
Labels: todo

Body:
- Use Redis for caching
- Implement cache invalidation on updates
- Add cache hit metrics

Location: packages/server/src/repositories/task_repository.rs:34

Note: Add the 'enhancement' label manually if desired
```

## Development Workflow

1. Write code with TODO comments for future work
2. Create PR and get review
3. Merge to `dev` - TODOs become issues
4. Work on issues from backlog
5. Remove TODO when implementing - issue auto-closes
6. Clean, tracked codebase!

## Manual Issue Creation

For complex features or discussions, create issues manually through GitHub.
Reserve TODO comments for simple, well-defined tasks.
