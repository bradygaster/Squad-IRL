// ─── Compliance Checker — Multi-Agent Security Audit ────────────────────────
// Simulates 5 agents collaborating to audit a codebase across OWASP, GDPR,
// SOC2 frameworks with dependency scanning and a final compliance scorecard.
// No external dependencies — pure TypeScript.

// ─── ANSI Helpers ───────────────────────────────────────────────────────────

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const ITALIC = "\x1b[3m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const MAGENTA = "\x1b[35m";
const CYAN = "\x1b[36m";
const WHITE = "\x1b[37m";
const BG_RED = "\x1b[41m";
const BG_GREEN = "\x1b[42m";
const BG_YELLOW = "\x1b[43m";
const BG_BLUE = "\x1b[44m";
const BG_MAGENTA = "\x1b[45m";
const BG_CYAN = "\x1b[46m";

function clr(text: string, ...codes: string[]): string {
  return `${codes.join("")}${text}${RESET}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface CodeSnippet {
  file: string;
  language: string;
  code: string;
  line: number;
}

interface ConfigEntry {
  file: string;
  setting: string;
  value: string;
  category: string;
}

interface DependencyEntry {
  name: string;
  version: string;
  latestVersion: string;
  vulnerabilities: VulnInfo[];
}

interface VulnInfo {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  cvss: number;
  description: string;
  fixedIn: string;
}

interface Finding {
  source: string;
  category: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  cvss: number;
  file?: string;
  line?: number;
  detail: string;
  fix: string;
  frameworks: { owasp: boolean; gdpr: boolean; soc2: boolean };
}

// ─── CVSS Scoring ───────────────────────────────────────────────────────────

type AV = "network" | "adjacent" | "local" | "physical";
type AC = "low" | "high";
type Impact = "high" | "low" | "none";

function calculateCVSS(attackVector: AV, complexity: AC, impact: Impact): number {
  const avScores: Record<AV, number> = { network: 0.85, adjacent: 0.62, local: 0.55, physical: 0.20 };
  const acScores: Record<AC, number> = { low: 0.77, high: 0.44 };
  const impactScores: Record<Impact, number> = { high: 0.56, low: 0.22, none: 0.0 };

  const iss = 1 - ((1 - impactScores[impact]) * (1 - impactScores[impact]) * (1 - impactScores[impact]));
  const impactSub = 6.42 * iss;
  const exploitability = 8.22 * avScores[attackVector] * acScores[complexity];
  if (impactSub <= 0) return 0.0;
  const raw = Math.min(impactSub + exploitability, 10);
  return Math.round(raw * 10) / 10;
}

function severityFromCVSS(cvss: number): "critical" | "high" | "medium" | "low" {
  if (cvss >= 9.0) return "critical";
  if (cvss >= 7.0) return "high";
  if (cvss >= 4.0) return "medium";
  return "low";
}

function severityColor(s: "critical" | "high" | "medium" | "low"): string {
  switch (s) {
    case "critical": return RED;
    case "high": return YELLOW;
    case "medium": return MAGENTA;
    case "low": return CYAN;
  }
}

function severityIcon(s: "critical" | "high" | "medium" | "low"): string {
  switch (s) {
    case "critical": return "🔴";
    case "high": return "🟠";
    case "medium": return "🟡";
    case "low": return "🔵";
  }
}

// ─── Simulated Codebase Data ────────────────────────────────────────────────

const codeSnippets: CodeSnippet[] = [
  { file: "src/services/user-service.ts", language: "TypeScript", line: 42,
    code: `db.query("SELECT * FROM users WHERE id = " + userId)` },
  { file: "src/auth/password.ts", language: "TypeScript", line: 18,
    code: `const hash = crypto.createHash('sha1').update(password).digest('hex')` },
  { file: "src/auth/jwt.ts", language: "TypeScript", line: 55,
    code: `const token = jwt.sign(payload, secret) // no expiresIn` },
  { file: "src/views/profile.ejs", language: "EJS", line: 31,
    code: `<div>Welcome, <%- user.displayName %></div>` },
  { file: "src/routes/api.ts", language: "TypeScript", line: 67,
    code: `app.post("/api/transfer", async (req, res) => { /* no rate limit */ })` },
  { file: "config/production.json", language: "JSON", line: 3,
    code: `"apiKey": "sk-live-4f3c8a9b2d1e7f6054321abcdef09876"` },
  { file: "src/middleware/session.ts", language: "TypeScript", line: 22,
    code: `res.cookie("session_id", sid, { httpOnly: false, secure: false })` },
  { file: "src/routes/form.ts", language: "TypeScript", line: 38,
    code: `app.post("/submit", (req, res) => { /* no CSRF token check */ })` },
  { file: "src/routes/upload.ts", language: "TypeScript", line: 14,
    code: `multer({ dest: "uploads/" }) // no file type validation` },
  { file: "src/utils/logger.ts", language: "TypeScript", line: 9,
    code: `console.log("User login:", { email, password, ip, sessionToken })` },
];

const configEntries: ConfigEntry[] = [
  { file: "config/cors.json", setting: "Access-Control-Allow-Origin", value: "*", category: "Network" },
  { file: "config/session.json", setting: "session.maxAge", value: "86400000 (24h)", category: "Session" },
  { file: "config/auth.json", setting: "password.minLength", value: "6", category: "Authentication" },
  { file: "config/crypto.json", setting: "encryption.algorithm", value: "AES-128-CBC", category: "Encryption" },
  { file: "config/logging.json", setting: "log.level", value: "debug", category: "Logging" },
  { file: "config/tls.json", setting: "tls.minVersion", value: "TLSv1.1", category: "Network" },
  { file: "config/security.json", setting: "Content-Security-Policy", value: "none", category: "Headers" },
  { file: "config/security.json", setting: "X-Frame-Options", value: "(not set)", category: "Headers" },
  { file: "config/database.json", setting: "db.ssl", value: "false", category: "Database" },
  { file: "config/backup.json", setting: "backup.encryption", value: "disabled", category: "Backup" },
  { file: "config/retention.json", setting: "data.retentionPolicy", value: "(not defined)", category: "Data" },
  { file: "config/logging.json", setting: "audit.enabled", value: "false", category: "Logging" },
];

const dependencies: DependencyEntry[] = [
  { name: "express", version: "4.17.1", latestVersion: "4.21.2", vulnerabilities: [
    { id: "CVE-2024-29041", severity: "high", cvss: 7.5, description: "Open redirect vulnerability in Express", fixedIn: "4.19.2" },
  ]},
  { name: "lodash", version: "4.17.20", latestVersion: "4.17.21", vulnerabilities: [
    { id: "CVE-2021-23337", severity: "critical", cvss: 9.8, description: "Prototype pollution via template function", fixedIn: "4.17.21" },
  ]},
  { name: "jsonwebtoken", version: "8.5.1", latestVersion: "9.0.2", vulnerabilities: [
    { id: "CVE-2022-23529", severity: "high", cvss: 7.6, description: "Insecure key retrieval allowing JWT forgery", fixedIn: "9.0.0" },
  ]},
  { name: "axios", version: "0.21.1", latestVersion: "1.7.9", vulnerabilities: [
    { id: "CVE-2023-45857", severity: "high", cvss: 7.1, description: "SSRF via crafted URL bypass", fixedIn: "1.6.0" },
    { id: "CVE-2024-39338", severity: "medium", cvss: 5.3, description: "Server-side request forgery in proxy", fixedIn: "1.7.4" },
  ]},
  { name: "moment", version: "2.29.1", latestVersion: "2.30.1", vulnerabilities: [
    { id: "CVE-2022-24785", severity: "medium", cvss: 5.3, description: "ReDoS via crafted date string", fixedIn: "2.29.4" },
  ]},
  { name: "node-forge", version: "0.10.0", latestVersion: "1.3.1", vulnerabilities: [
    { id: "CVE-2022-24771", severity: "critical", cvss: 9.1, description: "Signature verification bypass via RSA PKCS#1 v1.5", fixedIn: "1.3.0" },
    { id: "CVE-2022-24772", severity: "high", cvss: 7.5, description: "Improper verification of RSA-PSS signatures", fixedIn: "1.3.0" },
  ]},
  { name: "minimist", version: "1.2.5", latestVersion: "1.2.8", vulnerabilities: [
    { id: "CVE-2021-44906", severity: "critical", cvss: 9.8, description: "Prototype pollution via constructor.prototype", fixedIn: "1.2.6" },
  ]},
  { name: "helmet", version: "4.6.0", latestVersion: "8.0.0", vulnerabilities: [] },
  { name: "bcrypt", version: "5.1.0", latestVersion: "5.1.1", vulnerabilities: [] },
  { name: "pg", version: "8.7.1", latestVersion: "8.13.1", vulnerabilities: [] },
  { name: "multer", version: "1.4.3", latestVersion: "1.4.5-lts.1", vulnerabilities: [
    { id: "CVE-2022-24434", severity: "high", cvss: 7.5, description: "Denial of service via malicious upload boundary", fixedIn: "1.4.4-lts.1" },
  ]},
  { name: "cors", version: "2.8.5", latestVersion: "2.8.5", vulnerabilities: [] },
];

// ─── Shared findings store ──────────────────────────────────────────────────

const allFindings: Finding[] = [];

// ─── Display Helpers ────────────────────────────────────────────────────────

function banner(icon: string, title: string, subtitle: string): string {
  const w = 68;
  const top = `╔${"═".repeat(w)}╗`;
  const bot = `╚${"═".repeat(w)}╝`;
  const pad = (s: string, len: number) => {
    const visible = s.replace(/\x1b\[[0-9;]*m/g, "");
    return s + " ".repeat(Math.max(0, len - visible.length));
  };
  const line1 = `║ ${pad(`${icon}  ${clr(title, BOLD, WHITE)}`, w + (title.length > 0 ? 14 : 0))}║`;
  const line2 = `║ ${pad(clr(subtitle, DIM), w + 8)}║`;
  const empty = `║${" ".repeat(w)}║`;
  return `\n${top}\n${line1}\n${line2}\n${empty}\n${bot}`;
}

function sectionHeader(text: string): string {
  return `\n  ${clr("┌─", DIM)} ${clr(text, BOLD, CYAN)}\n  ${clr("│", DIM)}`;
}

function progressBar(pct: number, width: number = 30): string {
  const filled = Math.round(width * (pct / 100));
  const empty = width - filled;
  let color = GREEN;
  if (pct < 50) color = RED;
  else if (pct < 75) color = YELLOW;
  return `${clr("█".repeat(filled), color)}${clr("░".repeat(empty), DIM)} ${pct}%`;
}

function pad(s: string, len: number): string {
  const visible = s.replace(/\x1b\[[0-9;]*m/g, "");
  return s + " ".repeat(Math.max(0, len - visible.length));
}

// ─── Agent 1: OWASP Scanner ────────────────────────────────────────────────

const owaspCategories = [
  "A01: Broken Access Control",
  "A02: Cryptographic Failures",
  "A03: Injection",
  "A04: Insecure Design",
  "A05: Security Misconfiguration",
  "A06: Vulnerable Components",
  "A07: Authentication Failures",
  "A08: Software/Data Integrity",
  "A09: Security Logging Failures",
  "A10: Server-Side Request Forgery",
];

interface OwaspFinding {
  category: string;
  title: string;
  file: string;
  line: number;
  code: string;
  cvss: number;
  severity: "critical" | "high" | "medium" | "low";
  fix: string;
}

const owaspFindings: OwaspFinding[] = [
  { category: "A03: Injection", title: "SQL Injection", file: "src/services/user-service.ts", line: 42,
    code: `db.query("SELECT * FROM users WHERE id = " + userId)`,
    cvss: calculateCVSS("network", "low", "high"), severity: "critical",
    fix: `Use parameterized queries: db.query("SELECT * FROM users WHERE id = $1", [userId])` },
  { category: "A02: Cryptographic Failures", title: "Weak Password Hashing (SHA1)", file: "src/auth/password.ts", line: 18,
    code: `crypto.createHash('sha1').update(password).digest('hex')`,
    cvss: calculateCVSS("network", "low", "high"), severity: "high",
    fix: "Use bcrypt or argon2 for password hashing" },
  { category: "A07: Authentication Failures", title: "JWT Without Expiration", file: "src/auth/jwt.ts", line: 55,
    code: `jwt.sign(payload, secret) // no expiresIn`,
    cvss: calculateCVSS("network", "low", "high"), severity: "high",
    fix: "Add expiresIn option: jwt.sign(payload, secret, { expiresIn: '1h' })" },
  { category: "A03: Injection", title: "Cross-Site Scripting (XSS)", file: "src/views/profile.ejs", line: 31,
    code: `<div>Welcome, <%- user.displayName %></div>`,
    cvss: calculateCVSS("network", "low", "low"), severity: "medium",
    fix: "Use escaped output: <%= user.displayName %> instead of <%- %>" },
  { category: "A05: Security Misconfiguration", title: "Missing Rate Limiting", file: "src/routes/api.ts", line: 67,
    code: `app.post("/api/transfer", async (req, res) => { ... })`,
    cvss: calculateCVSS("network", "low", "low"), severity: "medium",
    fix: "Add express-rate-limit middleware to sensitive endpoints" },
  { category: "A02: Cryptographic Failures", title: "Hardcoded API Key", file: "config/production.json", line: 3,
    code: `"apiKey": "sk-live-4f3c8a9b2d1e7f6054321..."`,
    cvss: calculateCVSS("network", "low", "high"), severity: "critical",
    fix: "Use environment variables or a secrets manager (e.g., AWS Secrets Manager)" },
  { category: "A05: Security Misconfiguration", title: "Insecure Cookie Flags", file: "src/middleware/session.ts", line: 22,
    code: `res.cookie("session_id", sid, { httpOnly: false, secure: false })`,
    cvss: calculateCVSS("network", "high", "high"), severity: "high",
    fix: "Set httpOnly: true, secure: true, sameSite: 'strict'" },
  { category: "A01: Broken Access Control", title: "Missing CSRF Protection", file: "src/routes/form.ts", line: 38,
    code: `app.post("/submit", (req, res) => { /* no CSRF token */ })`,
    cvss: calculateCVSS("network", "high", "high"), severity: "high",
    fix: "Implement CSRF tokens using csurf middleware" },
  { category: "A04: Insecure Design", title: "Unrestricted File Upload", file: "src/routes/upload.ts", line: 14,
    code: `multer({ dest: "uploads/" }) // no file type validation`,
    cvss: calculateCVSS("network", "low", "high"), severity: "high",
    fix: "Add fileFilter with allowed MIME types and file extension validation" },
  { category: "A09: Security Logging Failures", title: "Sensitive Data in Logs", file: "src/utils/logger.ts", line: 9,
    code: `console.log("User login:", { email, password, ip, sessionToken })`,
    cvss: calculateCVSS("local", "low", "high"), severity: "high",
    fix: "Redact sensitive fields: mask password, truncate session tokens" },
  { category: "A10: Server-Side Request Forgery", title: "SSRF via Axios", file: "src/services/proxy-service.ts", line: 28,
    code: `axios.get(userProvidedUrl)`,
    cvss: calculateCVSS("network", "low", "high"), severity: "high",
    fix: "Validate and whitelist target URLs; block internal network ranges" },
  { category: "A05: Security Misconfiguration", title: "Wildcard CORS Origin", file: "config/cors.json", line: 1,
    code: `"Access-Control-Allow-Origin": "*"`,
    cvss: calculateCVSS("network", "low", "low"), severity: "medium",
    fix: "Restrict to specific trusted origins" },
];

async function runOwaspScanner(): Promise<void> {
  console.log(banner("🛡️", "OWASP Scanner", "Scanning codebase against OWASP Top 10 (2021)"));
  await sleep(300);

  console.log(sectionHeader("Scanning source files for vulnerabilities..."));
  for (const snippet of codeSnippets) {
    console.log(`  ${clr("│", DIM)} ${clr("⟳", CYAN)} Scanning ${clr(snippet.file, BOLD)}:${snippet.line}`);
    await sleep(150);
  }

  console.log(sectionHeader("OWASP Top 10 Findings"));
  const categoriesHit = new Set<string>();
  for (const f of owaspFindings) {
    categoriesHit.add(f.category);
    const icon = f.severity === "critical" ? "❌" : f.severity === "high" ? "⚠️" : "⚡";
    const sevStr = clr(f.severity.toUpperCase(), BOLD, severityColor(f.severity));
    console.log(`  ${clr("│", DIM)}`);
    console.log(`  ${clr("│", DIM)} ${icon} ${clr(f.category, BOLD, WHITE)} — ${f.title} in ${clr(f.file, CYAN)}:${f.line}`);
    console.log(`  ${clr("│", DIM)}    Code: ${clr("`" + f.code + "`", DIM)}`);
    console.log(`  ${clr("│", DIM)}    Risk: ${sevStr} (CVSS ${f.cvss})`);
    console.log(`  ${clr("│", DIM)}    Fix:  ${clr(f.fix, GREEN)}`);
    await sleep(200);

    allFindings.push({
      source: "OWASP", category: f.category, title: f.title,
      severity: f.severity, cvss: f.cvss, file: f.file, line: f.line,
      detail: f.code, fix: f.fix,
      frameworks: { owasp: true, gdpr: false, soc2: false },
    });
  }

  console.log(sectionHeader("OWASP Coverage Summary"));
  console.log(`  ${clr("│", DIM)} Categories checked : ${clr(`${owaspCategories.length}/10`, BOLD, WHITE)}`);
  console.log(`  ${clr("│", DIM)} Categories with findings: ${clr(String(categoriesHit.size), BOLD, RED)}`);
  console.log(`  ${clr("│", DIM)} Total findings     : ${clr(String(owaspFindings.length), BOLD, RED)}`);
  const crit = owaspFindings.filter(f => f.severity === "critical").length;
  const high = owaspFindings.filter(f => f.severity === "high").length;
  const med = owaspFindings.filter(f => f.severity === "medium").length;
  console.log(`  ${clr("│", DIM)} 🔴 Critical: ${crit}  🟠 High: ${high}  🟡 Medium: ${med}`);
  console.log(`  ${clr("└─", DIM)}`);
}

// ─── Agent 2: GDPR Checker ─────────────────────────────────────────────────

interface GdprCheck {
  requirement: string;
  status: "compliant" | "partial" | "non-compliant";
  details: string;
  article: string;
}

const gdprChecks: GdprCheck[] = [
  { requirement: "Consent Mechanism", status: "non-compliant",
    details: "No explicit consent collection before data processing", article: "Art. 6/7" },
  { requirement: "Right to Deletion", status: "partial",
    details: "User delete endpoint exists but does not purge backups or logs", article: "Art. 17" },
  { requirement: "Data Minimization", status: "non-compliant",
    details: "Logger captures passwords and session tokens unnecessarily", article: "Art. 5(1)(c)" },
  { requirement: "Data Processing Agreement", status: "non-compliant",
    details: "No DPA on file for third-party analytics provider", article: "Art. 28" },
  { requirement: "Breach Notification Procedure", status: "partial",
    details: "Incident response plan exists but no 72-hour notification workflow", article: "Art. 33" },
  { requirement: "Cross-Border Transfers", status: "non-compliant",
    details: "Data stored in US region without Standard Contractual Clauses", article: "Art. 46" },
  { requirement: "Privacy Policy", status: "partial",
    details: "Privacy policy present but last updated 18 months ago", article: "Art. 13/14" },
  { requirement: "Cookie Consent", status: "non-compliant",
    details: "No cookie consent banner; cookies set without Secure/HttpOnly flags", article: "ePrivacy" },
  { requirement: "Data Retention Policy", status: "non-compliant",
    details: "No defined retention period — data.retentionPolicy not set", article: "Art. 5(1)(e)" },
  { requirement: "Data Protection Officer", status: "partial",
    details: "DPO designated but contact info not published on website", article: "Art. 37-39" },
];

async function runGdprChecker(): Promise<void> {
  console.log(banner("🇪🇺", "GDPR Compliance Checker", "Evaluating data handling practices under EU GDPR"));
  await sleep(300);

  console.log(sectionHeader("Analyzing data handling practices..."));
  for (const entry of configEntries.filter(e => ["Data", "Logging", "Session"].includes(e.category))) {
    console.log(`  ${clr("│", DIM)} ${clr("⟳", CYAN)} Checking ${clr(entry.setting, BOLD)} = ${entry.value}`);
    await sleep(120);
  }

  console.log(sectionHeader("GDPR Compliance Assessment"));
  const colW = [30, 16, 10, 48];
  const hdr = `  ${clr("│", DIM)} ${clr(pad("Requirement", colW[0]), BOLD)}${clr(pad("Status", colW[1]), BOLD)}${clr(pad("Article", colW[2]), BOLD)}${clr("Details", BOLD)}`;
  console.log(hdr);
  console.log(`  ${clr("│", DIM)} ${"─".repeat(colW[0])}${"─".repeat(colW[1])}${"─".repeat(colW[2])}${"─".repeat(colW[3])}`);

  for (const chk of gdprChecks) {
    let icon: string, color: string;
    if (chk.status === "compliant") { icon = "✅"; color = GREEN; }
    else if (chk.status === "partial") { icon = "⚠️"; color = YELLOW; }
    else { icon = "❌"; color = RED; }
    const statusStr = clr(pad(chk.status.toUpperCase(), colW[1] - 3), BOLD, color);
    console.log(`  ${clr("│", DIM)} ${pad(chk.requirement, colW[0])}${icon} ${statusStr}${pad(chk.article, colW[2])}${clr(chk.details, DIM)}`);
    await sleep(180);

    const sev: "critical" | "high" | "medium" | "low" =
      chk.status === "non-compliant" ? "high" : chk.status === "partial" ? "medium" : "low";
    allFindings.push({
      source: "GDPR", category: chk.article, title: chk.requirement,
      severity: sev, cvss: sev === "high" ? 7.0 : sev === "medium" ? 4.5 : 2.0,
      detail: chk.details, fix: `Address ${chk.requirement} per ${chk.article}`,
      frameworks: { owasp: false, gdpr: true, soc2: false },
    });
  }

  const compliant = gdprChecks.filter(c => c.status === "compliant").length;
  const partial = gdprChecks.filter(c => c.status === "partial").length;
  const nonCompliant = gdprChecks.filter(c => c.status === "non-compliant").length;
  const score = Math.round(((compliant * 1.0 + partial * 0.5) / gdprChecks.length) * 100);

  console.log(sectionHeader("GDPR Readiness Score"));
  console.log(`  ${clr("│", DIM)} ${progressBar(score)}`);
  console.log(`  ${clr("│", DIM)} ✅ Compliant: ${compliant}  ⚠️ Partial: ${partial}  ❌ Non-Compliant: ${nonCompliant}`);
  console.log(`  ${clr("└─", DIM)}`);
}

// ─── Agent 3: SOC2 Auditor ─────────────────────────────────────────────────

interface Soc2Check {
  criterion: string;
  title: string;
  status: "pass" | "partial" | "fail";
  evidence: string;
  detail: string;
}

const soc2Checks: Soc2Check[] = [
  { criterion: "CC6.1", title: "Logical Access Controls", status: "fail",
    evidence: "config/cors.json, src/routes/form.ts",
    detail: "Wildcard CORS and missing CSRF allow unauthorized access" },
  { criterion: "CC6.2", title: "Authentication Mechanisms", status: "fail",
    evidence: "src/auth/password.ts, config/auth.json",
    detail: "SHA1 hashing + 6-char min password violates secure auth standards" },
  { criterion: "CC6.3", title: "Encryption at Rest", status: "partial",
    evidence: "config/crypto.json, config/backup.json",
    detail: "AES-128 used instead of AES-256; backup encryption disabled" },
  { criterion: "CC6.4", title: "Encryption in Transit", status: "fail",
    evidence: "config/tls.json, config/database.json",
    detail: "TLS 1.1 (deprecated) and unencrypted database connections" },
  { criterion: "CC6.6", title: "Intrusion Detection", status: "fail",
    evidence: "(no configuration found)",
    detail: "No IDS/IPS solution configured; no WAF rules defined" },
  { criterion: "CC7.1", title: "Monitoring and Logging", status: "fail",
    evidence: "config/logging.json",
    detail: "Audit logging disabled; debug-level logging exposes sensitive data" },
  { criterion: "CC7.2", title: "Incident Response", status: "partial",
    evidence: "docs/incident-response.md",
    detail: "IR plan exists but untested; no 72-hour breach notification SLA" },
  { criterion: "CC8.1", title: "Change Management", status: "partial",
    evidence: ".github/workflows/ci.yml",
    detail: "CI pipeline present but no required code review or approval gates" },
  { criterion: "A1.2", title: "Backup Procedures", status: "fail",
    evidence: "config/backup.json",
    detail: "Backups unencrypted; no tested recovery procedure documented" },
];

async function runSoc2Auditor(): Promise<void> {
  console.log(banner("🔐", "SOC2 Auditor", "Evaluating Trust Service Criteria (TSC) compliance"));
  await sleep(300);

  console.log(sectionHeader("Auditing Trust Service Criteria..."));
  for (const entry of configEntries) {
    console.log(`  ${clr("│", DIM)} ${clr("⟳", CYAN)} Evaluating ${clr(entry.category, BOLD)} — ${entry.setting}`);
    await sleep(100);
  }

  console.log(sectionHeader("SOC2 Trust Service Criteria Results"));
  for (const chk of soc2Checks) {
    let icon: string, color: string;
    if (chk.status === "pass") { icon = "✅"; color = GREEN; }
    else if (chk.status === "partial") { icon = "⚠️"; color = YELLOW; }
    else { icon = "❌"; color = RED; }

    console.log(`  ${clr("│", DIM)}`);
    console.log(`  ${clr("│", DIM)} ${icon} ${clr(chk.criterion, BOLD, WHITE)} — ${chk.title}: ${clr(chk.status.toUpperCase(), BOLD, color)}`);
    console.log(`  ${clr("│", DIM)}    Evidence: ${clr(chk.evidence, DIM)}`);
    console.log(`  ${clr("│", DIM)}    Detail:   ${chk.detail}`);
    await sleep(200);

    const sev: "critical" | "high" | "medium" | "low" =
      chk.status === "fail" ? "high" : chk.status === "partial" ? "medium" : "low";
    allFindings.push({
      source: "SOC2", category: chk.criterion, title: chk.title,
      severity: sev, cvss: sev === "high" ? 7.5 : sev === "medium" ? 5.0 : 2.0,
      detail: chk.detail, fix: `Remediate ${chk.criterion}: ${chk.title}`,
      frameworks: { owasp: false, gdpr: false, soc2: true },
    });
  }

  const pass = soc2Checks.filter(c => c.status === "pass").length;
  const partial = soc2Checks.filter(c => c.status === "partial").length;
  const fail = soc2Checks.filter(c => c.status === "fail").length;
  const score = Math.round(((pass * 1.0 + partial * 0.5) / soc2Checks.length) * 100);

  console.log(sectionHeader("SOC2 Readiness Score"));
  console.log(`  ${clr("│", DIM)} ${progressBar(score)}`);
  console.log(`  ${clr("│", DIM)} ✅ Pass: ${pass}  ⚠️ Partial: ${partial}  ❌ Fail: ${fail}`);
  console.log(`  ${clr("└─", DIM)}`);
}

// ─── Agent 4: Dependency Auditor ────────────────────────────────────────────

async function runDependencyAuditor(): Promise<void> {
  console.log(banner("📦", "Dependency Auditor", "Scanning dependency tree for known vulnerabilities"));
  await sleep(300);

  console.log(sectionHeader("Reading package.json and resolving dependency tree..."));
  await sleep(400);

  const totalVulns = dependencies.reduce((n, d) => n + d.vulnerabilities.length, 0);
  console.log(`  ${clr("│", DIM)} Found ${clr(String(dependencies.length), BOLD)} packages, ${clr(String(totalVulns), BOLD, RED)} known vulnerabilities\n`);

  console.log(`  ${clr("│", DIM)} ${clr("📦 Dependencies", BOLD, WHITE)} (${dependencies.length} packages)`);

  for (let i = 0; i < dependencies.length; i++) {
    const dep = dependencies[i];
    const isLast = i === dependencies.length - 1;
    const prefix = isLast ? "└──" : "├──";
    const childPrefix = isLast ? "    " : "│   ";
    const hasVulns = dep.vulnerabilities.length > 0;

    let statusIcon: string;
    if (!hasVulns) {
      statusIcon = clr("✅ OK", GREEN);
    } else {
      const maxSev = dep.vulnerabilities.reduce((worst, v) => {
        const order = { critical: 4, high: 3, medium: 2, low: 1 };
        return order[v.severity] > order[worst] ? v.severity : worst;
      }, "low" as VulnInfo["severity"]);
      statusIcon = `${severityIcon(maxSev)} ${clr(maxSev.toUpperCase(), BOLD, severityColor(maxSev))}`;
    }

    const outdated = dep.version !== dep.latestVersion;
    const verStr = outdated
      ? `${clr(dep.version, DIM)} → ${clr(dep.latestVersion, GREEN)}`
      : clr(dep.version, GREEN);

    console.log(`  ${clr("│", DIM)} ${prefix} ${clr(dep.name, BOLD)}@${verStr} ${statusIcon}`);

    for (let j = 0; j < dep.vulnerabilities.length; j++) {
      const v = dep.vulnerabilities[j];
      const vIsLast = j === dep.vulnerabilities.length - 1;
      const vPrefix = vIsLast ? "└── " : "├── ";
      console.log(`  ${clr("│", DIM)} ${childPrefix}${vPrefix}${clr(v.id, BOLD, severityColor(v.severity))} (CVSS ${v.cvss}) — ${v.description}`);
      console.log(`  ${clr("│", DIM)} ${childPrefix}${vIsLast ? "    " : "│   "}Fixed in: ${clr(v.fixedIn, GREEN)}`);

      allFindings.push({
        source: "Dependency", category: "CVE", title: `${v.id} in ${dep.name}`,
        severity: v.severity, cvss: v.cvss, file: "package.json",
        detail: v.description, fix: `Upgrade ${dep.name} to ${v.fixedIn}`,
        frameworks: { owasp: true, gdpr: false, soc2: true },
      });
    }
    await sleep(150);
  }

  const critCount = dependencies.flatMap(d => d.vulnerabilities).filter(v => v.severity === "critical").length;
  const highCount = dependencies.flatMap(d => d.vulnerabilities).filter(v => v.severity === "high").length;
  const medCount = dependencies.flatMap(d => d.vulnerabilities).filter(v => v.severity === "medium").length;
  const healthScore = Math.max(0, Math.round(100 - (critCount * 20 + highCount * 10 + medCount * 5)));

  console.log(sectionHeader("Dependency Health Summary"));
  console.log(`  ${clr("│", DIM)} ${progressBar(healthScore)}`);
  console.log(`  ${clr("│", DIM)} 🔴 Critical: ${critCount}  🟠 High: ${highCount}  🟡 Medium: ${medCount}`);
  console.log(`  ${clr("│", DIM)}`);
  console.log(`  ${clr("│", DIM)} ${clr("Upgrade Recommendations (by priority):", BOLD)}`);

  const upgradeList = dependencies
    .filter(d => d.vulnerabilities.length > 0)
    .sort((a, b) => {
      const maxA = Math.max(...a.vulnerabilities.map(v => v.cvss));
      const maxB = Math.max(...b.vulnerabilities.map(v => v.cvss));
      return maxB - maxA;
    });

  for (let i = 0; i < upgradeList.length; i++) {
    const d = upgradeList[i];
    const maxCvss = Math.max(...d.vulnerabilities.map(v => v.cvss));
    console.log(`  ${clr("│", DIM)}   ${i + 1}. ${clr(d.name, BOLD)} ${d.version} → ${clr(d.latestVersion, GREEN)}  (max CVSS ${clr(String(maxCvss), severityColor(severityFromCVSS(maxCvss)))})`);
  }
  console.log(`  ${clr("└─", DIM)}`);
}

// ─── Agent 5: Report Generator ─────────────────────────────────────────────

interface MatrixRow {
  control: string;
  owasp: "pass" | "warn" | "fail" | "n/a";
  gdpr: "pass" | "warn" | "fail" | "n/a";
  soc2: "pass" | "warn" | "fail" | "n/a";
  status: "CRITICAL" | "WARNING" | "OK";
}

function buildMatrix(): MatrixRow[] {
  const controls: { name: string; owaspCats: string[]; gdprReqs: string[]; soc2Criteria: string[] }[] = [
    { name: "Access Control", owaspCats: ["A01: Broken Access Control"], gdprReqs: ["Consent Mechanism"], soc2Criteria: ["CC6.1"] },
    { name: "Encryption", owaspCats: ["A02: Cryptographic Failures"], gdprReqs: ["Cross-Border Transfers"], soc2Criteria: ["CC6.3", "CC6.4"] },
    { name: "Injection Prevention", owaspCats: ["A03: Injection"], gdprReqs: [], soc2Criteria: [] },
    { name: "Authentication", owaspCats: ["A07: Authentication Failures"], gdprReqs: [], soc2Criteria: ["CC6.2"] },
    { name: "Logging & Monitoring", owaspCats: ["A09: Security Logging Failures"], gdprReqs: ["Breach Notification Procedure"], soc2Criteria: ["CC7.1"] },
    { name: "Dependency Security", owaspCats: ["A06: Vulnerable Components"], gdprReqs: [], soc2Criteria: [] },
    { name: "Data Protection", owaspCats: [], gdprReqs: ["Data Minimization", "Data Retention Policy"], soc2Criteria: ["A1.2"] },
    { name: "Incident Response", owaspCats: [], gdprReqs: ["Breach Notification Procedure"], soc2Criteria: ["CC7.2"] },
    { name: "Configuration Mgmt", owaspCats: ["A05: Security Misconfiguration"], gdprReqs: [], soc2Criteria: ["CC8.1"] },
    { name: "SSRF Protection", owaspCats: ["A10: Server-Side Request Forgery"], gdprReqs: [], soc2Criteria: ["CC6.6"] },
  ];

  function frameworkStatus(findings: Finding[], cats: string[], srcField: string): "pass" | "warn" | "fail" | "n/a" {
    if (cats.length === 0) return "n/a";
    const matched = findings.filter(f => f.source === srcField && cats.some(c => f.category === c || f.title === c));
    if (matched.length === 0) return "pass";
    if (matched.some(f => f.severity === "critical" || f.severity === "high")) return "fail";
    return "warn";
  }

  return controls.map(c => {
    const owasp = frameworkStatus(allFindings, c.owaspCats, "OWASP");
    const gdpr = frameworkStatus(allFindings, c.gdprReqs, "GDPR");
    const soc2 = frameworkStatus(allFindings, c.soc2Criteria, "SOC2");
    const statuses = [owasp, gdpr, soc2].filter(s => s !== "n/a");
    let status: "CRITICAL" | "WARNING" | "OK" = "OK";
    if (statuses.includes("fail")) status = "CRITICAL";
    else if (statuses.includes("warn")) status = "WARNING";
    return { control: c.name, owasp, gdpr, soc2, status };
  });
}

function statusCell(s: "pass" | "warn" | "fail" | "n/a"): string {
  switch (s) {
    case "pass": return clr(" ✅ ", GREEN);
    case "warn": return clr(" ⚠️ ", YELLOW);
    case "fail": return clr(" ❌ ", RED);
    case "n/a": return clr(" ── ", DIM);
  }
}

interface RemediationItem {
  issue: string;
  risk: "CRIT" | "HIGH" | "MED" | "LOW";
  effort: "Low" | "Med" | "High";
  score: number;
}

function buildRemediations(): RemediationItem[] {
  const effortMap: Record<string, "Low" | "Med" | "High"> = {
    "SQL Injection": "Low",
    "Prototype pollution via template function": "Low",
    "Prototype pollution via constructor.prototype": "Low",
    "Weak Password Hashing (SHA1)": "Med",
    "Hardcoded API Key": "Low",
    "JWT Without Expiration": "Low",
    "Insecure Cookie Flags": "Low",
    "Missing CSRF Protection": "Med",
    "Unrestricted File Upload": "Med",
    "Sensitive Data in Logs": "Low",
    "Cross-Site Scripting (XSS)": "Low",
    "Missing Rate Limiting": "Med",
    "SSRF via Axios": "Med",
    "Wildcard CORS Origin": "Low",
  };
  const effortScore: Record<string, number> = { "Low": 3, "Med": 2, "High": 1 };
  const riskScore: Record<string, number> = { "CRIT": 15, "HIGH": 8, "MED": 3, "LOW": 1 };

  const seen = new Set<string>();
  const items: RemediationItem[] = [];

  for (const f of allFindings) {
    if (seen.has(f.title)) continue;
    seen.add(f.title);
    const risk = f.severity === "critical" ? "CRIT" : f.severity === "high" ? "HIGH" : f.severity === "medium" ? "MED" : "LOW";
    const effort = effortMap[f.title] ?? effortMap[f.detail] ?? "Med";
    const score = riskScore[risk] * effortScore[effort];
    items.push({ issue: f.title.length > 38 ? f.title.slice(0, 35) + "..." : f.title, risk, effort, score });
  }

  items.sort((a, b) => b.score - a.score);
  return items.slice(0, 15);
}

function calculateGrade(): { score: number; grade: string; color: string } {
  let score = 100;
  for (const f of allFindings) {
    if (f.severity === "critical") score -= 15;
    else if (f.severity === "high") score -= 8;
    else if (f.severity === "medium") score -= 3;
  }
  score = Math.max(0, score);
  let grade: string, color: string;
  if (score >= 90) { grade = "A"; color = GREEN; }
  else if (score >= 80) { grade = "B"; color = GREEN; }
  else if (score >= 70) { grade = "C"; color = YELLOW; }
  else if (score >= 60) { grade = "D"; color = YELLOW; }
  else { grade = "F"; color = RED; }
  return { score, grade, color };
}

async function runReportGenerator(): Promise<void> {
  console.log(banner("📊", "Report Generator", "Synthesizing cross-framework compliance scorecard"));
  await sleep(300);

  console.log(sectionHeader("Aggregating findings from all agents..."));
  const sources = ["OWASP", "GDPR", "SOC2", "Dependency"];
  for (const src of sources) {
    const count = allFindings.filter(f => f.source === src).length;
    console.log(`  ${clr("│", DIM)} ${clr("⟳", CYAN)} ${src}: ${clr(String(count), BOLD)} findings collected`);
    await sleep(200);
  }
  console.log(`  ${clr("│", DIM)} Total: ${clr(String(allFindings.length), BOLD, RED)} findings across all frameworks`);

  // Compliance Matrix
  console.log(sectionHeader("Cross-Framework Compliance Matrix"));
  await sleep(200);

  const matrix = buildMatrix();
  const cW = [22, 7, 6, 6, 10];
  console.log(`  ${clr("│", DIM)} ╔${"═".repeat(cW[0])}╦${"═".repeat(cW[1])}╦${"═".repeat(cW[2])}╦${"═".repeat(cW[3])}╦${"═".repeat(cW[4])}╗`);
  console.log(`  ${clr("│", DIM)} ║${clr(pad(" Control", cW[0]), BOLD)}║${clr(pad(" OWASP", cW[1]), BOLD)}║${clr(pad(" GDPR", cW[2]), BOLD)}║${clr(pad(" SOC2", cW[3]), BOLD)}║${clr(pad(" Status", cW[4]), BOLD)}║`);
  console.log(`  ${clr("│", DIM)} ╠${"═".repeat(cW[0])}╬${"═".repeat(cW[1])}╬${"═".repeat(cW[2])}╬${"═".repeat(cW[3])}╬${"═".repeat(cW[4])}╣`);

  for (const row of matrix) {
    const statusColor = row.status === "CRITICAL" ? RED : row.status === "WARNING" ? YELLOW : GREEN;
    const statusStr = clr(pad(` ${row.status}`, cW[4]), BOLD, statusColor);
    console.log(`  ${clr("│", DIM)} ║${pad(` ${row.control}`, cW[0])}║${pad(statusCell(row.owasp), cW[1] + 9)}║${pad(statusCell(row.gdpr), cW[2] + 9)}║${pad(statusCell(row.soc2), cW[3] + 9)}║${statusStr}║`);
    await sleep(120);
  }
  console.log(`  ${clr("│", DIM)} ╚${"═".repeat(cW[0])}╩${"═".repeat(cW[1])}╩${"═".repeat(cW[2])}╩${"═".repeat(cW[3])}╩${"═".repeat(cW[4])}╝`);

  // Remediation Priorities
  console.log(sectionHeader("Remediation Priority List (Risk × Effort)"));
  await sleep(200);
  const remediations = buildRemediations();

  const rW = [6, 38, 6, 8, 6];
  console.log(`  ${clr("│", DIM)}  ${clr(pad("#", rW[0]), BOLD)}${clr(pad("Issue", rW[1]), BOLD)}${clr(pad("Risk", rW[2]), BOLD)}${clr(pad("Effort", rW[3]), BOLD)}${clr(pad("Score", rW[4]), BOLD)}`);
  console.log(`  ${clr("│", DIM)}  ${"─".repeat(rW[0])}${"─".repeat(rW[1])}${"─".repeat(rW[2])}${"─".repeat(rW[3])}${"─".repeat(rW[4])}`);

  for (let i = 0; i < remediations.length; i++) {
    const r = remediations[i];
    const riskColor = r.risk === "CRIT" ? RED : r.risk === "HIGH" ? YELLOW : r.risk === "MED" ? MAGENTA : CYAN;
    console.log(`  ${clr("│", DIM)}  ${pad(String(i + 1), rW[0])}${pad(r.issue, rW[1])}${pad(clr(r.risk, BOLD, riskColor), rW[2] + 9)}${pad(r.effort, rW[3])}${clr(String(r.score), BOLD)}`);
    await sleep(100);
  }

  // Final Grade
  const { score, grade, color } = calculateGrade();
  await sleep(300);

  console.log("");
  console.log(`  ╔════════════════════════════════════════════════════════╗`);
  console.log(`  ║                                                        ║`);
  console.log(`  ║   ${clr("OVERALL COMPLIANCE SCORECARD", BOLD, WHITE)}                      ║`);
  console.log(`  ║                                                        ║`);
  console.log(`  ║   Score: ${pad(clr(`${score} / 100`, BOLD, color), 52)}║`);
  console.log(`  ║   Grade: ${pad(clr(grade, BOLD, color), 52)}║`);
  console.log(`  ║                                                        ║`);
  const critTotal = allFindings.filter(f => f.severity === "critical").length;
  const highTotal = allFindings.filter(f => f.severity === "high").length;
  const medTotal = allFindings.filter(f => f.severity === "medium").length;
  const lowTotal = allFindings.filter(f => f.severity === "low").length;
  console.log(`  ║   🔴 Critical: ${pad(String(critTotal), 5)}🟠 High: ${pad(String(highTotal), 5)}              ║`);
  console.log(`  ║   🟡 Medium:   ${pad(String(medTotal), 5)}🔵 Low:  ${pad(String(lowTotal), 5)}              ║`);
  console.log(`  ║                                                        ║`);
  console.log(`  ║   ${clr("Frameworks: OWASP Top 10 · GDPR · SOC2 TSC", DIM)}            ║`);
  console.log(`  ║                                                        ║`);
  console.log(`  ╚════════════════════════════════════════════════════════╝`);
  console.log("");
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(clr(`
  ┌──────────────────────────────────────────────────────────────┐
  │                                                              │
  │   🏢  COMPLIANCE CHECKER — Multi-Agent Security Audit       │
  │   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
  │   Frameworks: OWASP Top 10 · GDPR · SOC2                    │
  │   Agents:     5 specialized auditors                        │
  │   Target:     simulated-app (12 deps, 10 source files)      │
  │                                                              │
  └──────────────────────────────────────────────────────────────┘
`, BOLD, CYAN));

  await sleep(500);
  console.log(clr("  Initializing compliance audit pipeline...\n", DIM));
  await sleep(300);

  const agents = [
    { name: "OWASP Scanner", icon: "🛡️", fn: runOwaspScanner },
    { name: "GDPR Checker", icon: "🇪🇺", fn: runGdprChecker },
    { name: "SOC2 Auditor", icon: "🔐", fn: runSoc2Auditor },
    { name: "Dependency Auditor", icon: "📦", fn: runDependencyAuditor },
    { name: "Report Generator", icon: "📊", fn: runReportGenerator },
  ];

  for (let i = 0; i < agents.length; i++) {
    const a = agents[i];
    console.log(clr(`  ▸ Agent ${i + 1}/${agents.length}: ${a.icon}  ${a.name}`, BOLD, BLUE));
    await sleep(200);
    await a.fn();
    await sleep(300);
  }

  console.log(clr("  ✓ Compliance audit complete. Review findings above.\n", BOLD, GREEN));
}

main().catch(console.error);
