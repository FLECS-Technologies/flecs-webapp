/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Nov 11 2025
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * OAuth4WebApi Test Setup
 *
 * This file provides global setup for OAuth4WebApiAuthProvider mocking in tests.
 * Import this in your test files or configure Jest to use it globally.
 */

import {
  mockOAuth4WebApiAuth,
  mockScenarios,
} from '@contexts/__mocks__/OAuth4WebApiAuthProvider';

// Mock the OAuth4WebApiAuthProvider module globally
jest.mock('../components/providers/OAuth4WebApiAuthProvider');

// Global setup function to reset mocks between tests
export const setupOAuth4WebApiMocks = () => {
  beforeEach(() => {
    // Reset to default authenticated state before each test
    mockOAuth4WebApiAuth.reset();
    mockScenarios.authenticatedUser();
  });

  afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
  });
};

// Export utilities for direct use in tests
export { mockOAuth4WebApiAuth, mockScenarios };

// Default export for easier importing
export default {
  setupOAuth4WebApiMocks,
  mockOAuth4WebApiAuth,
  mockScenarios,
};
