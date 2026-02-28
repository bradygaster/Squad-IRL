import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { isNoColor, useTerminalWidth } from '../terminal.js';
import { createCompleter } from '../autocomplete.js';

interface InputPromptProps {
  onSubmit: (value: string) => void;
  prompt?: string;
  disabled?: boolean;
  agentNames?: string[];
  /** Number of messages exchanged so far — drives progressive hint text. */
  messageCount?: number;
}

/** Return context-appropriate placeholder hint based on session progress. */
function getHintText(messageCount: number, narrow: boolean): string {
  if (messageCount < 5) {
    return narrow ? ' @agent or /help' : ' Type @agent or /help';
  }
  if (messageCount < 10) {
    return narrow ? ' Tab · ↑↓ history' : ' Tab completes · ↑↓ history';
  }
  return narrow ? ' /status · /clear · /export' : ' /status · /clear · /export';
}

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export const InputPrompt: React.FC<InputPromptProps> = ({ 
  onSubmit, 
  prompt = '> ',
  disabled = false,
  agentNames = [],
  messageCount = 0,
}) => {
  const noColor = isNoColor();
  const width = useTerminalWidth();
  const narrow = width < 60;
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [spinFrame, setSpinFrame] = useState(0);
  const [bufferDisplay, setBufferDisplay] = useState('');
  const bufferRef = useRef('');
  const wasDisabledRef = useRef(disabled);
  const pendingInputRef = useRef<string[]>([]);

  // When transitioning from disabled → enabled, restore buffered input
  useEffect(() => {
    if (wasDisabledRef.current && !disabled) {
      // Drain pending input queue first (fast typing during transition)
      const pending = pendingInputRef.current.join('');
      pendingInputRef.current = [];
      
      const combined = bufferRef.current + pending;
      if (combined) {
        setValue(combined);
        bufferRef.current = '';
        setBufferDisplay('');
      }
    }
    wasDisabledRef.current = disabled;
  }, [disabled]);

  const completer = useMemo(() => createCompleter(agentNames), [agentNames]);

  // Tab-cycling state
  const tabMatchesRef = useRef<string[]>([]);
  const tabIndexRef = useRef(0);
  const tabPrefixRef = useRef('');

  // Animate spinner when disabled (processing) — static in NO_COLOR mode
  useEffect(() => {
    if (!disabled || noColor) return;
    const timer = setInterval(() => {
      setSpinFrame(f => (f + 1) % SPINNER_FRAMES.length);
    }, 80);
    return () => clearInterval(timer);
  }, [disabled, noColor]);

  useInput((input, key) => {
    if (disabled) {
      // Buffer keystrokes while disabled (ignore control keys)
      if (key.return || key.upArrow || key.downArrow || key.ctrl || key.meta) return;
      if (key.backspace || key.delete) {
        bufferRef.current = bufferRef.current.slice(0, -1);
        setBufferDisplay(bufferRef.current);
        return;
      }
      if (input) {
        // Queue input to catch race during disabled→enabled transition
        pendingInputRef.current.push(input);
        bufferRef.current += input;
        setBufferDisplay(bufferRef.current);
      }
      return;
    }
    
    // Race guard: if we just re-enabled but haven't drained queue yet, queue this too
    if (wasDisabledRef.current && pendingInputRef.current.length > 0) {
      pendingInputRef.current.push(input || '');
      return;
    }
    
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
      setValue(history[newIndex]!);
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
          setValue(history[newIndex]!);
        }
      }
      return;
    }
    
    if (key.tab) {
      if (tabPrefixRef.current !== value) {
        // New prefix — compute matches
        tabPrefixRef.current = value;
        tabIndexRef.current = 0;
        const [matches] = completer(value);
        tabMatchesRef.current = matches;
      } else {
        // Same prefix — cycle to next match
        if (tabMatchesRef.current.length > 0) {
          tabIndexRef.current = (tabIndexRef.current + 1) % tabMatchesRef.current.length;
        }
      }
      if (tabMatchesRef.current.length > 0) {
        setValue(tabMatchesRef.current[tabIndexRef.current]!);
      }
      return;
    }
    // Reset tab state on any other key
    tabMatchesRef.current = [];
    tabPrefixRef.current = '';
    
    if (input && !key.ctrl && !key.meta) {
      setValue(prev => prev + input);
    }
  });

  if (disabled) {
    return (
      <Box marginTop={1}>
        {noColor ? (
          <>
            <Text bold>{narrow ? 'sq ' : '◆ squad '}</Text>
            <Text>[working...]</Text>
            {bufferDisplay ? <Text> {bufferDisplay}</Text> : null}
          </>
        ) : (
          <>
            <Text color="cyan" bold>{narrow ? 'sq ' : '◆ squad '}</Text>
            <Text color="cyan">{SPINNER_FRAMES[spinFrame]}</Text>
            <Text color="cyan" bold>{'> '}</Text>
            {bufferDisplay ? <Text dimColor>{bufferDisplay}</Text> : null}
          </>
        )}
      </Box>
    );
  }

  return (
    <Box marginTop={1}>
      <Text color={noColor ? undefined : 'cyan'} bold>{narrow ? 'sq> ' : '◆ squad> '}</Text>
      <Text>{value}</Text>
      <Text color={noColor ? undefined : 'cyan'} bold>▌</Text>
      {!value && (
        <Text dimColor>{getHintText(messageCount, narrow)}</Text>
      )}
    </Box>
  );
};
