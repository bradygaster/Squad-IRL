# Squad SDK v1 — API Quick Reference

> **⚠️ INTERNAL ONLY — DO NOT PUBLISH**

## Adapter (`src/adapter/`)

| Export | Kind | Description |
|--------|------|-------------|
| `SquadClient` | class | Wraps Copilot SDK with lifecycle management and auto-reconnection |
| `SquadConnectionState` | type | `"disconnected" \| "connecting" \| "connected" \| "reconnecting" \| "error"` |
| `SquadClientOptions` | interface | Configuration for SquadClient (CLI path, port, auth, reconnection) |
| `SquadError` | class | Base error with severity, category, context, and recoverability |
| `SDKConnectionError` | class | SDK connection failure |
| `SessionLifecycleError` | class | Session create/destroy failure |
| `ToolExecutionError` | class | Tool invocation failure |
| `ModelAPIError` | class | Model API call failure |
| `ConfigurationError` | class | Invalid configuration |
| `AuthenticationError` | class | Auth failure |
| `RateLimitError` | class | Rate limit exceeded |
| `RuntimeError` | class | General runtime failure |
| `ValidationError` | class | Input validation failure |
| `ErrorSeverity` | enum | `INFO \| WARNING \| ERROR \| CRITICAL` |
| `ErrorCategory` | enum | `SDK_CONNECTION \| SESSION_LIFECYCLE \| TOOL_EXECUTION \| MODEL_API \| ...` |
| `ErrorFactory` | class | Wraps raw SDK errors with Squad context |
| `TelemetryCollector` | class | Tracks operation latency and error rates |
| `SquadSession` | interface | Session handle with sendMessage/destroy |
| `SquadTool` | interface | Tool definition with name, schema, handler |
| `SquadSessionHooks` | interface | Lifecycle hooks (pre/post tool use, session start/end) |

## Client (`src/client/`)

| Export | Kind | Description |
|--------|------|-------------|
| `SquadClientWithPool` | class | High-level client composing SquadClient + SessionPool + EventBus |
| `SessionPool` | class | Bounded concurrent session management with idle cleanup |
| `SessionStatus` | type | `"creating" \| "active" \| "idle" \| "error" \| "destroyed"` |
| `SessionPoolConfig` | interface | Pool config (maxConcurrent, idleTimeout, healthCheckInterval) |
| `EventBus` | class | Pub/sub for session lifecycle events |
| `SquadEvent` | interface | Event with type, sessionId, payload, timestamp |
| `SquadEventType` | type | `"session.created" \| "session.destroyed" \| "session.status_changed" \| ...` |

## Runtime (`src/runtime/`)

| Export | Kind | Description |
|--------|------|-------------|
| `loadConfig` | function | Discovers, loads, and validates squad.config.ts |
| `loadConfigSync` | function | Synchronous variant of loadConfig |
| `discoverConfigFile` | function | Walks up directories to find config file |
| `validateConfig` | function | Runtime type guard for SquadConfig |
| `HealthMonitor` | class | Periodic connection health checks |
| `HealthCheckResult` | interface | Status (`healthy \| degraded \| unhealthy`) with response time |
| `EventBus` | class | Enhanced event bus with error handlers and cleanup |

## Config (`src/config/`)

