import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { getRoleEmoji } from '../lifecycle.js';
import type { AgentSession } from '../types.js';

interface AgentPanelProps {
  agents: AgentSession[];
  streamingContent?: { agentName: string; content: string } | null;
}

const PULSE_FRAMES = ['●', '◉', '○', '◉'];

/** Pulsing dot for active agents — draws the eye. */
const PulsingDot: React.FC = () => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % PULSE_FRAMES.length);
    }, 300);
    return () => clearInterval(timer);
  }, []);

  return <Text color="green">{PULSE_FRAMES[frame]}</Text>;
};

/** Elapsed time since agent started working. */
function agentElapsed(agent: AgentSession): string {
  const active = agent.status === 'streaming' || agent.status === 'working';
  if (!active) return '';
  const seconds = Math.floor((Date.now() - agent.startedAt.getTime()) / 1000);
  if (seconds < 1) return '';
  return ` (${seconds}s)`;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ agents, streamingContent }) => {
  if (agents.length === 0) {
    return (
      <Box flexDirection="column" paddingX={1} marginTop={1}>
        <Text dimColor>No agents active. Type a message to start, or run /help for commands.</Text>
      </Box>
    );
  }

  // Tick every second to update elapsed times
  const [, setTick] = useState(0);
  useEffect(() => {
    const hasActive = agents.some(a => a.status === 'working' || a.status === 'streaming');
    if (!hasActive) return;
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [agents]);

  const activeAgents = agents.filter(a => a.status === 'streaming' || a.status === 'working');

  return (
    <Box flexDirection="column" paddingX={1} marginTop={1}>
      {/* Agent roster */}
      <Box flexWrap="wrap" gap={1}>
        {agents.map((agent) => {
          const active = agent.status === 'streaming' || agent.status === 'working';
          const errored = agent.status === 'error';
          return (
            <Box key={agent.name} gap={0}>
              <Text
                dimColor={!active && !errored}
                bold={active}
                color={active ? 'green' : errored ? 'red' : undefined}
              >
                {getRoleEmoji(agent.role)} {agent.name}
              </Text>
              {active && (
                <Box marginLeft={0}>
                  <Text> </Text>
                  <PulsingDot />
                  <Text color="green" bold> ▶ Active</Text>
                </Box>
              )}
              {errored && <Text color="red"> ✖</Text>}
            </Box>
          );
        })}
      </Box>

      {/* Status line */}
      {activeAgents.length > 0 ? (
        <Box flexDirection="column">
          {activeAgents.map(a => (
            <Text key={a.name} color="yellow">
              {'  '}{getRoleEmoji(a.role)} {a.name} {a.status === 'streaming' ? 'streaming' : 'working'}{agentElapsed(a)}
            </Text>
          ))}
        </Box>
      ) : (
        <Text dimColor>{'  '}{agents.length} agent{agents.length !== 1 ? 's' : ''} ready · all idle</Text>
      )}

      {/* Separator between panel and message stream */}
      <Box marginTop={0}>
        <Text dimColor>{'┄'.repeat(Math.min(process.stdout.columns ?? 80, 120) - 2)}</Text>
      </Box>
    </Box>
  );
};
