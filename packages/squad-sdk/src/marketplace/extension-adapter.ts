/**
 * Extension Adapter — bridges Squad SDK to Copilot Extensions API surface
 * Issue #108 (M4-8)
 */

import type { SquadConfig } from '../config/schema.js';
import type { MarketplaceManifest } from './index.js';

// --- Extension event types ---

export type ExtensionEventType =
  | 'user.message'
  | 'tool.invoke'
  | 'session.start'
  | 'session.end';

export interface ExtensionEvent {
  type: ExtensionEventType;
  timestamp: string;
  payload: Record<string, unknown>;
}

// --- Extension config shape ---

export interface ExtensionConfig {
  id: string;
  name: string;
  version: string;
  description: string;
  agents: Array<{ name: string; role: string }>;
  tools: string[];
  models: { default: string; tiers: Record<string, string[]> };
}

// --- Registration result ---

export interface RegistrationResult {
  success: boolean;
  extensionId?: string;
  errors: string[];
}

// --- Conversion functions ---

export function toExtensionConfig(config: SquadConfig): ExtensionConfig {
  const tools = new Set<string>();
  for (const agent of config.agents) {
    if (agent.tools) {
      for (const t of agent.tools) {
        tools.add(t);
      }
    }
  }

  return {
    id: slugify(config.team.name),
    name: config.team.name,
    version: config.version,
    description: config.team.description ?? '',
    agents: config.agents.map((a) => ({ name: a.name, role: a.role })),
    tools: [...tools],
    models: {
      default: config.models.default,
      tiers: config.models.tiers,
    },
  };
}

export function fromExtensionEvent(event: ExtensionEvent): {
  type: string;
  data: Record<string, unknown>;
  receivedAt: string;
} {
  const typeMap: Record<ExtensionEventType, string> = {
    'user.message': 'message',
    'tool.invoke': 'tool_call',
    'session.start': 'session_init',
    'session.end': 'session_close',
  };

  return {
    type: typeMap[event.type] ?? event.type,
    data: event.payload,
    receivedAt: new Date().toISOString(),
  };
}

export function registerExtension(manifest: MarketplaceManifest): RegistrationResult {
  const errors: string[] = [];

  if (!manifest.name) {
    errors.push('manifest name is required for registration');
  }
  if (!manifest.version) {
    errors.push('manifest version is required for registration');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Abstracted registration — in production this would call the marketplace API
  return {
    success: true,
    extensionId: `ext-${manifest.name}-${manifest.version}`,
    errors: [],
  };
}

// --- ExtensionAdapter class ---

export class ExtensionAdapter {
  private config: SquadConfig;

  constructor(config: SquadConfig) {
    this.config = config;
  }

  toExtensionConfig(): ExtensionConfig {
    return toExtensionConfig(this.config);
  }

  fromExtensionEvent(event: ExtensionEvent): {
    type: string;
    data: Record<string, unknown>;
    receivedAt: string;
  } {
    return fromExtensionEvent(event);
  }

  registerExtension(manifest: MarketplaceManifest): RegistrationResult {
    return registerExtension(manifest);
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
