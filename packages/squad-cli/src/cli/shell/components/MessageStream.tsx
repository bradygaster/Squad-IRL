import React from 'react';
import { Box, Text } from 'ink';
import type { ShellMessage } from '../types.js';

interface MessageStreamProps {
  messages: ShellMessage[];
  streamingContent?: { agentName: string; content: string } | null;
  maxVisible?: number;
}

export const MessageStream: React.FC<MessageStreamProps> = ({ 
  messages, 
  streamingContent, 
  maxVisible = 50 
}) => {
  const visible = messages.slice(-maxVisible);
  return (
    <Box flexDirection="column" flexGrow={1}>
      {visible.map((msg, i) => (
        <Box key={i} gap={1}>
          <Text color={msg.role === 'user' ? 'blue' : msg.role === 'system' ? 'yellow' : 'green'}>
            {msg.agentName ?? msg.role}:
          </Text>
          <Text wrap="wrap">{msg.content}</Text>
        </Box>
      ))}
      {streamingContent && (
        <Box gap={1}>
          <Text color="green">{streamingContent.agentName}:</Text>
          <Text wrap="wrap">{streamingContent.content}</Text>
          <Text color="gray">▌</Text>
        </Box>
      )}
    </Box>
  );
};
