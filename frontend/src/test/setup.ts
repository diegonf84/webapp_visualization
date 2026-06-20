import '@testing-library/jest-dom/vitest';

// ResizeObserver polyfill for nivo responsive components in jsdom.
// Must fire the callback synchronously so ResponsiveWrapper sets non-zero dimensions.
globalThis.ResizeObserver = class ResizeObserver {
  private callback: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.callback = cb;
  }
  observe(target: Element) {
    const entry = {
      target,
      contentRect: { width: 800, height: 600 } as DOMRectReadOnly,
      borderBoxSize: [],
      contentBoxSize: [],
      devicePixelContentBoxSize: [],
    } as ResizeObserverEntry;
    // Use setTimeout(0) to defer to next event loop tick (allows React to mount)
    setTimeout(() => this.callback([entry], this), 0);
  }
  unobserve() {}
  disconnect() {}
};
