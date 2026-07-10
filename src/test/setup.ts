import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './msw-setup';

// jsdom doesn't implement Blob/File.text() — polyfill via FileReader so code
// reading dropped or selected files works in tests.
Blob.prototype.text ??= function (this: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(this);
  });
};

// jsdom doesn't implement <dialog> methods — stub them so components using
// dialog.showModal()/close() (e.g. ConfirmDialog) don't crash in tests.
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.open = true;
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.open = false;
};

// Node's experimental Web Storage exposes `localStorage`/`sessionStorage` as a getter that
// returns undefined (and warns) unless --localstorage-file is passed, and vitest's jsdom
// doesn't override it. Components that touch storage during render (e.g. ThemeHandler) then
// crash, so provide a simple in-memory Storage. The globals are configurable, so we can
// redefine them.
class MemoryStorage {
  #store = new Map<string, string>();
  get length(): number {
    return this.#store.size;
  }
  clear(): void {
    this.#store.clear();
  }
  getItem(key: string): string | null {
    return this.#store.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.#store.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.#store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.#store.set(key, String(value));
  }
}
for (const name of ['localStorage', 'sessionStorage'] as const) {
  Object.defineProperty(globalThis, name, {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  });
}

// Start MSW server before all tests — generated mocks from OpenAPI specs
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  localStorage.clear();
  sessionStorage.clear();
});
afterAll(() => server.close());
