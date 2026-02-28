import React from 'react';
import { createStore } from '@mono/core';

export function App() {
  const store = createStore();
  return (
    <div>
      <h1>Mono Web</h1>
      <p>Using core store</p>
    </div>
  );
}
