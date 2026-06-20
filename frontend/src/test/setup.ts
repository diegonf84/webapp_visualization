import '@testing-library/jest-dom/vitest';

// ResizeObserver polyfill for nivo responsive components in jsdom
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
