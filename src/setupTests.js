import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { mockCoreClientTs } from './__mocks__/core-client-ts';

const localStorageMock = (function () {
  let store = {};

  return {
    getItem: function (key) {
      return store[key] || null;
    },
    setItem: function (key, value) {
      store[key] = value.toString();
    },
    clear: function () {
      store = {};
    },
    removeItem: function (key) {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock the entire @flecs/core-client-ts module
vi.mock('@flecs/core-client-ts', () => mockCoreClientTs());

// Global test utilities for Vitest
global.createMockApi = require('./__mocks__/core-client-ts').createMockApi;
global.resetAllApiMocks = require('./__mocks__/core-client-ts').resetAllApiMocks;
global.setupQuestFailure = require('./__mocks__/core-client-ts').setupQuestFailure;
