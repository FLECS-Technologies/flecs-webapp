import React, { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { OAuth4WebApiAuthProvider, useOAuth4WebApiAuth } from '@features/auth/AuthProvider';
import {
  usePostProvidersAuthFirstTimeSetupFlecsport,
  usePutProvidersAuthCore,
  usePutProvidersAuthDefault,
} from '@generated/core/experimental/experimental';

const Spinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin h-6 w-6 border-2 border-brand border-t-transparent rounded-full" />
  </div>
);

function AppGate({ children }: { children: React.ReactNode }) {
  const {
    isAuthenticated,
    isLoading: authLoading,
    isConfigReady,
    isCoreProviderReady,
    isDefaultProviderReady,
    authProviderId,
    signIn,
  } = useOAuth4WebApiAuth();
  const queryClient = useQueryClient();
  const setupTriggered = useRef(false);
  const coreProviderTriggered = useRef(false);
  const defaultProviderTriggered = useRef(false);
  const signInTriggered = useRef(false);
  const [bootstrapError, setBootstrapError] = useState<Error | null>(null);
  const { mutate: triggerFirstTimeSetup } = usePostProvidersAuthFirstTimeSetupFlecsport({
    mutation: {
      onSuccess: () => {
        setBootstrapError(null);
        queryClient.invalidateQueries({ queryKey: ['auth-config'] });
      },
      onError: (error) => setBootstrapError(error as Error),
    },
  });
  const { mutate: selectCoreProvider } = usePutProvidersAuthCore({
    mutation: {
      onSuccess: () => {
        setBootstrapError(null);
        queryClient.invalidateQueries({ queryKey: ['auth-config'] });
      },
      onError: (error) => setBootstrapError(error as Error),
    },
  });
  const { mutate: selectDefaultProvider } = usePutProvidersAuthDefault({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['auth-config'] });
      },
      onError: (error) => {
        toast.error('Failed to set default auth provider', {
          description: error instanceof Error ? error.message : String(error),
        });
      },
    },
  });

  const isOAuthCallback = window.location.hash.includes('/oauth/callback');

  // Trigger first-time provider setup if flecs-core hasn't registered Fence yet.
  // Refetch polling continues until a provider appears.
  useEffect(() => {
    if (
      isCoreProviderReady ||
      authProviderId ||
      authLoading ||
      setupTriggered.current ||
      isOAuthCallback ||
      bootstrapError
    )
      return;
    setupTriggered.current = true;
    triggerFirstTimeSetup();
  }, [
    isCoreProviderReady,
    authProviderId,
    authLoading,
    isOAuthCallback,
    bootstrapError,
    triggerFirstTimeSetup,
  ]);

  // Core currently imports Fence but may not select it as the core auth provider.
  // Use the generated OpenAPI mutation as a release-safe compatibility bridge.
  useEffect(() => {
    if (
      isCoreProviderReady ||
      !authProviderId ||
      authLoading ||
      coreProviderTriggered.current ||
      isOAuthCallback ||
      bootstrapError
    )
      return;
    coreProviderTriggered.current = true;
    selectCoreProvider({ data: { provider: authProviderId } });
  }, [
    isCoreProviderReady,
    authProviderId,
    authLoading,
    isOAuthCallback,
    bootstrapError,
    selectCoreProvider,
  ]);

  const readyToSignIn = !authLoading && !isAuthenticated && isConfigReady && isCoreProviderReady;

  useEffect(() => {
    if (!readyToSignIn || isOAuthCallback || signInTriggered.current) return;
    signInTriggered.current = true;
    signIn();
  }, [readyToSignIn, isOAuthCallback, signIn]);

  useEffect(() => {
    if (
      !isAuthenticated ||
      !authProviderId ||
      isDefaultProviderReady ||
      defaultProviderTriggered.current ||
      isOAuthCallback
    )
      return;
    defaultProviderTriggered.current = true;
    selectDefaultProvider({ data: { provider_id: authProviderId } });
  }, [
    isAuthenticated,
    authProviderId,
    isDefaultProviderReady,
    isOAuthCallback,
    selectDefaultProvider,
  ]);

  if (isOAuthCallback) return <>{children}</>;
  // Auth state is known synchronously (localStorage) — render the app immediately.
  if (isAuthenticated) return <>{children}</>;
  if (bootstrapError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <div className="max-w-md rounded-lg border border-border bg-surface p-5 shadow-sm">
          <h1 className="text-lg font-semibold text-text-primary">Authentication setup failed</h1>
          <p className="mt-2 text-sm text-muted">
            {bootstrapError.message || 'Core could not configure the auth provider.'}
          </p>
          <button
            className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-end"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  // Covers: provider registration, OAuth redirect startup, or any unknown interim state.
  // Fence owns its login and first-user setup once OAuth starts.
  return <Spinner />;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OAuth4WebApiAuthProvider>
      <AppGate>{children}</AppGate>
    </OAuth4WebApiAuthProvider>
  );
}