| Export | Kind | Description |
|--------|------|-------------|
| `SquadConfig` | interface | Root typed configuration for Squad teams |
| `TeamConfig` | interface | Team name, root directory, description |
| `AgentConfig` | interface | Per-agent configuration (model, tools, status) |
| `RoutingConfig` | interface | Work-type and issue-label routing rules |
| `ModelConfig` | interface | Model preferences and fallback chains |
| `HooksConfig` | interface | Hook/policy configuration |
| `defineConfig` | function | Merges partial config with defaults (Vite-style API) |
| `DEFAULT_CONFIG` | const | Default configuration values |
| `ModelRegistry` | class | Model catalog with tier/provider indexing and fallback chains |
| `MODEL_CATALOG` | const | Array of 17 ModelInfo entries |
| `ModelInfo` | interface | Model capability metadata (name, tier, provider, context window) |
| `DEFAULT_FALLBACK_CHAINS` | const | Tier-based fallback model chains |
| `getModelInfo` | function | Look up model by name |
| `getFallbackChain` | function | Get fallback chain for a tier |
| `isModelAvailable` | function | Check if a model is in the catalog |
| `compileRoutingRules` | function | Compiles routing config into regex-based router |
| `matchRoute` | function | Matches a message to a routing rule |
| `matchIssueLabels` | function | Matches issue labels to routing rules |
| `parseRoutingMarkdown` | function | Parses legacy routing.md table format |
| `AgentDefinition` | interface | Full agent definition from any source |
| `AgentRegistry` | class | Multi-source agent discovery |
| `LocalAgentSource` | class | Discovers agents from local .squad/ directory |
| `GitHubAgentSource` | class | Fetches agents from GitHub repositories |
| `MarketplaceAgentSource` | class | Discovers agents from marketplace |
| `parseAgentDoc` | function | Parses .agent.md into structured metadata |
| `AgentDocMetadata` | interface | Structured metadata from agent docs |
| `syncDocToConfig` | function | Merges agent doc metadata into SquadConfig |
| `syncConfigToDoc` | function | Generates agent markdown from typed config |
| `detectDrift` | function | Detects mismatches between doc and config |
| `DriftReport` | interface | List of drift entries with mismatch details |
| `initSquad` | function | Scaffolds a new Squad project |
| `InitOptions` | interface | Options for project initialization |
| `MigrationRegistry` | class | Registers and executes semver migration chains |
| `Migration` | interface | Single version migration (from, to, transform function) |
| `parseSemVer` | function | Parses version string into SemVer object |
| `compareSemVer` | function | Compares two SemVer values |
| `migrateMarkdownToConfig` | function | Converts .squad/ markdown to typed SquadConfig |
| `parseTeamMarkdown` | function | Parses team.md into structured data |
| `generateConfigFromParsed` | function | Converts parsed markdown into SquadConfig |

## Agents (`src/agents/`)

| Export | Kind | Description |
|--------|------|-------------|
| `AgentCharter` | interface | Agent identity: name, role, expertise, style, tools, model |
| `AgentLifecycleState` | type | `"pending" \| "spawning" \| "active" \| "idle" \| "error" \| "destroyed"` |
| `AgentSessionInfo` | interface | Agent session state (charter, sessionId, state) |
| `compileCharter` | function | Transforms charter.md → SDK CustomAgentConfig |
| `compileCharterFull` | function | Full compile with resolved model/tools and metadata |
| `parseCharterMarkdown` | function | Extracts sections from charter markdown |
| `CompiledCharter` | interface | Compiled charter with resolved model and tools |
| `ParsedCharter` | interface | Parsed charter structure (identity, model, collaboration) |
| `resolveModel` | function | 4-layer priority model resolution |
| `ResolvedModel` | interface | Result with model, tier, source, fallback chain |
| `TaskType` | type | `"code" \| "prompt" \| "docs" \| "visual" \| "planning" \| "mechanical"` |
| `ModelTier` | type | `"premium" \| "standard" \| "fast"` |
| `ModelResolutionSource` | type | `"user-override" \| "charter" \| "task-auto" \| "default"` |
| `AgentLifecycleManager` | class | Manages agent spawn→destroy lifecycle with idle reaping |
| `AgentHandle` | interface | Handle to spawned agent (sendMessage, destroy) |
| `SpawnAgentOptions` | interface | Options for spawning an agent |
| `onboardAgent` | function | Creates agent directory, charter, and history |
| `addAgentToConfig` | function | Registers agent in squad.config.ts |
| `createHistoryShadow` | function | Creates agent history.md file |
| `appendToHistory` | function | Appends entry to agent history section |
| `readHistory` | function | Reads and parses agent history |

## Coordinator (`src/coordinator/`)

| Export | Kind | Description |
|--------|------|-------------|
| `Coordinator` | class | Central orchestrator for routing and agent sessions |
| `RoutingDecision` | interface | Routing result with tier, targets, parallelism flag |
| `ResponseTier` | type | `"direct" \| "lightweight" \| "standard" \| "full"` |
| `spawnParallel` | function | Spawns multiple agents concurrently (Promise.allSettled) |
| `aggregateSessionEvents` | function | Forwards agent events to coordinator event bus |
| `SpawnResult` | interface | Spawn outcome with status, timing, and errors |
| `AgentSpawnConfig` | interface | Config for spawning (name, task, priority, model override) |

## Hooks (`src/hooks/`)

