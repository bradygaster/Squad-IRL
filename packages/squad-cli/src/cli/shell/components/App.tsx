/**
 * Main Ink shell application — composes AgentPanel, MessageStream, and InputPrompt.
 *
 * Exposes a ShellApi callback so the parent (runShell) can wire
 * StreamBridge events into React state.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { AgentPanel } from './AgentPanel.js';
import { MessageStream } from './MessageStream.js';
import { InputPrompt } from './InputPrompt.js';
import { parseInput, type ParsedInput } from '../router.js';
import { executeCommand } from '../commands.js';
import { loadWelcomeData } from '../lifecycle.js';
import { isNoColor, useTerminalWidth } from '../terminal.js';
import type { WelcomeData } from '../lifecycle.js';
import type { SessionRegistry } from '../sessions.js';
import type { ShellRenderer } from '../render.js';
import type { ShellMessage, AgentSession } from '../types.js';

/** Methods exposed to the host so StreamBridge can push data into React state. */
export interface ShellApi {
  addMessage: (msg: ShellMessage) => void;
  setStreamingContent: (content: { agentName: string; content: string } | null) => void;
  setActivityHint: (hint: string | undefined) => void;
  setAgentActivity: (agentName: string, activity: string | undefined) => void;
  refreshAgents: () => void;
}

export interface AppProps {
  registry: SessionRegistry;
  renderer: ShellRenderer;
  teamRoot: string;
  version: string;
  onReady?: (api: ShellApi) => void;
  onDispatch?: (parsed: ParsedInput) => Promise<void>;
}

const EXIT_WORDS = new Set(['exit', 'quit', 'q']);

