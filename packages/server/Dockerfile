FROM rust:latest AS builder

# Build the release binary
WORKDIR /usr/src/alle-server
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim

# Create a non-root user
RUN useradd -m --uid 1000 alle

WORKDIR /usr/local/bin

# Copy the built binary from the builder stage
COPY --from=builder /usr/src/alle-server/target/release/alle-server /usr/local/bin/alle-server

RUN chown alle:alle alle-server && chmod +x alle-server

USER alle

ENTRYPOINT ["/usr/local/bin/alle-server"]