| Export | Kind | Description |
|--------|------|-------------|
| `HookPipeline` | class | Runs pre/post tool hooks with 5 built-in policies |
| `ReviewerLockoutHook` | class | Prevents agents from editing artifacts they review |
| `PolicyConfig` | interface | Config for file guards, shell restrictions, rate limits, PII |
| `HookAction` | type | `"allow" \| "block" \| "modify"` |
| `PreToolUseHook` | type | Async hook function for pre-tool interception |
| `PostToolUseHook` | type | Async hook function for post-tool inspection |

## Tools (`src/tools/`)

| Export | Kind | Description |
|--------|------|-------------|
| `ToolRegistry` | class | Registers and manages the 5 built-in Squad tools |
| `defineTool` | function | Defines a typed tool with JSON schema |
| `ToolResult` | interface | Tool execution result (success flag + data) |
| `RouteRequest` | interface | Parameters for routing a task to another agent |
| `DecisionRecord` | interface | Data for recording a team decision |
| `MemoryEntry` | interface | Entry for agent history (learnings, updates) |
| `StatusQuery` | interface | Query filter for session pool status |
| `SkillRequest` | interface | Parameters for reading/writing agent skills |

## Skills (`src/skills/`)

| Export | Kind | Description |
|--------|------|-------------|
| `SkillRegistry` | class | In-memory skill store with keyword+role matching |
| `SkillDefinition` | interface | Skill metadata: id, name, domain, content, triggers, agentRoles |
| `SkillMatch` | interface | Match result with skill, score (0–1), and reason |
| `loadSkillsFromDirectory` | function | Loads all SKILL.md files from a directory tree |
| `parseFrontmatter` | function | Parses YAML-like frontmatter from SKILL.md strings |
| `parseSkillFile` | function | Parses a single SKILL.md into a SkillDefinition |
| `SkillSource` | interface | Pluggable skill discovery (local or GitHub) |
| `SkillManifest` | interface | Lightweight skill catalog entry (id, name, domain, source) |
| `SkillSourceRegistry` | class | Multi-source skill discovery with priority ordering |
| `LocalSkillSource` | class | Discovers skills from `.squad/skills/` on disk |
| `GitHubSkillSource` | class | Fetches skills from GitHub repositories |

## Build (`src/build/`)

| Export | Kind | Description |
|--------|------|-------------|
| `BundleConfig` | interface | esbuild config: entry points, outDir, format, minify, sourcemap, externals |
| `BundleFormat` | type | `"esm" \| "cjs"` |
| `BundleValidationResult` | interface | Validation result with errors, warnings, and file list |
| `createBundleConfig` | function | Creates BundleConfig with Squad-aware defaults |
| `getBundleTargets` | function | Returns default SDK entry points |
| `validateBundleOutput` | function | Validates build output directory for expected artifacts |
| `NpmPackageConfig` | interface | npm package generation config (name, version, exports, bin) |
| `PackageJsonOutput` | interface | Generated package.json structure |
| `PackageValidationResult` | interface | npm package validation result |
| `generatePackageJson` | function | Generates publish-ready package.json from config |
| `validatePackageJson` | function | Validates package.json for npm publish readiness |
| `GitHubDistConfig` | interface | GitHub Releases distribution config (owner, repo, binary) |
| `ReleaseValidationResult` | interface | GitHub release validation result |
| `generateInstallScript` | function | Generates shell install script for GitHub Releases |
| `validateGitHubRelease` | function | Validates release has expected assets |
| `CIPipelineConfig` | interface | CI/CD pipeline config (steps, triggers, artifacts, env) |
| `CIPipelineStep` | interface | Single pipeline step (name, command, condition, env) |
| `CIPipelineTrigger` | interface | Pipeline trigger (push, PR, release, schedule) |
| `CIPipelineArtifact` | interface | Build artifact config (name, path, retention) |
| `PipelineValidationResult` | interface | Pipeline validation result |
| `generatePipelineYaml` | function | Generates GitHub Actions workflow YAML |
| `CommitInfo` | interface | Commit metadata (sha, message, author, date, type) |
| `ConventionalCommit` | interface | Parsed conventional commit (type, scope, description, breaking) |
| `parseConventionalCommit` | function | Parses conventional commit messages |
| `bumpVersion` | function | Bumps semver version by major/minor/patch/prerelease |
| `InstallMethod` | type | `"npx-github" \| "npm-global" \| "npm-local" \| "unknown"` |
| `MigrationPlan` | interface | Install migration plan (from, to, steps) |
| `MigrationStep` | interface | Single migration step (description, command) |
| `detectInstallMethod` | function | Detects current install method from environment |
| `generateMigrationPlan` | function | Generates steps to migrate between install methods |

