#!/usr/bin/env node

import { createStore } from '@mono/core';

const store = createStore();
const version = '1.0.0';

console.log(`mono cli v${version}`);
console.log('Commands: help, status, init');

if (process.argv[2] === '--version') {
  console.log(version);
}
