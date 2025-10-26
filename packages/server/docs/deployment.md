# Deployment

## Production Build

```bash
cargo build --release
```

Binary: `target/release/alle-server`

## Running in Production

```bash
export ALLE_SERVER_ENV=production
export ALLE_SERVER_DATABASE_URL=postgres://user:pass@host:5432/alle
export ALLE_SERVER_PORT=8000
./target/release/alle-server
```

## Docker

Build:
```bash
docker build -t alle-server .
```

Run:
```bash
docker run -p 8000:8000 --env-file .env alle-server
```

## Docker Compose

```bash
docker-compose up -d
```

Uses SQLite by default. For PostgreSQL, uncomment the postgres service in `docker-compose.yml` and update `ALLE_SERVER_DATABASE_URL`.

## Environment

Production checklist:
- Set `ALLE_SERVER_ENV=production`
- Use PostgreSQL instead of SQLite
- Set secure `ALLE_SERVER_JWT_SECRET`
- Configure `ALLE_SERVER_CORS_ORIGINS`
- Use HTTPS reverse proxy
- Enable connection pooling
- Set up monitoring
- Regular `cargo audit` runs