export const App: React.FC<AppProps> = ({ registry, renderer, teamRoot, version, onReady, onDispatch }) => {
  const { exit } = useApp();
  const [messages, setMessages] = useState<ShellMessage[]>([]);
  const [agents, setAgents] = useState<AgentSession[]>(registry.getAll());
  const [streamingContent, setStreamingContent] = useState<{ agentName: string; content: string } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [activityHint, setActivityHint] = useState<string | undefined>(undefined);
  const [agentActivities, setAgentActivities] = useState<Map<string, string>>(new Map());
  const [welcome, setWelcome] = useState<WelcomeData | null>(null);
  const messagesRef = useRef<ShellMessage[]>([]);

  // Keep ref in sync so command handlers see latest history
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Load welcome data from .squad/ directory on mount
  useEffect(() => {
    const data = loadWelcomeData(teamRoot);
    if (data) setWelcome(data);
  }, [teamRoot]);

  // Expose API for external callers (StreamBridge, coordinator)
  useEffect(() => {
    onReady?.({
      addMessage: (msg: ShellMessage) => {
        setMessages(prev => [...prev, msg]);
        setStreamingContent(null);
        setActivityHint(undefined);
      },
      setStreamingContent,
      setActivityHint,
      setAgentActivity: (agentName: string, activity: string | undefined) => {
        setAgentActivities(prev => {
          const next = new Map(prev);
          if (activity) {
            next.set(agentName, activity);
          } else {
            next.delete(agentName);
          }
          return next;
        });
      },
      refreshAgents: () => {
        setAgents([...registry.getAll()]);
      },
    });
  }, [onReady, registry]);

  // Graceful Ctrl+C
  useInput((_input, key) => {
    if (key.ctrl && _input === 'c') {
      exit();
    }
  });

  const handleSubmit = useCallback((input: string) => {
    // Bare "exit" exits the shell
    if (EXIT_WORDS.has(input.toLowerCase())) {
      exit();
      return;
    }

    const userMsg: ShellMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    const knownAgents = registry.getAll().map(a => a.name);
    const parsed = parseInput(input, knownAgents);

    if (parsed.type === 'slash_command') {
      const result = executeCommand(parsed.command!, parsed.args ?? [], {
        registry,
        renderer,
        messageHistory: [...messagesRef.current, userMsg],
        teamRoot,
        version,
      });

      if (result.exit) {
        exit();
        return;
      }

      if (result.clear) {
        setMessages([]);
        return;
      }

      if (result.output) {
        setMessages(prev => [...prev, {
          role: 'system' as const,
          content: result.output!,
          timestamp: new Date(),
        }]);
      }
    } else if (parsed.type === 'direct_agent' || parsed.type === 'coordinator') {
      if (!onDispatch) {
        setMessages(prev => [...prev, {
          role: 'system' as const,
          content: 'SDK not connected. Check your setup.',
          timestamp: new Date(),
        }]);
        return;
      }
      setProcessing(true);
      onDispatch(parsed).finally(() => {
        setProcessing(false);
        setAgents([...registry.getAll()]);
      });
    }

    setAgents([...registry.getAll()]);
  }, [registry, renderer, teamRoot, exit, onDispatch]);

  const rosterAgents = welcome?.agents ?? [];

  const agentCount = welcome?.agents.length ?? 0;
  const activeCount = agents.filter(a => a.status === 'streaming' || a.status === 'working').length;

  const noColor = isNoColor();
  const width = useTerminalWidth();
  const compact = width <= 60;
  const wide = width >= 100;

  // Welcome banner: instant display (no typewriter blocking)
  const titleRevealed = welcome ? '◆ SQUAD' : '';
  const bannerReady = true;
  const bannerDim = false;

  // Pick a lead agent name for the first-run guided prompt
  const leadAgent = welcome?.agents[0]?.name ?? 'Keaton';

  return (
    <Box flexDirection="column">
      <Box flexDirection="column" borderStyle="round" borderColor={noColor ? undefined : 'cyan'} paddingX={1}>
        <Box gap={1}>
          <Text bold color={noColor ? undefined : 'cyan'}>{welcome ? titleRevealed : '◆ SQUAD'}</Text>
          {bannerReady && <Text dimColor>v{version}</Text>}
          {bannerReady && !compact && welcome?.description ? (
            <>
              <Text dimColor>-</Text>
              <Text dimColor wrap="wrap">{welcome.description}</Text>
            </>
          ) : null}
        </Box>
        {bannerReady && !compact && <Text>{' '}</Text>}
        {bannerReady && !compact && rosterAgents.length > 0 ? (
          <>
            <Box flexWrap="wrap" columnGap={1}>
              {rosterAgents.map((a, i) => (
                <Text key={a.name} dimColor={bannerDim}>{a.name}{i < rosterAgents.length - 1 ? ' -' : ''}</Text>
              ))}
            </Box>
            <Text dimColor>  {agentCount} agent{agentCount !== 1 ? 's' : ''} ready - {activeCount} active</Text>
          </>
        ) : bannerReady && compact && agentCount > 0 ? (
          <Text dimColor>{agentCount} agent{agentCount !== 1 ? 's' : ''} - {activeCount} active</Text>
        ) : bannerReady && rosterAgents.length === 0 ? (
          <Text dimColor>{"  Run 'squad init' to get started"}</Text>
        ) : null}
        {bannerReady && !compact && <Text>{' '}</Text>}
        {bannerReady && wide && welcome?.focus ? <Text dimColor>Focus: {welcome.focus}</Text> : null}
        {bannerReady && <Text dimColor>{compact ? '/help - Ctrl+C exit' : 'Just type what you need — Squad routes it - @Agent to direct - /help - Ctrl+C exit'}</Text>}
      </Box>

      {bannerReady && welcome?.isFirstRun ? (
        <Box flexDirection="column" paddingX={1} paddingY={compact ? 0 : 1}>
          <Text color={noColor ? undefined : 'green'} bold>Your squad is assembled.</Text>
          {!compact && <Text> </Text>}
          <Text>Try: <Text bold color={noColor ? undefined : 'cyan'}>{compact ? 'What should we build?' : 'What should we build first?'}</Text></Text>
          {!compact && <Text dimColor>Squad automatically routes your message to the best agent.</Text>}
          {!compact && <Text dimColor>Or use <Text bold>@{leadAgent}</Text> to message an agent directly.</Text>}
        </Box>
      ) : null}

      <AgentPanel agents={agents} streamingContent={streamingContent} />
      <MessageStream messages={messages} agents={agents} streamingContent={streamingContent} processing={processing} activityHint={activityHint} agentActivities={agentActivities} />
      <InputPrompt onSubmit={handleSubmit} disabled={processing} />
    </Box>
  );
};