## Sharing (`src/sharing/`)

| Export | Kind | Description |
|--------|------|-------------|
| `ExportBundle` | interface | Portable config bundle (config, agents, skills, routing, metadata) |
| `ExportOptions` | interface | Export options (includeHistory, format, anonymize) |
| `ExportMetadata` | interface | Bundle metadata (version, timestamp, source) |
| `exportSquadConfig` | function | Exports Squad config as a portable bundle |
| `ImportOptions` | interface | Import options (merge, dryRun, skipValidation) |
| `ImportResult` | interface | Import result (success, changes, warnings) |
| `ImportChange` | interface | Single import change (type, path, reason) |
| `deserializeBundle` | function | Deserializes JSON bundle string into ExportBundle |
| `validateBundle` | function | Validates ExportBundle structural correctness |
| `importSquadConfig` | function | Imports a bundle into a target project |
| `HistoryEntry` | interface | History record (id, timestamp, type, content, agent) |
| `AgentHistory` | interface | Agent history container with entries |
| `SplitResult` | interface | History split result (exportable + private) |
| `splitHistory` | function | Separates shareable history from private data |
| `VersionPin` | interface | Agent version pin (agentId, sha, timestamp, source) |
| `VersionDiff` | interface | Version diff between two pins |
| `pinAgentVersion` | function | Pins an agent to a specific commit SHA |
| `getAgentVersion` | function | Gets the current version pin for an agent |
| `AgentRepoConfig` | interface | Agent repository config (owner, repo, branch, auth) |
| `AgentRepoOperations` | interface | GitHub operations for agent repo management |
| `PushResult` | interface | Push result (success, sha, errors) |
| `configureAgentRepo` | function | Validates and returns agent repo config |
| `AgentCache` | class | TTL-based cache for remote agent definitions |
| `CacheEntry` | interface | Cache entry with value, timestamp, TTL, source |
| `CacheStats` | interface | Cache statistics (hits, misses, evictions, size) |
| `DEFAULT_AGENT_TTL` | const | Default agent cache TTL (1 hour) |
| `DEFAULT_SKILL_TTL` | const | Default skill cache TTL (5 minutes) |
| `Conflict` | interface | Config conflict (path, existingValue, incomingValue, type) |
| `ConflictType` | type | `"added" \| "modified" \| "removed"` |
| `ConflictStrategy` | type | `"keep-existing" \| "use-incoming" \| "merge" \| "manual"` |
| `IncomingBundle` | interface | Incoming config bundle for conflict detection |
| `detectConflicts` | function | Detects conflicts between existing and incoming config |
| `resolveConflicts` | function | Applies a conflict resolution strategy |

## Marketplace (`src/marketplace/`)

