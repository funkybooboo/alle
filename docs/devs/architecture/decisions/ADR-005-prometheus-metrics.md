# ADR-005: Prometheus-Compatible Metrics Endpoint

**Status**: Accepted  
**Date**: 2026-05-09  
**Context**: v0.7.0/v0.8.0 — Observability infrastructure

## Context

Alle needs metrics for operational visibility: is the server healthy? Are requests slow? Are background jobs failing? Is the database growing? Currently there's a basic `/api/health` endpoint returning `{ status: "ok" }` — no metrics, no duration tracking, no quantitative health signals.

The roadmap calls for SQLite persistence (v0.7.0), background job processing (v0.8.0), and eventually multi-user SaaS (v2.3.0+). All of these need metrics: request latency, job queue depth, database health, and application-level counts.

### Requirements

- Metrics must be scrapeable by any Prometheus-compatible collector
- No external dependencies required for the default setup — metrics are built into the server
- Must work for single-user self-hosted (simple) and multi-user SaaS (scaled)
- Metrics collection must have negligible performance impact (in-memory counters/histograms)
- `MetricsAdapter` interface follows the existing adapter pattern

### Considered Options

| Option | Pros | Cons |
|--------|------|------|
| **Prometheus exposition format** | Industry standard, any collector can scrape, pull model works great for self-hosted | Must implement format rendering; pull model means no push gateway |
| **StatsD push model** | Push model, works behind firewalls | Requires a StatsD collector daemon; different format than Prometheus |
| **OpenTelemetry metrics SDK** | Standards-based, vendor-neutral | Heavy SDK, overkill for Phase 1, Bun support immature |
| **Custom JSON metrics endpoint** | Full flexibility | No tooling ecosystem, custom dashboards required |

## Decision

**Implement a `MetricsAdapter` interface with a `PrometheusMetricsAdapter` that exposes `/api/metrics` in Prometheus text exposition format.** Pull model only — Prometheus (or any compatible collector) scrapes at its interval.

### MetricsAdapter Interface

```typescript
// packages/shared/src/adapters/metrics/MetricsAdapter.ts

export interface MetricsAdapter {
    // Counters
    incrementCounter(name: string, labels: Record<string, string>, value?: number): void;
    
    // Gauges
    setGauge(name: string, labels: Record<string, string>, value: number): void;
    incrementGauge(name: string, labels: Record<string, string>, value?: number): void;
    decrementGauge(name: string, labels: Record<string, string>, value?: number): void;
    
    // Histograms
    observeHistogram(name: string, labels: Record<string, string>, value: number): void;
    
    // Rendering
    render(): string;
}
```

Implementations:
- `PrometheusMetricsAdapter` — production, in-memory collection, renders Prometheus text format
- `NullMetricsAdapter` — testing/development, all methods are no-ops

### Metric Naming Convention

