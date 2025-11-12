/**
 * Centralized mock for onboarding helpers
 * This provides a consistent way to mock onboarding helper functions
 * Using Vitest mocking functions
 */
import { vi } from 'vitest';

// Export mock functions directly to match the original module structure
export const checkAuthProviderConfigured = vi.fn();
export const checkAuthProviderCoreConfigured = vi.fn();
export const checkSuperAdminExists = vi.fn();

// Helper to reset all onboarding helper mocks
export const resetOnboardingHelperMocks = () => {
  checkAuthProviderConfigured.mockReset();
  checkAuthProviderCoreConfigured.mockReset();
  checkSuperAdminExists.mockReset();
};

// Helper to setup auth provider configured scenario
export const setupAuthProviderConfigured = (isConfigured = true) => {
  checkAuthProviderConfigured.mockResolvedValue(isConfigured);
  checkAuthProviderCoreConfigured.mockResolvedValue(isConfigured);
};

// Helper to setup super admin exists scenario
export const setupSuperAdminExistsHelper = (exists = true) => {
  checkSuperAdminExists.mockResolvedValue(exists);
};

// Helper to setup auth provider configuration check
export const setupAuthProviderCoreConfigured = (isConfigured = true) => {
  checkAuthProviderCoreConfigured.mockResolvedValue(isConfigured);
};

// Default mock implementations
checkAuthProviderConfigured.mockResolvedValue(false);
checkAuthProviderCoreConfigured.mockResolvedValue(false);
checkSuperAdminExists.mockResolvedValue(false);
