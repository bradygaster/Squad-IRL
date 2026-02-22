import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';

interface InputPromptProps {
  onSubmit: (value: string) => void;
  prompt?: string;
  disabled?: boolean;
}

export const InputPrompt: React.FC<InputPromptProps> = ({ 
  onSubmit, 
  prompt = '> ',
  disabled = false 
}) => {
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useInput((input, key) => {
    if (disabled) return;
    
    if (key.return) {
      if (value.trim()) {
        onSubmit(value.trim());
        setHistory(prev => [...prev, value.trim()]);
        setHistoryIndex(-1);
      }
      setValue('');
      return;
    }
    
    if (key.backspace || key.delete) {
      setValue(prev => prev.slice(0, -1));
      return;
    }
    
    if (key.upArrow && history.length > 0) {
      const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setValue(history[newIndex]);
      return;
    }
    
    if (key.downArrow) {
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setValue('');
        } else {
          setHistoryIndex(newIndex);
          setValue(history[newIndex]);
        }
      }
      return;
    }
    
    if (input && !key.ctrl && !key.meta) {
      setValue(prev => prev + input);
    }
  });

  return (
    <Box>
      <Text color="cyan">{prompt}</Text>
      <Text>{value}</Text>
      {!disabled && <Text color="gray">▌</Text>}
    </Box>
  );
};
