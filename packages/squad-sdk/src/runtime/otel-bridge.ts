/**
 * OTel Bridge for TelemetryCollector (Issue #256)
 *
 * Converts TelemetryEvents into OpenTelemetry spans, providing a
 * TelemetryTransport that can be registered via setTelemetryTransport().
 * Additive — the existing transport pipeline is unaffected.
 *
 * @module runtime/otel-bridge
 */

import { SpanStatusCode } from '@opentelemetry/api';
import { getTracer } from './otel.js';
import type { TelemetryEvent, TelemetryTransport } from './telemetry.js';

// ============================================================================
// Span mapping
// ============================================================================

function recordSpan(event: TelemetryEvent): void {
  const tracer = getTracer('squad-sdk');
  const attrs: Record<string, string | number | boolean> = {};

  if (event.properties) {
    for (const [k, v] of Object.entries(event.properties)) {
      attrs[k] = v;
    }
  }
  if (event.timestamp) {
    attrs['event.timestamp'] = event.timestamp;
  }

  switch (event.name) {
    case 'squad.init': {
      const span = tracer.startSpan('squad.init', { attributes: attrs });
      span.end();
      break;
    }

    case 'squad.agent.spawn': {
      const span = tracer.startSpan('squad.agent.spawn', { attributes: attrs });
      span.end();
      break;
    }

    case 'squad.error': {
      const span = tracer.startSpan('squad.error', { attributes: attrs });
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(attrs['error'] ?? 'unknown') });
      span.addEvent('exception', {
        'exception.message': String(attrs['error'] ?? attrs['message'] ?? 'unknown error'),
        ...(attrs['stack'] ? { 'exception.stacktrace': String(attrs['stack']) } : {}),
      });
      span.end();
      break;
    }

    case 'squad.run': {
      // Root span for the entire session — start and immediately end
      // (the real duration would be managed by the caller if needed)
      const span = tracer.startSpan('squad.run', { attributes: attrs });
      span.end();
      break;
    }

    case 'squad.upgrade': {
      const span = tracer.startSpan('squad.upgrade', { attributes: attrs });
      span.end();
      break;
    }

    default: {
      // Forward unknown events as generic spans
      const span = tracer.startSpan(event.name, { attributes: attrs });
      span.end();
      break;
    }
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Create a TelemetryTransport that emits OTel spans for each event.
 *
 * Usage:
 * ```ts
 * import { setTelemetryTransport } from './telemetry.js';
 * import { createOTelTransport } from './otel-bridge.js';
 *
 * setTelemetryTransport(createOTelTransport());
 * ```
 *
 * The bridge ignores the `endpoint` parameter — OTel exporter config is
 * managed by the OTel provider initialized via `initializeOTel()`.
 */
export function createOTelTransport(): TelemetryTransport {
  return async (events: TelemetryEvent[], _endpoint: string): Promise<void> => {
    for (const event of events) {
      recordSpan(event);
    }
  };
}
