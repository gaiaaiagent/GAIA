// Minimal, robust browser shims for Node globals that some deps expect
import { Buffer } from 'buffer';

// Ensure globalThis is used as the single global
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g: any =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof window !== 'undefined'
      ? window
      : // @ts-ignore
        typeof global !== 'undefined'
        ? global
        : {};

// Ensure Buffer is available globally with all methods
if (!g.Buffer) {
  g.Buffer = Buffer;
}

// Make sure window.Buffer is also available (for crypto-browserify)
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

if (!g.global) {
  g.global = g;
}

if (!g.process) {
  g.process = {
    env: {},
    browser: true,
    version: 'v18.0.0', // Provide a valid version string
    versions: {
      node: '18.0.0',
      v8: '8.0.0'
    },
    nextTick: (cb: (...args: any[]) => void) =>
      Promise.resolve()
        .then(cb)
        .catch(() => setTimeout(cb, 0)),
  };
}

// Ensure crypto global for crypto-browserify
if (typeof window !== 'undefined') {
  try {
    if (!window.crypto && typeof crypto !== 'undefined') {
      window.crypto = crypto;
    }
  } catch (e) {
    // Ignore crypto setup errors
  }
}

export {};
