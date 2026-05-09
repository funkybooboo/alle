# ADR-006: Observability Stack (Loki + Prometheus + Grafana)

**Status**: Accepted  
**Date**: 2026-05-09  
**Context**: v2.x — Multi-user SaaS and beyond (documented direction for Phase 2)

## Context

ADR-004 defines structured JSON logging. ADR-005 defines Prometheus-compatible metrics. This ADR defines the external observability stack that collects, stores, and visualizes those signals.

**Phase 1 (v0.7.0–v1.0)**: Alle produces structured logs and metrics. Self-hosted users can optionally point Prometheus at `/api/metrics` and view JSON logs via `docker logs`. No external collection is required.

**Phase 2 (v2.x+)**: Multi-user SaaS requires centralized log aggregation, metric dashboards, alerting, and eventually distributed tracing. This ADR documents the recommended stack and deployment pattern.

### Considered Options

**Log Aggregation**

| Tool | Pros | Cons |
|------|------|------|
| **Loki** | Lightweight, label-based indexing, native Grafana integration, ~90% less memory than Elasticsearch | No full-text indexing (by design), query power lower than Elasticsearch |
| Elasticsearch/Graylog | Full-text search, powerful queries | Heavy (2-4GB+ RAM minimum), overkill for task app volume |
| Fluent Bit | Log router only, no storage | Needs a backend (would use Loki anyway) |

**Metrics**

| Tool | Pros | Cons |
|------|------|------|
| **Prometheus** | Industry standard, native `/api/metrics` scraping, huge ecosystem | Pull model only, single-node without federation |
| Victoria Metrics | Prometheus-compatible, better performance at scale | Less community adoption, premature optimization for our scale |
| Datadog/New Relic | Feature-complete | Closed source, expensive |

**Dashboards**

| Tool | Pros | Cons |
|------|------|------|
| **Grafana** | Universal, supports Loki + Prometheus + Tempo, best OSS visualization | Requires setup (mitigated by shipped compose config) |
| Netdata | Zero-config, real-time | Not a full dashboard solution, no log aggregation |

**Tracing**

| Tool | Pros | Cons |
|------|------|------|
| **Tempo** | Native Grafana integration, scales well, cheap storage | Requires OTEL SDK instrumentation |
| Jaeger | Most popular OSS tracer, mature | Standalone, doesn't integrate with Grafana as naturally as Tempo |
| Zipkin | Simple, lightweight | Less community momentum than Jaeger/Tempo |

**Uptime Monitoring**

| Tool | Pros | Cons |
|------|------|------|
| **Uptime Kuma** | Self-hosted, beautiful UI, one binary, push/pull checks | Single-instance, no clustering |
| Zabbix | Full monitoring suite | Extremely heavy, overkill for uptime checks |
| Healthchecks.io | Simple, hosted | Not self-hosted |

## Decision

**Recommended observability stack: Loki + Prometheus + Grafana + Tempo + Uptime Kuma.**

Shipped as an optional `docker-compose.monitoring.yml` that self-hosted users can opt into with one command.

### Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │              Self-Hosted User                 │
                    │                                              │
                    │  ┌─────────┐   ┌────────┐   ┌──────────┐   │
                    │  │  Alle   │   │ Uptime  │   │ Grafana  │   │
                    │  │ Server  │◄──┤  Kuma   │   │ Dashboard│   │
                    │  │ :4000   │   │ :3001   │   │  :3000   │   │
                    │  └────┬────┘   └────────┘   └────┬─────┘   │
                    │       │                           │         │
                    │       │  /api/metrics              │         │
                    │       │  /api/health                │         │
                    │       │                           │         │
                    │  ┌────▼────┐   ┌──────────┐   ┌────┴─────┐   │
                    │  │  Alle   │   │ Promtail │   │Prometheus│   │
                    │  │  Logs   │──►│  (log    │   │  :9090   │   │
                    │  │ (json)  │   │ router)  │   └────┬────┘   │
                    │  └─────────┘   └────┬─────┘        │         │
                    │                     │              │         │
                    │                ┌────▼─────┐        │         │
                    │                │   Loki    │◄───────┘         │
                    │                │  :3100    │   (metric        │
                    │                └───────────┘    labels match  │
                    │                                         │     │
                    │                ┌───────────┐         │     │
                    │                │  Tempo     │◄───────┘     │
                    │                │  :3200     │   (OTEL traces│
                    │                └───────────┘    v2.x+)     │
                    └──────────────────────────────────────────────┘
```

**Data flow**:
1. **Alle server** → emits structured JSON logs to stdout (Docker captures)
2. **Promtail** → reads Docker logs, pushes to **Loki**
3. **Prometheus** → scrapes `/api/metrics` from **Alle server**
4. **Grafana** → queries Loki (logs), Prometheus (metrics), Tempo (traces)
5. **Uptime Kuma** → pings `/api/health`, alerts on downtime

### Component Details

#### Loki (Log Aggregation)

- **Why**: Label-based indexing means ~90% less memory than Elasticsearch. Pair `{app="alle"}` labels with structured JSON from ADR-004. Native Grafana data source.
- **Config**: Promtail reads Docker container logs, parses JSON, extracts `level`, `requestId`, `method`, `path` as Loki labels. `message` and `context` stored as log line.
- **Retention**: 30 days default, configurable.

#### Prometheus (Metrics)

- **Why**: Industry standard. Alle already exposes `/api/metrics` (ADR-005). Prometheus scrapes it.
- **Config**: 15-second scrape interval. 30-day retention.
- **Alerting rules** (shipped in `deploy/prometheus/alerts/`):
  - `alle_error_rate > 5%` — 5xx responses exceed 5% over 5 minutes
  - `alle_job_failure_rate > 10%` — background job failures exceed 10%
  - `alle_db_size_bytes > 1GB` — database size exceeds threshold
  - `alle_http_request_duration_seconds{quantile="0.95"} > 2` — p95 latency above 2 seconds

#### Grafana (Dashboards)

- **Why**: Single UI for logs (Loki), metrics (Prometheus), and traces (Tempo). Best OSS visualization tool.
- **Shipped dashboards** (in `deploy/grafana/dashboards/`):
  - **Alle Overview**: Request rate, error rate, p50/p95/p99 latency, active connections, uptime
  - **Alle Jobs**: Job queue depth, job duration, failure rate by type, dead letter count
  - **Alle Database**: Query duration, database size, active connections
  - **Alle Tasks**: Total tasks, tasks by date, completion rate
- **Provisioned datasources**: Loki, Prometheus, Tempo auto-configured via `deploy/grafana/provisioning/`

#### Tempo (Distributed Tracing — v2.x+)

- **Why**: Native Grafana integration. Works with OTEL SDK. Scales cheaply (object storage backend).
- **Deferred**: Added in v2.x when OTEL SDK is instrumented. Phase 1 uses request IDs for correlation.
- **Config**: OTEL SDK in Alle → OTEL Collector → Tempo. Grafana queries Tempo for traces, correlates with Loki logs via `requestId` label.

#### Uptime Kuma (Uptime Monitoring)

- **Why**: One-binary, self-hosted, beautiful status page. Pings `/api/health` every 60 seconds. Push notifications to email, Slack, Discord, webhook.
- **Alerting**: Down for 2 minutes → alert. Recovery → alert.

### Docker Compose Configuration

**`docker-compose.monitoring.yml`** — opt-in monitoring stack:

```yaml
# Run alongside main docker-compose.yml:
#   docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./deploy/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./deploy/prometheus/alerts:/etc/prometheus/alerts
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=30d'

  loki:
    image: grafana/loki:latest
    volumes:
      - ./deploy/loki/loki.yml:/etc/loki/local-config.yaml
      - loki-data:/loki
    ports:
      - "3100:3100"

  promtail:
    image: grafana/promtail:latest
    volumes:
      - ./deploy/promtail/promtail.yml:/etc/promtail/config.yml
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    depends_on:
      - loki

  grafana:
    image: grafana/grafana:latest
    volumes:
      - ./deploy/grafana/provisioning:/etc/grafana/provisioning
      - ./deploy/grafana/dashboards:/var/lib/grafana/dashboards
      - grafana-data:/var/lib/grafana
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
      - loki
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

  uptime-kuma:
    image: louislam/uptime-kuma:latest
    volumes:
      - uptime-kuma-data:/app/data
    ports:
      - "3001:3001"

volumes:
  prometheus-data:
  loki-data:
  grafana-data:
  uptime-kuma-data:
```

Users run:
```bash
# Alle only (default)
docker compose up -d

# Alle + monitoring
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

### Phase Gating

| Feature | Phase | When |
|---------|-------|------|
| Structured JSON logging | Phase 1 | v0.7.0 (with ADR-004) |
| Request ID middleware | Phase 1 | v0.7.0 |
| `/api/metrics` endpoint | Phase 1 | v0.8.0 (with background jobs) |
| Enhanced `/api/health` | Phase 1 | v0.7.0 |
| Prometheus scraping | Phase 1 | v0.8.0 (documented, not shipped) |
| `docker-compose.monitoring.yml` | Phase 1 | v1.0.0 (shipped with Docker setup) |
| Loki + Promtail | Phase 2 | v2.3.0 (when multi-user starts) |
| Grafana dashboards | Phase 2 | v2.3.0 |
| Uptime Kuma | Phase 2 | v2.3.0 |
| Tempo + OTEL traces | Phase 2 | v2.4.0 (security hardening phase) |
| Alerting rules | Phase 2 | v2.4.0 |

Phase 1 produces the signals (structured logs, Prometheus metrics, rich health). Phase 2 adds the collection and visualization layer.

### Log Correlation

The key to making this stack work is **label consistency across logs and metrics**:

- **Request ID** (`requestId`): Links all logs from one HTTP request. Present in both Loki (log label) and metrics (exemplars in v2.x).
- **Job ID** (`jobId`): Links all logs from one background job execution.
- **App label** (`app="alle"`): Shared Loki label and Prometheus job name for cross-system queries.

Example Grafana query — "show me all logs for a slow request":
1. Find slow request in Prometheus: `alle_http_request_duration_seconds{quantile="0.95"} > 2`
2. Get the `requestId` from the metric exemplar (v2.x) or from the timestamp range
3. Query Loki: `{app="alle"} |="request_id=req_456"`

### Why Not Alternatives

**Elasticsearch/Graylog**: 2-4GB minimum RAM. Overkill for a task app's ~10KB/min log volume. Loki runs in <100MB. The lack of full-text search is an acceptable tradeoff — we have structured labels for filtering.

**Zabbix**: Full monitoring suite but heavy, complex, and not container-native. Wrong abstraction level for our needs.

**Netdata**: Great for real-time host metrics, but not a log aggregation or dashboard solution. Doesn't replace Grafana.

**Datadog/New Relic/etc.**: Closed source, expensive, and violates Alle's privacy principle (no telemetry sent to third parties). All monitoring stays self-hosted.

## Consequences

### Positive
- Self-hosted users get full observability with one command
- Grafana provides a single pane of glass for logs, metrics, and traces
- Prometheus scraping is industry-standard — no custom collection agents needed
- Log-to-metric correlation via shared labels and request IDs
- Monitoring stack is completely optional — Alle works without it
- Open-source end-to-end — no vendor lock-in, no license restrictions

### Negative
- Monitoring stack adds 4-5 containers (Prometheus, Loki, Promtail, Grafana, Uptime Kuma)
- Requires ~1-2GB RAM total for the monitoring stack
- Loki's label-based indexing means no full-text search (mitigated by structured logging)
- Phase 1 has no built-in dashboard — metrics are available but require manual Grafana setup
- Tempo adds complexity (OTEL SDK instrumentation) — deferred to Phase 2

### Mitigations
- `docker-compose.monitoring.yml` makes setup a single command
- Shipped Grafana dashboards and Provisioning configs eliminate manual dashboard creation
- Structured JSON logs with label extraction means Loki queries are powerful enough for 95% of debugging
- Phase 1 users can use `docker logs` + `jq` for local log inspection without Grafana
- All components are independently optional — users can run just Prometheus, just Loki, or neither