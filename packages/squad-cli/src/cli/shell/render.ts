/**
 * Console-based shell renderer.
 *
 * Renders agent output to the terminal using plain stdout writes.
 * This is the pre-ink renderer — will be replaced with ink components later.
 *
 * @module cli/shell/render
 */

export class ShellRenderer {
  private currentAgent: string | null = null;

  /** Print a content delta (streaming chunk). */
  renderDelta(agentName: string, content: string): void {
    if (this.currentAgent !== agentName) {
      if (this.currentAgent) process.stdout.write('\n');
      process.stdout.write(`\n${agentName}: `);
      this.currentAgent = agentName;
    }
    process.stdout.write(content);
  }

  /** Print a complete message. */
  renderMessage(role: string, name: string | undefined, content: string): void {
    const prefix = name ? `${name}` : role;
    console.log(`\n${prefix}: ${content}`);
    this.currentAgent = null;
  }

  /** Print a system message. */
  renderSystem(message: string): void {
    console.log(`\n💡 ${message}`);
    this.currentAgent = null;
  }

  /** Print an error. */
  renderError(agentName: string, error: string): void {
    console.error(`\n❌ ${agentName}: ${error}`);
    this.currentAgent = null;
  }

  /** Print usage stats. */
  renderUsage(model: string, inputTokens: number, outputTokens: number, cost: number): void {
    if (cost > 0) {
      console.log(`  📊 ${model}: ${inputTokens}+${outputTokens} tokens ($${cost.toFixed(4)})`);
    }
  }
}