| Export | Kind | Description |
|--------|------|-------------|
| `ManifestCategory` | enum | `Productivity \| Development \| Testing \| DevOps \| Documentation \| Security \| Other` |
| `MarketplaceManifest` | interface | Full marketplace manifest (name, version, author, categories, pricing) |
| `ManifestPricing` | interface | Pricing config (model: free/paid/freemium) |
| `ManifestValidationResult` | interface | Manifest validation result (valid, errors, warnings) |
| `validateManifest` | function | Validates a marketplace manifest |
| `generateManifest` | function | Generates manifest from SquadConfig |
| `MarketplaceEntry` | interface | Marketplace catalog record with stats and verification |
| `MarketplaceEntryStats` | interface | Entry stats (downloads, rating, reviews) |
| `MarketplaceIndex` | interface | Full marketplace catalog with search support |
| `MarketplaceSearchQuery` | interface | Search query (text, category, tags, sort, pagination) |
| `MarketplaceSearchResult` | interface | Paginated search result |
| `MarketplaceSortField` | type | `"downloads" \| "rating" \| "name" \| "recent"` |
| `EntryValidationResult` | interface | Entry validation result |
| `searchMarketplace` | function | Searches marketplace index with filters |
| `validateEntry` | function | Validates a marketplace entry |
| `generateEntryFromConfig` | function | Creates entry from SquadConfig |
| `MarketplaceBrowser` | class | CLI interface for browsing marketplace |
| `MarketplaceFetcher` | interface | Pluggable marketplace data fetcher |
| `InstallResult` | interface | Install result with created files and conflicts |
| `formatEntryList` | function | Formats entry list for CLI output |
| `formatEntryDetails` | function | Formats single entry detail view |
| `MarketplaceBackend` | class | Reference marketplace API backend |
| `PublishResult` | interface | Publish result (success, url, warnings) |
| `OperationResult` | interface | Generic operation result |
| `ExtensionAdapter` | class | Bridges Squad to Copilot Extensions API |
| `ExtensionConfig` | interface | Extension config shape |
| `ExtensionEvent` | interface | Extension event (type, timestamp, payload) |
| `RegistrationResult` | interface | Extension registration result |
| `toExtensionConfig` | function | Converts SquadConfig to ExtensionConfig |
| `fromExtensionEvent` | function | Converts extension events to Squad events |
| `registerExtension` | function | Registers extension with marketplace |
| `packageForMarketplace` | function | Packages project directory for marketplace |
| `validatePackageContents` | function | Validates package contents before publish |
| `PackageResult` | interface | Package result (outputPath, size, files) |
| `MarketplacePackageValidationResult` | interface | Package validation result |
| `SECURITY_RULES` | const | Array of 7 SecurityRule checks for remote agents |
| `SecurityRule` | interface | Rule definition (name, severity, check function) |
| `SecuritySeverity` | type | `"warning" \| "critical"` |
| `SecurityReport` | interface | Validation report (passed, warnings, blocked, riskScore) |
| `RemoteAgentDefinition` | interface | Agent definition with charter and tools for security context |
| `validateRemoteAgent` | function | Runs all 7 security rules against a remote agent |
| `quarantineAgent` | function | Sanitizes a blocked agent (strips injection, caps tools) |
| `generateSecurityReport` | function | Produces audit-ready security summary |

## CLI (`src/cli/`)

| Export | Kind | Description |
|--------|------|-------------|
| `ReleaseChannel` | type | `"stable" \| "preview" \| "insider"` |
| `UpdateInfo` | interface | Available update info (newVersion, releaseUrl, changelog) |
| `UpgradeOptions` | interface | Upgrade options (force, dryRun, channel) |
| `UpgradeResult` | interface | Upgrade result (success, fromVersion, toVersion, changes) |
| `SDKUpgradeOptions` | interface | SDK-specific upgrade options with MigrationRegistry |
| `SDKUpgradeResult` | interface | SDK upgrade result with migration steps |
| `VersionFetcher` | type | Pluggable version resolver callback |
| `PackageJsonReader` | type | Pluggable package.json reader |
| `PackageJsonWriter` | type | Pluggable package.json writer |
| `checkForUpdate` | function | Checks registry for available updates |
| `performUpgrade` | function | Applies an upgrade in-place |
| `CopilotEnvironment` | type | `"cli" \| "vscode" \| "web" \| "unknown"` |
| `InstallConfig` | interface | In-Copilot installation config (project name, agents, format) |
| `CopilotInstallResult` | interface | Install result (success, environment, createdFiles, instructions) |
| `InstallStep` | interface | Single install instruction step |
| `EnvironmentIndicators` | interface | Environment detection inputs (env vars, argv) |
| `detectCopilotEnvironment` | function | Detects active Copilot environment (CLI, VS Code, web) |
| `installInCopilot` | function | Scaffolds a Squad project from within Copilot |

## Runtime Extensions (`src/runtime/`)

| Export | Kind | Description |
|--------|------|-------------|
| `ConnectivityStatus` | type | `"online" \| "offline" \| "degraded"` |
| `OfflineManager` | class | Manages offline detection, pending ops queue, and sync |
| `OfflineCapabilities` | interface | What works offline (local agents, cached skills, config editing) |
| `OfflineStatus` | interface | Current status (connectivity, pendingOps, lastSync, cachedAgents) |
| `PendingOperation` | interface | Queued operation for later sync |
| `SyncResult` | interface | Sync result (synced, failed, remaining) |
| `detectConnectivity` | function | Checks current connectivity status |

