import React from 'react';
import { Box, Text } from 'ink';
import type { AgentSession } from '../types.js';

interface AgentPanelProps {
  agents: AgentSession[];
}

const statusIcon = (status: AgentSession['status']): string => {
  switch (status) {
    case 'idle': return '⚪';
    case 'working': return '🔵';
    case 'streaming': return '🟢';
    case 'error': return '🔴';
    default: return '⚪';
  }
};

export const AgentPanel: React.FC<AgentPanelProps> = ({ agents }) => {
  if (agents.length === 0) return null;
  return (
    <Box flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1}>
      <Text bold>Active Agents</Text>
      {agents.map(agent => (
        <Box key={agent.name} gap={1}>
          <Text>{statusIcon(agent.status)}</Text>
          <Text bold>{agent.name}</Text>
          <Text dimColor>({agent.role})</Text>
        </Box>
      ))}
    </Box>
  );
};
