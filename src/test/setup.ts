import '@testing-library/jest-dom/vitest';

// Radix UI uses Pointer Events API which jsdom does not fully implement.
// Polyfill the missing methods so Radix Select (and other primitives) work in tests.
window.PointerEvent = class PointerEvent extends MouseEvent {
  constructor(type: string, init?: PointerEventInit) {
    super(type, init);
  }
} as typeof PointerEvent;

Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
  value: () => false,
  configurable: true,
});
Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
  value: () => {},
  configurable: true,
});
Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
  value: () => {},
  configurable: true,
});

// Radix Select calls scrollIntoView on items when the dropdown opens; jsdom doesn't implement it.
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: () => {},
  configurable: true,
});
