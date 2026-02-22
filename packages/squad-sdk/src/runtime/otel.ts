/**
 * OpenTelemetry Provider Initialization (Issue #255)
 *
 * Configures TracerProvider and MeterProvider with OTLP HTTP exporters.
 * Disabled by default — activates only when explicit config or
 * OTEL_EXPORTER_OTLP_ENDPOINT env var is present.
 *
 * @module runtime/otel
 */

import { trace, metrics, type Tracer, type Meter, DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import { NodeSDK, resources, metrics as sdkMetrics } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { createRequire } from 'module';

const { Resource } = resources;
const { PeriodicExportingMetricReader } = sdkMetrics;

// ============================================================================
// Types
// ============================================================================

/** Configuration for OTel initialization. */
export interface OTelConfig {
  /** OTLP endpoint URL (e.g. http://localhost:4318) */
  endpoint?: string;
  /** Service name override (default: 'squad-sdk') */
  serviceName?: string;
  /** Enable debug diagnostics */
  debug?: boolean;
}

// ============================================================================
// Internal state
// ============================================================================

let _sdk: NodeSDK | undefined;
let _tracingActive = false;
let _metricsActive = false;

// ============================================================================
// Helpers
// ============================================================================

function resolveEndpoint(config?: OTelConfig): string | undefined {
  return config?.endpoint ?? process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] ?? undefined;
}

function buildResource(config?: OTelConfig): InstanceType<typeof Resource> {
  const req = createRequire(import.meta.url);
  let version = 'unknown';
  try {
    const pkg = req('../../package.json');
    version = pkg.version;
  } catch {
    // package.json not resolvable — use fallback
  }

  return new Resource({
    'service.name': config?.serviceName ?? 'squad-sdk',
    'squad.version': version,
  });
}

function ensureSDK(config?: OTelConfig): void {
  if (_sdk) return;

  const endpoint = resolveEndpoint(config);
  if (!endpoint) return;

  if (config?.debug) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  }

  const resource = buildResource(config);

  _sdk = new NodeSDK({
    resource,
    traceExporter: new OTLPTraceExporter({ url: `${endpoint}/v1/traces` }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({ url: `${endpoint}/v1/metrics` }),
      exportIntervalMillis: 30_000,
    }),
  });

  _sdk.start();
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Initialize the TracerProvider with an OTLP HTTP exporter.
 * Returns `true` if a provider was registered, `false` if disabled.
 */
export function initializeTracing(config?: OTelConfig): boolean {
  const endpoint = resolveEndpoint(config);
  if (!endpoint) return false;

  ensureSDK(config);
  _tracingActive = true;
  return true;
}

/**
 * Initialize the MeterProvider with an OTLP HTTP exporter.
 * Returns `true` if a provider was registered, `false` if disabled.
 */
export function initializeMetrics(config?: OTelConfig): boolean {
  const endpoint = resolveEndpoint(config);
  if (!endpoint) return false;

  ensureSDK(config);
  _metricsActive = true;
  return true;
}

/**
 * Convenience wrapper — initializes both tracing and metrics.
 * Returns an object indicating which subsystems were activated.
 */
export function initializeOTel(config?: OTelConfig): { tracing: boolean; metrics: boolean } {
  return {
    tracing: initializeTracing(config),
    metrics: initializeMetrics(config),
  };
}

/**
 * Flush pending telemetry and shut down providers.
 * Safe to call even if OTel was never initialized.
 */
export async function shutdownOTel(): Promise<void> {
  if (_sdk) {
    await _sdk.shutdown();
    _sdk = undefined;
  }
  _tracingActive = false;
  _metricsActive = false;
}

/**
 * Return a Tracer instance. Falls back to the no-op tracer when
 * tracing has not been initialized.
 */
export function getTracer(name = 'squad-sdk'): Tracer {
  return trace.getTracer(name);
}

/**
 * Return a Meter instance. Falls back to the no-op meter when
 * metrics have not been initialized.
 */
export function getMeter(name = 'squad-sdk'): Meter {
  return metrics.getMeter(name);
}
