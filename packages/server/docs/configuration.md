# Configuration

The server uses environment variables for configuration, loaded from a `.env` file.

## Setup

1. Copy the example configuration:
```bash
cp .env.example .env
```

2. Edit `.env` with your values

## Environment Variables

### Database

- `ALLE_SERVER_DATABASE_URL` - Database connection string
  - SQLite: `sqlite:./alle.db?mode=rwc`
  - PostgreSQL: `postgres://user:password@localhost:5432/alle`
  - MySQL: `mysql://user:password@localhost:3306/alle`

### Server

- `ALLE_SERVER_HOST` - Server host (default: `0.0.0.0`)
- `ALLE_SERVER_PORT` - Server port (default: `8000`)
- `ALLE_SERVER_ENV` - Environment (`development` or `production`)
- `ALLE_SERVER_LOG_LEVEL` - Log level (default: `info`)

### CORS

- `ALLE_SERVER_CORS_ORIGINS` - Comma-separated allowed origins
  - Example: `http://localhost:3000,http://localhost:5173`

### Security

- `ALLE_SERVER_JWT_SECRET` - JWT signing secret (change in production)
- `ALLE_SERVER_JWT_EXPIRATION` - JWT expiration in seconds (default: `86400`)

## Configuration Classes

The configuration is structured into modules:

### AppConfig

Main configuration class that loads all settings:

```rust
use alle_server::infrastructure::AppConfig;

let config = AppConfig::load()?;
println!("Database: {}", config.database.url());
println!("Server: {}", config.server.address());
```

### DatabaseConfig

Database connection settings:

```rust
let db_url = config.database.url();
```

### ServerConfig

Server and environment settings:

```rust
let address = config.server.address();
let is_prod = config.server.is_production();
```

### CorsConfig

CORS origin configuration:

```rust
let is_allowed = config.cors.is_allowed("http://localhost:3000");
```

### SecurityConfig

Security and authentication settings:

```rust
let secret = &config.security.jwt_secret;
let expiration = config.security.jwt_expiration;
```

## Usage in Code

Configuration is loaded once at startup:

```rust
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = AppConfig::load()?;

    // Use config throughout the application
    let db = establish_connection(config.database.url()).await?;

    Ok(())
}
```

## Testing

Each configuration module includes unit tests with default values, so tests run without a `.env` file.
