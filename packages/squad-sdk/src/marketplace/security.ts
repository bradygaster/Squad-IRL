/**
 * Security model — remote agent validation for marketplace entries
 * Issue #140 (M5-13)
 */

import type { AgentConfig } from '../config/schema.js';

// --- RemoteAgentDefinition (extends AgentConfig for security context) ---

export interface RemoteAgentDefinition extends AgentConfig {
  charter?: string;
  tools?: string[];
}

// --- SecurityReport ---

export interface SecurityReport {
  passed: boolean;
  warnings: string[];
  blocked: string[];
  riskScore: number;
}

// --- SecurityRule ---

export type SecuritySeverity = 'warning' | 'critical';

export interface SecurityRule {
  name: string;
  severity: SecuritySeverity;
  check: (agent: RemoteAgentDefinition, source: string) => string | null;
}

// --- Prompt injection patterns ---

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /you\s+are\s+now\s+(a\s+)?different/i,
  /system\s*:\s*override/i,
  /\bdo\s+not\s+follow\b.*\brules\b/i,
  /\bdisregard\b.*\binstructions\b/i,
  /\bact\s+as\b.*\badmin\b/i,
];

// --- Suspicious tool patterns ---

const SUSPICIOUS_TOOLS = [
  'shell', 'exec', 'eval', 'sudo', 'rm', 'delete',
  'network_raw', 'http_raw', 'file_write_any',
];

// --- PII patterns ---

const PII_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,     // email
  /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/,                     // SSN-like
  /\b(?:\d{4}[-\s]?){3}\d{4}\b/,                        // credit card-like
  /\bghp_[A-Za-z0-9_]{36,}\b/,                          // GitHub token
  /\bsk-[A-Za-z0-9]{20,}\b/,                            // API key pattern
];

// --- Overly broad permission patterns ---

const BROAD_PERMISSION_PATTERNS = [
  /\ball\s+files\b/i,
  /\bunrestricted\s+access\b/i,
  /\bfull\s+system\b/i,
  /\broot\s+access\b/i,
  /\bno\s+restrictions\b/i,
];

// --- Security Rules ---

export const SECURITY_RULES: SecurityRule[] = [
  {
    name: 'prompt-injection',
    severity: 'critical',
    check: (agent) => {
      const charter = agent.charter ?? '';
      for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(charter)) {
          return `Prompt injection pattern detected: ${pattern.source}`;
        }
      }
      return null;
    },
  },
  {
    name: 'suspicious-tools',
    severity: 'critical',
    check: (agent) => {
      const tools = agent.tools ?? [];
      const found = tools.filter((t) => SUSPICIOUS_TOOLS.includes(t.toLowerCase()));
      if (found.length > 0) {
        return `Suspicious tool requests: ${found.join(', ')}`;
      }
      return null;
    },
  },
  {
    name: 'pii-in-charter',
    severity: 'warning',
    check: (agent) => {
      const charter = agent.charter ?? '';
      for (const pattern of PII_PATTERNS) {
        if (pattern.test(charter)) {
          return `Potential PII detected in charter: ${pattern.source}`;
        }
      }
      return null;
    },
  },
  {
    name: 'overly-broad-permissions',
    severity: 'warning',
    check: (agent) => {
      const charter = agent.charter ?? '';
      for (const pattern of BROAD_PERMISSION_PATTERNS) {
        if (pattern.test(charter)) {
          return `Overly broad permission language: ${pattern.source}`;
        }
      }
      return null;
    },
  },
  {
    name: 'untrusted-source',
    severity: 'warning',
    check: (_agent, source) => {
      if (!source || source === 'unknown' || source === '') {
        return 'Agent source is unknown or unverified';
      }
      return null;
    },
  },
  {
    name: 'missing-charter',
    severity: 'warning',
    check: (agent) => {
      if (!agent.charter || agent.charter.trim().length === 0) {
        return 'Agent has no charter — behavior is unpredictable';
      }
      return null;
    },
  },
  {
    name: 'excessive-tools',
    severity: 'warning',
    check: (agent) => {
      const tools = agent.tools ?? [];
      if (tools.length > 15) {
        return `Agent requests ${tools.length} tools — consider reducing scope`;
      }
      return null;
    },
  },
];

// --- Validate remote agent ---

export function validateRemoteAgent(
  agent: RemoteAgentDefinition,
  source: string,
): SecurityReport {
  const warnings: string[] = [];
  const blocked: string[] = [];
  let riskScore = 0;

  for (const rule of SECURITY_RULES) {
    const result = rule.check(agent, source);
    if (result) {
      if (rule.severity === 'critical') {
        blocked.push(result);
        riskScore += 30;
      } else {
        warnings.push(result);
        riskScore += 10;
      }
    }
  }

  riskScore = Math.min(100, riskScore);

  return {
    passed: blocked.length === 0,
    warnings,
    blocked,
    riskScore,
  };
}

// --- Quarantine agent ---

export function quarantineAgent(agent: RemoteAgentDefinition): RemoteAgentDefinition {
  let charter = agent.charter ?? '';

  // Remove injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    charter = charter.replace(pattern, '[REMOVED]');
  }

  // Remove PII
  for (const pattern of PII_PATTERNS) {
    charter = charter.replace(pattern, '[REDACTED]');
  }

  // Remove broad permission language
  for (const pattern of BROAD_PERMISSION_PATTERNS) {
    charter = charter.replace(pattern, '[RESTRICTED]');
  }

  // Strip suspicious tools
  const safTools = (agent.tools ?? []).filter(
    (t) => !SUSPICIOUS_TOOLS.includes(t.toLowerCase()),
  );

  return {
    ...agent,
    charter,
    tools: safTools,
  };
}

// --- Generate human-readable security report ---

export function generateSecurityReport(report: SecurityReport): string {
  const lines: string[] = [];

  lines.push('# Security Report');
  lines.push('');
  lines.push(`**Status:** ${report.passed ? '✅ PASSED' : '❌ BLOCKED'}`);
  lines.push(`**Risk Score:** ${report.riskScore}/100`);
  lines.push('');

  if (report.blocked.length > 0) {
    lines.push('## Critical Issues');
    lines.push('');
    for (const issue of report.blocked) {
      lines.push(`- 🚫 ${issue}`);
    }
    lines.push('');
  }

  if (report.warnings.length > 0) {
    lines.push('## Warnings');
    lines.push('');
    for (const warning of report.warnings) {
      lines.push(`- ⚠️ ${warning}`);
    }
    lines.push('');
  }

  if (report.blocked.length === 0 && report.warnings.length === 0) {
    lines.push('No issues detected.');
    lines.push('');
  }

  return lines.join('\n');
}