All metrics use the `alle_` prefix and follow [Prometheus naming conventions](https://prometheus.io/docs/practices/naming/):

- snake_case
- `_total` suffix for counters
- `_seconds` suffix for time histograms (with `alle_` prefix: `alle_http_request_duration_seconds`)
- Units in the name, not in label values
- `alle_` namespace prefix to avoid collisions

### Metrics Catalog

#### HTTP Request Metrics

| Name | Type | Labels | Description |
|------|------|--------|-------------|
| `alle_http_requests_total` | counter | `method`, `path`, `status_code` | Total HTTP requests processed |
| `alle_http_request_duration_seconds` | histogram | `method`, `path` | Request duration in seconds |
| `alle_http_requests_active` | gauge | `method` | Currently in-flight requests |

**Histogram buckets** (seconds): 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10

#### Background Job Metrics

| Name | Type | Labels | Description |
|------|------|--------|-------------|
| `alle_jobs_total` | counter | `type`, `status` | Total jobs processed (status: completed, failed, dead) |
| `alle_job_duration_seconds` | histogram | `type` | Job execution duration |
| `alle_jobs_pending` | gauge | `type` | Currently pending jobs |
| `alle_jobs_running` | gauge | (none) | Currently running jobs |

**Histogram buckets** (seconds): 0.1, 0.5, 1, 5, 10, 30, 60, 300

#### Database Metrics

| Name | Type | Labels | Description |
|------|------|--------|-------------|
| `alle_db_query_duration_seconds` | histogram | `operation`, `table` | Database query duration |
| `alle_db_size_bytes` | gauge | (none) | SQLite database file size |
| `alle_db_connections_active` | gauge | (none) | Active database connections (always 1 for SQLite, useful for PG later) |

**Histogram buckets** (seconds): 0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5

#### Application Metrics

| Name | Type | Labels | Description |
|------|------|--------|-------------|
| `alle_tasks_total` | gauge | (none) | Total tasks in database |
| `alle_ws_connections_active` | gauge | (none) | Active WebSocket connections |
| `alle_uptime_seconds` | gauge | (none) | Server uptime in seconds |
| `alle_build_info` | gauge | `version` | Build version (constant 1, label carries version) |

### Endpoint Implementation

**`GET /api/metrics`** — Prometheus text exposition format:

```
# HELP alle_http_requests_total Total HTTP requests processed
# TYPE alle_http_requests_total counter
alle_http_requests_total{method="GET",path="/api/tasks",status_code="200"} 142

# HELP alle_http_request_duration_seconds Request duration in seconds
# TYPE alle_http_request_duration_seconds histogram
alle_http_request_duration_seconds_bucket{method="GET",path="/api/tasks",le="0.005"} 89
alle_http_request_duration_seconds_bucket{method="GET",path="/api/tasks",le="0.01"} 120
alle_http_request_duration_seconds_sum{method="GET",path="/api/tasks"} 2.456
alle_http_request_duration_seconds_count{method="GET",path="/api/tasks"} 142

# HELP alle_uptime_seconds Server uptime in seconds
# TYPE alle_uptime_seconds gauge
alle_uptime_seconds 86400

# HELP alle_build_info Build version
# TYPE alle_build_info gauge
alle_build_info{version="0.7.0"} 1
```

**Path normalization**: Dynamic path segments (like `/api/tasks/:id`) are normalized to their route pattern so `/api/tasks/abc123` and `/api/tasks/def456` both become `alle_http_requests_total{path="/api/tasks/:id"}`. This prevents label explosion.

### Enhanced Health Endpoint

**`GET /api/health`** is upgraded from `{ status: "ok" }` to a richer response:

```json
{
  "status": "ok",
  "version": "0.7.0",
  "uptime": 86400,
  "database": {
    "type": "sqlite",
    "path": "./data/alle.db",
    "sizeBytes": 1048576
  },
  "connections": {
    "websocket": 2
  },
  "jobs": {
    "pending": 3,
    "running": 1
  }
}
```

The health endpoint does NOT include Prometheus metrics — those are on a separate endpoint. Health is for uptime monitors (simple status check), metrics are for observability (detailed quantitative data).

### Integration Points

Metrics are collected at these points in the request lifecycle:

```
Request arrives
  → Metrics middleware: increment alle_http_requests_active, start timer
  → Guard checks (rate limiting, etc.)
  → Route handler processes request
  → Metrics middleware: observe histogram duration, increment counter, decrement active
  → Response sent
```

**Container wiring**:

```typescript
// container.ts
get metricsAdapter(): MetricsAdapter {
    if (!this._metricsAdapter) {
        const enabled = this.config.getBoolean('METRICS_ENABLED', true);
        this._metricsAdapter = enabled 
            ? new PrometheusMetricsAdapter(this.config.get('APP_VERSION', '0.0.0'))
            : new NullMetricsAdapter();
    }
    return this._metricsAdapter;
}
```

### Configuration

| Env Var | Default | Description |
|--------|---------|-------------|
| `METRICS_ENABLED` | `true` | Enable/disable metrics collection entirely |
| `METRICS_PATH` | `/api/metrics` | URL path for metrics endpoint |

### Performance Considerations

- **Counters and gauges** are in-memory maps — O(1) updates, negligible overhead
- **Histograms** use pre-defined bucket arrays — O(k) per observation where k is the number of buckets (~10). For ~100 RPS, this is <1μs per request
- **Rendering** (`/api/metrics`) iterates all metric entries — suitable for 15-second scrape intervals
- **No lock contention** — single-process, synchronous Bun runtime. No mutexes needed.
- **Null adapter** — zero overhead in environments that disable metrics

### Prometheus Scrape Config

Self-hosted users add this to their `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'alle'
    static_configs:
      - targets: ['localhost:4000']
    metrics_path: '/api/metrics'
    scrape_interval: 15s
```

The `docker-compose.monitoring.yml` (shipped with Alle) includes this pre-configured.

### OpenTelemetry Later

When OTEL is added in v2.x:
- An `OtelMetricsAdapter` class implements `MetricsAdapter` using the OTEL Metrics SDK
- It pushes to an OTEL Collector alongside Prometheus scraping
- The `PrometheusMetricsAdapter` remains as the default for self-hosted
- Users choose via `METRICS_ADAPTER=prometheus|otel` env var

No interface changes — just a new implementation class.

## Consequences

### Positive
- Standard Prometheus format — works with any Prometheus-compatible collector (Victoria Metrics, Mimir, Thanos, Cortex)
- No external dependencies — metrics are built into the server
- Adapter pattern — easy to add OTEL, StatsD, or custom implementations later
- Performance impact is negligible — in-memory counters, no disk I/O
- Path normalization prevents label explosion from dynamic URLs
- Rich health endpoint gives uptime monitors useful context without requiring Prometheus

### Negative
- Pull model requires Prometheus to reach Alle — doesn't work behind strict firewalls (acceptable for self-hosted)
- In-memory metrics are lost on server restart — counters reset to zero (mitigated by Prometheus `increase()` function which handles resets)
- No built-in dashboard — requires Grafana or similar for visualization (addressed by shipped dashboard JSON)

### Mitigations
- `docker-compose.monitoring.yml` makes Prometheus + Grafana a one-command setup
- Prometheus `increase()` and `rate()` functions handle counter resets transparently
- Shipped Grafana dashboard JSON provides immediate visualization without manual configuration