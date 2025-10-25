FROM rustlang/rust:nightly-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    curl \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copy dependency files
COPY Cargo.toml Cargo.lock ./

# Copy source
COPY src ./src

# Build release binary
RUN cargo build --release

# Runtime image
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1000 -s /bin/bash alle

# Set working directory
WORKDIR /app

# Copy binary from builder
COPY --from=builder /build/target/release/alle-server /app/alle-server

# Create data directory for SQLite database
RUN mkdir -p /app/data && chown -R alle:alle /app

# Switch to non-root user
USER alle

# Expose port
EXPOSE 8000

# Run server
CMD ["/app/alle-server"]