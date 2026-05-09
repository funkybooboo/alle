# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the Alle project.

## What is an ADR?

An ADR captures an important architectural decision: what was decided, why, and what the consequences are. ADRs are immutable once accepted — if a decision changes, write a new ADR that supersedes the old one.

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](ADR-001-sqlite-raw-sql-persistence.md) | SQLite with Raw SQL for Persistence | Accepted | 2026-05-09 |
| [ADR-002](ADR-002-sqlite-backed-job-queue.md) | SQLite-Backed Job Queue for Background Processing | Accepted | 2026-05-09 |
| [ADR-003](ADR-003-raw-sql-migrations.md) | Raw SQL Migration Files | Accepted | 2026-05-09 |
| [ADR-004](ADR-004-structured-json-logging.md) | Structured JSON Logging & Request Tracing | Accepted | 2026-05-09 |
| [ADR-005](ADR-005-prometheus-metrics.md) | Prometheus-Compatible Metrics Endpoint | Accepted | 2026-05-09 |
| [ADR-006](ADR-006-observability-stack.md) | Observability Stack (Loki + Prometheus + Grafana) | Accepted | 2026-05-09 |

## Creating a New ADR

1. Copy the template: `ADR-NNN-brief-title.md`
2. Fill in: Context, Decision, Rationale, Consequences
3. Add to the index above
4. Submit with your PR for review