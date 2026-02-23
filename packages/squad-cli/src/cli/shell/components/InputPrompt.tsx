import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

interface InputPromptProps {
  onSubmit: (value: string) => void;
  prompt?: string;
  disabled?: boolean;
}

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export const InputPrompt: React.FC<InputPromptProps> = ({ 
  onSubmit, 
  prompt = '> ',
  disabled = false 
}) => {
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [spinFrame, setSpinFrame] = useState(0);

  // Animate spinner when disabled (processing)
  useEffect(() => {
    if (!disabled) return;
    const timer = setInterval(() => {
      setSpinFrame(f => (f + 1) % SPINNER_FRAMES.length);
    }, 80);
    return () => clearInterval(timer);
  }, [disabled]);

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

  if (disabled) {
    return (
      <Box marginTop={1}>
        <Text color="cyan" bold>◆ squad </Text>
        <Text color="cyan">{SPINNER_FRAMES[spinFrame]}</Text>
        <Text color="cyan" bold>{'> '}</Text>
      </Box>
    );
  }

  return (
    <Box marginTop={1}>
      <Text color="cyan" bold>◆ squad{'> '}</Text>
      <Text>{value}</Text>
      <Text color="cyan">▌</Text>
      {!value && (
        <Text dimColor> Type a message or @agent-name...</Text>
      )}
    </Box>
  );
};
