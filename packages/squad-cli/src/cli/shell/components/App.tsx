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
import { parseInput } from '../router.js';
import { executeCommand } from '../commands.js';
import type { SessionRegistry } from '../sessions.js';
import type { ShellRenderer } from '../render.js';
import type { ShellMessage, AgentSession } from '../types.js';

/** Methods exposed to the host so StreamBridge can push data into React state. */
export interface ShellApi {
  addMessage: (msg: ShellMessage) => void;
  setStreamingContent: (content: { agentName: string; content: string } | null) => void;
  refreshAgents: () => void;
}

export interface AppProps {
  registry: SessionRegistry;
  renderer: ShellRenderer;
  teamRoot: string;
  version: string;
  onReady?: (api: ShellApi) => void;
}

const EXIT_WORDS = new Set(['exit']);

export const App: React.FC<AppProps> = ({ registry, renderer, teamRoot, version, onReady }) => {
  const { exit } = useApp();
  const [messages, setMessages] = useState<ShellMessage[]>([]);
  const [agents, setAgents] = useState<AgentSession[]>(registry.getAll());
  const [streamingContent, setStreamingContent] = useState<{ agentName: string; content: string } | null>(null);
  const [processing, setProcessing] = useState(false);
  const messagesRef = useRef<ShellMessage[]>([]);

  // Keep ref in sync so command handlers see latest history
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Expose API for external callers (StreamBridge, coordinator)
  useEffect(() => {
    onReady?.({
      addMessage: (msg: ShellMessage) => {
        setMessages(prev => [...prev, msg]);
        setStreamingContent(null);
      },
      setStreamingContent,
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
      });

      if (result.exit) {
        exit();
        return;
      }

      if (result.output) {
        setMessages(prev => [...prev, {
          role: 'system' as const,
          content: result.output!,
          timestamp: new Date(),
        }]);
      }
    } else if (parsed.type === 'direct_agent') {
      // Direct agent messages — placeholder until coordinator wiring
      setMessages(prev => [...prev, {
        role: 'system' as const,
        content: `[routing to ${parsed.agentName}] ${parsed.content ?? input}`,
        timestamp: new Date(),
      }]);
    } else {
      // Coordinator routing — placeholder until coordinator wiring
      setMessages(prev => [...prev, {
        role: 'system' as const,
        content: `[coordinator] ${parsed.content ?? input}`,
        timestamp: new Date(),
      }]);
    }

    setAgents([...registry.getAll()]);
  }, [registry, renderer, teamRoot, exit]);

  return (
    <Box flexDirection="column">
      <Box borderStyle="single" borderColor="cyan" paddingX={1}>
        <Text bold color="cyan">Squad v{version}</Text>
        <Text dimColor>  Type /help for commands</Text>
      </Box>

      <AgentPanel agents={agents} />
      <MessageStream messages={messages} streamingContent={streamingContent} />
      <InputPrompt onSubmit={handleSubmit} disabled={processing} prompt="squad> " />
    </Box>
  );
};
