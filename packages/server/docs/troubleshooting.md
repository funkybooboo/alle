# Troubleshooting

## Database Connection

Check connection string:
```bash
echo $ALLE_SERVER_DATABASE_URL
```

Test database:
```bash
sqlite3 alle.db ".tables"  # SQLite
psql $ALLE_SERVER_DATABASE_URL -c "\dt"  # PostgreSQL
```

## Port Already in Use

Change port:
```bash
ALLE_SERVER_PORT=8001 cargo run
```

Or update `.env`:
```bash
ALLE_SERVER_PORT=8001
```

## Migration Failures

Check migration files in `src/migration/` for syntax errors.

View schema:
```bash
sqlite3 alle.db ".schema"
```

## Build Errors

Clean and rebuild:
```bash
cargo clean
cargo build
```

Update dependencies:
```bash
cargo update
```

## Test Failures

Run specific test:
```bash
cargo test test_name -- --nocapture
```

Docker integration tests:
```bash
docker-compose -f docker-compose.test.yml ps  # Check health
docker-compose -f docker-compose.test.yml logs  # View logs
```

## Performance Issues

For production, use PostgreSQL instead of SQLite:
```bash
ALLE_SERVER_DATABASE_URL=postgres://user:pass@host:5432/alle
```
