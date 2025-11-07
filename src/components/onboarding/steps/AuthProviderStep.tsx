/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Thu Oct 31 2025
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

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Container,
} from '@mui/material';
import { WizardStep, WizardStepProps } from '../../steppers';
import { usePublicApi } from '../../providers/ApiProvider';
import { AuthProvidersAndDefaults, AuthProvider } from '@flecs/core-client-ts';
import {
  checkAuthProviderConfigured,
  checkAuthProviderCoreConfigured,
} from '../utils/onboardingHelpers';

// Constants
const POLLING_CONFIG = {
  MAX_ATTEMPTS: 360,
  INTERVAL_MS: 1000,
} as const;

// Types
type SetupMode = 'loading' | 'select' | 'first-time' | 'polling' | 'completed';

const AuthProviderStepComponent: React.FC<WizardStepProps> = ({
  onNext,
  onPrevious,
  onComplete,
  isLoading: parentLoading,
  error: parentError,
}) => {
  // State
  const [authProviders, setAuthProviders] = useState<AuthProvidersAndDefaults | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [setupMode, setSetupMode] = useState<SetupMode>('loading');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const executedRef = React.useRef(false);

  const api = usePublicApi();

  // Helper functions
  const resetError = () => setError(null);

  const getProviderIds = (providersData: AuthProvidersAndDefaults | null): string[] => {
    return providersData?.providers ? Object.keys(providersData.providers) : [];
  };

  const completeStepAndProceed = async () => {
    await onComplete();
    onNext();
  };

  /**
   * Checks if an authentication provider is already configured
   * @returns Promise<boolean> - true if already configured, false otherwise
   */
  const checkExistingConfiguration = async (): Promise<boolean> => {
    const isConfigured = await checkAuthProviderCoreConfigured(api);
    if (isConfigured) {
      setSetupMode('completed');
      await completeStepAndProceed();
      return true;
    }
    return false;
  };

  /**
   * Handles the scenario when providers are available
   * @param providerIds - Array of available provider IDs
   */
  const handleAvailableProviders = async (providerIds: string[]) => {
    if (providerIds.length === 1) {
      // Single provider - auto-select and proceed
      setSelectedProvider(providerIds[0]);
      setSetupMode('select');
      await handleProviderSelection();
    } else {
      // Multiple providers - pre-select first one and show UI
      setSelectedProvider(providerIds[0]);
      setSetupMode('select');
    }
  };

  /**
   * Initiates first-time setup when no providers are available
   */
  const performFirstTimeSetup = async () => {
    setSetupMode('first-time');
    await api.providers.postProvidersAuthFirstTimeSetupFlecsport();
    setSetupMode('polling');
    await pollForProviders();
  };

  /**
   * Polls for available providers after first-time setup
   * @throws Error when polling times out
   */
  const pollForProviders = async () => {
    let attempts = 0;

    while (attempts < POLLING_CONFIG.MAX_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, POLLING_CONFIG.INTERVAL_MS));

      try {
        const response = await api.providers.getProvidersAuth();
        const providersData = response.data;

        // Check if already configured during polling
        if (providersData?.core) {
          setAuthProviders(providersData);
          setSetupMode('completed');
          await completeStepAndProceed();
          return;
        }

        // Check if providers became available
        const providerIds = getProviderIds(providersData);
        if (providerIds.length > 0) {
          setAuthProviders(providersData);
          setSelectedProvider(providerIds[0]);

          // Auto-configure first provider
          await api.providers.putProvidersAuthCore({ provider: providerIds[0] });
          setSetupMode('completed');
          await completeStepAndProceed();
          return;
        }
      } catch {
        // Continue polling on error
      }

      attempts++;
    }

    throw new Error(
      'Timeout waiting for authentication providers to become available after first-time setup',
    );
  };

  // Main initialization logic
  const initializeStep = async () => {
    if (initialized) return;

    try {
      setInitialized(true);
      setIsLoading(true);
      resetError();

      // Check if already configured
      if (await checkExistingConfiguration()) return;

      // Check available providers
      const providersResponse = await api.providers.getProvidersAuth();
      const authProvidersData = providersResponse.data;
      setAuthProviders(authProvidersData);

      const providerIds = getProviderIds(authProvidersData);

      if (providerIds.length > 0) {
        await handleAvailableProviders(providerIds);
      } else {
        await performFirstTimeSetup();
      }
    } catch (err: any) {
      setInitialized(false);
      setError(err.message || 'Failed to check authentication provider status');
    } finally {
      setIsLoading(false);
    }
  };

  // Event handlers
  const handleProviderSelection = async () => {
    if (!selectedProvider) {
      setError('Please select a provider');
      return;
    }

    try {
      setIsLoading(true);
      resetError();

      await api.providers.putProvidersAuthCore({ provider: selectedProvider });
      setSetupMode('completed');
      await completeStepAndProceed();
    } catch (err: any) {
      setError(err.message || 'Failed to setup authentication provider');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    resetError();
    setSetupMode('loading');
    setInitialized(false);
    initializeStep();
  };

  // Initialize on mount
  useEffect(() => {
    if (executedRef.current) {
      return;
    }
    if (!initialized) initializeStep();
    executedRef.current = true;
  }, []);

  // UI Render functions
  const renderErrorState = () => (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Authentication Provider Setup Error
      </Typography>
      <Alert severity="error" sx={{ mb: 3 }}>
        {error || parentError}
      </Alert>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button onClick={onPrevious}>Previous</Button>
        <Button variant="contained" onClick={handleRetry}>
          Retry
        </Button>
      </Box>
    </Box>
  );

  const renderLoadingState = () => (
    <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center', py: 4 }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Checking authentication provider status...</Typography>
    </Box>
  );

  const renderCompletedState = () => (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Authentication Provider
      </Typography>
      <Alert severity="success" sx={{ mb: 3 }}>
        Authentication provider is already configured and active.
      </Alert>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button onClick={onPrevious}>Previous</Button>
        <Button variant="contained" onClick={onNext}>
          Continue
        </Button>
      </Box>
    </Box>
  );

  const getSelectionAlertMessage = () => {
    const providerCount = authProviders?.providers
      ? Object.keys(authProviders.providers).length
      : 0;
    return providerCount > 1
      ? 'Multiple authentication providers are available. The first one is pre-selected - you can change it if needed.'
      : 'Authentication provider found. Please confirm to proceed.';
  };

  const renderProviderSelection = () => (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        {getSelectionAlertMessage()}
      </Alert>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Authentication Provider</InputLabel>
        <Select
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value as string)}
          label="Select Authentication Provider"
        >
          {authProviders?.providers &&
            Object.entries(authProviders.providers).map(([providerId, provider]) => (
              <MenuItem key={providerId} value={providerId}>
                {(provider as AuthProvider).name || providerId}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button onClick={onPrevious} disabled={isLoading || parentLoading}>
          Previous
        </Button>
        <Button
          variant="contained"
          onClick={handleProviderSelection}
          disabled={isLoading || parentLoading || !selectedProvider}
        >
          {isLoading || parentLoading ? 'Setting up...' : 'Setup Provider'}
        </Button>
      </Box>
    </>
  );

  const renderFirstTimeSetup = () => (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        No authentication providers found. Automatically setting up the built-in FLECS
        authentication system...
      </Alert>
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <CircularProgress />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        Please wait while we configure your authentication system.
      </Typography>
    </>
  );

  const renderPollingState = () => (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        Authentication system setup complete. Waiting for providers to become available...
      </Alert>
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <CircularProgress />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        This should only take a few seconds.
      </Typography>
    </>
  );

  // Main render logic
  if (error || parentError) return renderErrorState();
  if (setupMode === 'loading') return renderLoadingState();
  if (setupMode === 'completed') return renderCompletedState();

  const renderMainContent = () => {
    switch (setupMode) {
      case 'select':
        return renderProviderSelection();
      case 'first-time':
        return renderFirstTimeSetup();
      case 'polling':
        return renderPollingState();
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Setup Authentication Provider
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure the default authentication provider for your FLECS device.
      </Typography>
      {renderMainContent()}
    </Container>
  );
};

export class AuthProviderStep extends WizardStep {
  readonly id = 'auth-provider';
  readonly title = 'Setup Authentication Provider';
  readonly description = 'Configure the default authentication provider for your device';
  readonly component = AuthProviderStepComponent;

  async isCompleted(apiContext?: any): Promise<boolean> {
    if (!apiContext?.public) return false;

    return await checkAuthProviderConfigured(apiContext.public);
  }

  canSkip(): boolean {
    return false;
  }

  getDependencies(): string[] {
    return [];
  }
}