## Streaming (`src/runtime/streaming.ts`)

| Export | Kind | Description |
|--------|------|-------------|
| `StreamDelta` | interface | Streaming content delta event |
| `UsageEvent` | interface | Token usage event |
| `ReasoningDelta` | interface | Reasoning/thinking delta event |
| `StreamingEvent` | type | `StreamDelta \| UsageEvent \| ReasoningDelta` |
| `DeltaHandler` | type | Async callback for stream deltas |
| `UsageHandler` | type | Async callback for usage events |
| `ReasoningHandler` | type | Async callback for reasoning deltas |
| `UsageSummary` | interface | Aggregated usage totals |
| `AgentUsage` | interface | Per-agent usage breakdown |
| `StreamingPipeline` | class | Manages streaming event handlers and dispatch |

## Cost Tracking (`src/runtime/cost-tracker.ts`)

| Export | Kind | Description |
|--------|------|-------------|
| `AgentCostEntry` | interface | Per-agent cost record |
| `SessionCostEntry` | interface | Per-session cost record |
| `CostSummary` | interface | Aggregated cost summary |
| `CostTracker` | class | Tracks and aggregates model usage costs |

## Telemetry (`src/runtime/telemetry.ts`)

| Export | Kind | Description |
|--------|------|-------------|
| `TelemetryEventName` | type | Named telemetry event types |
| `TelemetryEvent` | interface | Telemetry event with name, timestamp, payload |
| `TelemetryConfig` | interface | Telemetry configuration (endpoint, enabled, sampling) |
| `TelemetryTransport` | type | Pluggable transport callback for telemetry events |
| `setTelemetryTransport` | function | Sets the global telemetry transport |
| `TelemetryCollector` | class | Collects and dispatches telemetry events |
| `shouldNotifyUpdate` | function | Checks if update notification interval has elapsed |

## Internationalization (`src/runtime/i18n.ts`)

| Export | Kind | Description |
|--------|------|-------------|
| `MessageCatalog` | type | `Record<string, string>` message key→value map |
| `AccessibilityFinding` | interface | Single accessibility audit finding |
| `AccessibilityReport` | interface | Full accessibility audit report |
| `defaultCatalog` | const | Default English message catalog |
| `I18nManager` | class | Message catalog management and lookup |
| `auditAccessibility` | function | Audits SquadConfig for accessibility issues |

## Benchmarks (`src/runtime/benchmarks.ts`)

| Export | Kind | Description |
|--------|------|-------------|
| `BenchmarkResult` | interface | Single benchmark result with stats |
| `TimingResult` | interface | Timing measurement result |
| `BenchmarkReport` | interface | Full benchmark report with all results |
| `BenchmarkFn` | type | Async or sync benchmark function |
| `percentile` | function | Computes percentile from sorted array |
| `measureIterations` | function | Measures function over N iterations |
| `BenchmarkSuite` | class | Registers and runs benchmark suites |
| `formatBenchmarkReport` | function | Formats benchmark results for display |

## Casting (`src/casting/`)

| Export | Kind | Description |
|--------|------|-------------|
| `AgentRole` | type | Agent role identifier |
| `UniverseId` | type | `"usual-suspects" \| "oceans-eleven" \| "custom"` |
| `CastMember` | interface | Assembled cast member with role, model, tools |
| `CastingConfig` | interface | Casting engine configuration |
| `CastingEngine` | class | Assembles agent teams for tasks |
| `CastingRecordMember` | interface | Cast member in a history record |
| `CastingRecord` | interface | Single casting history entry |
| `SerializedCastingHistory` | interface | Serializable casting history |
| `CastingHistory` | class | Tracks past team assemblies |
| `CastingUniverse` | interface | Named agent universe definition |
| `CastingEntry` | interface | Entry in a casting registry |
| `CastingRegistryConfig` | interface | Casting registry configuration |
| `CastingRegistry` | class | Multi-universe casting with pluggable sources |

## Monitor (`src/ralph/`)

| Export | Kind | Description |
|--------|------|-------------|
| `MonitorConfig` | interface | Monitor configuration (intervals, thresholds) |
| `AgentWorkStatus` | interface | Agent work status snapshot |
| `MonitorState` | interface | Full monitor state with all agent statuses |
| `RalphMonitor` | class | Monitors agent work status and health |
