/**
 * Session registry — tracks active agent sessions within the interactive shell.
 */

import { AgentSession } from './types.js';

export class SessionRegistry {
  private sessions = new Map<string, AgentSession>();

  register(name: string, role: string): AgentSession {
    const session: AgentSession = {
      name,
      role,
      status: 'idle',
      startedAt: new Date(),
    };
    this.sessions.set(name, session);
    return session;
  }

  get(name: string): AgentSession | undefined {
    return this.sessions.get(name);
  }

  getAll(): AgentSession[] {
    return Array.from(this.sessions.values());
  }

  getActive(): AgentSession[] {
    return this.getAll().filter(s => s.status === 'working' || s.status === 'streaming');
  }

  updateStatus(name: string, status: AgentSession['status']): void {
    const session = this.sessions.get(name);
    if (session) {
      session.status = status;
      // Clear activity hint when agent goes idle or errors
      if (status === 'idle' || status === 'error') session.activityHint = undefined;
    }
  }

  updateActivityHint(name: string, hint: string | undefined): void {
    const session = this.sessions.get(name);
    if (session) session.activityHint = hint;
  }

  remove(name: string): boolean {
    return this.sessions.delete(name);
  }

  clear(): void {
    this.sessions.clear();
  }
}
