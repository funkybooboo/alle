# Configuration

All environment variables are prefixed with `ALLE_SERVER_`.

## Setup

```bash
cp .env.example .env
```

## Variables

**ALLE_SERVER_DATABASE_URL**
- Database connection string
- Default: `sqlite:./alle.db?mode=rwc`
- Examples: `sqlite:./alle.db`, `postgres://user:pass@host/db`

**ALLE_SERVER_HOST**
- Server bind address
- Default: `0.0.0.0`

**ALLE_SERVER_PORT**
- Server port
- Default: `8000`

**ALLE_SERVER_ENV**
- Environment name
- Default: `development`
- Options: `development`, `staging`, `production`

**ALLE_SERVER_LOG_LEVEL**
- Logging level (future use)
- Default: `info`

**ALLE_SERVER_CORS_ORIGINS**
- Allowed origins (comma-separated, future use)
- Default: `http://localhost:3000,http://localhost:5173`

**ALLE_SERVER_JWT_SECRET**
- JWT signing secret (future use)
- Default: `change-this-secret-in-production`

**ALLE_SERVER_JWT_EXPIRATION**
- Token expiration seconds (future use)
- Default: `86400` (24 hours)
