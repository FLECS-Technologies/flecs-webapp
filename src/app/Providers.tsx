import React, { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  OAuth4WebApiAuthProvider,
  useOAuth4WebApiAuth,
  getOAuthCallbackParameters,
} from '@features/auth/AuthProvider';
import { useCreateSuperAdmin, useSuperAdminExists } from '@features/auth/fence-api';
import {
  usePostProvidersAuthFirstTimeSetupFlecsport,
  usePutProvidersAuthCore,
  usePutProvidersAuthDefault,
} from '@generated/core/experimental/experimental';
import { BootScreen, type BootStep } from '@app/components/BootScreen';

const FormSchema = z.object({
  name: z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required'),
});

function ErrorScreen({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md rounded-lg border border-border bg-surface p-5 shadow-sm">
        <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <button
          className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-end"
          onClick={onRetry}
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function CreateAccountForm({ baseURL, onCreated }: { baseURL: string; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; password?: string }>({});
  const { mutateAsync, isPending, error } = useCreateSuperAdmin(baseURL);

  // Live match state drives the confirm field's colour and the submit button.
  const confirmTouched = confirmPassword.length > 0;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = FormSchema.safeParse({ name, password });
    if (!result.success) {
      const errs: { name?: string; password?: string } = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof typeof errs;
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    try {
      await mutateAsync({ name, full_name: name, password });
      onCreated();
    } catch {
      // Error state is exposed by the mutation and rendered below.
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-border bg-surface p-5 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Create your account</h1>
          <p className="mt-1 text-sm text-muted">
            Set up the first administrator account to continue.
          </p>
        </div>
        <div className="mt-5">
          <label className="mb-1 block text-sm text-muted">Username</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            disabled={isPending}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary outline-none transition focus:border-brand disabled:opacity-50"
          />
          {fieldErrors.name && <p className="mt-1 text-xs text-error">{fieldErrors.name}</p>}
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm text-muted">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary outline-none transition focus:border-brand disabled:opacity-50"
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-error">{fieldErrors.password}</p>
          )}
        </div>
        <div className="relative mt-4">
          <label className="mb-1 block text-sm text-muted">Confirm password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isPending}
            aria-invalid={confirmTouched && !passwordsMatch}
            aria-describedby={
              confirmTouched && !passwordsMatch ? 'confirm-password-error' : undefined
            }
            className={`w-full rounded-md border bg-background px-3 py-2 text-text-primary outline-none transition disabled:opacity-50 ${
              !confirmTouched
                ? 'border-border focus:border-brand'
                : passwordsMatch
                  ? 'border-success focus:border-success'
                  : 'border-error focus:border-error'
            }`}
          />
          {confirmTouched && !passwordsMatch && (
            <div
              id="confirm-password-error"
              role="alert"
              className="absolute left-3 top-full z-20 mt-1.5 whitespace-nowrap rounded-md border border-error bg-surface-raised px-2.5 py-1 text-xs font-medium text-error shadow-md"
            >
              <span
                aria-hidden="true"
                className="absolute -top-1 left-3 h-2 w-2 rotate-45 border-l border-t border-error bg-surface-raised"
              />
              Passwords don&apos;t match
            </div>
          )}
        </div>
        {error && (
          <p className="mt-4 text-sm text-error">
            {error instanceof Error ? error.message : 'Failed to create account'}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending || !passwordsMatch}
          className="mt-5 w-full rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-end disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  );
}

function AppGate({ children }: { children: React.ReactNode }) {
  const {
    isAuthenticated,
    isLoading: authLoading,
    isConfigReady,
    isCoreProviderReady,
    isDefaultProviderReady,
    authProviderId,
    fenceBaseURL,
    signIn,
    handleOAuthCallback,
  } = useOAuth4WebApiAuth();
  const queryClient = useQueryClient();
  const setupTriggered = useRef(false);
  const coreProviderTriggered = useRef(false);
  const defaultProviderTriggered = useRef(false);
  const signInTriggered = useRef(false);
  const oauthCallbackTriggered = useRef(false);
  const [bootstrapError, setBootstrapError] = useState<Error | null>(null);
  const [signInError, setSignInError] = useState<Error | null>(null);
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

  // A sign-in can come back two ways:
  //  - to the dedicated #/oauth/callback hash route (handled by the OAuthCallback page), or
  //  - to the app root with ?code= in the query, because OAuth forbids a fragment in
  //    redirect_uri, so the provider drops #/oauth/callback and the SPA lands on #/.
  // Detect both so the code is always exchanged and the bootstrap/sign-in effects below
  // stay suppressed until it is (otherwise they would re-trigger sign-in and loop).
  const onOAuthCallbackRoute = window.location.hash.includes('/oauth/callback');
  const oauthResponse = getOAuthCallbackParameters();
  const hasPendingOAuthResponse = oauthResponse.has('code') || oauthResponse.has('error');
  const isOAuthCallback = onOAuthCallbackRoute || hasPendingOAuthResponse;
  const {
    data: adminExists,
    isLoading: adminLoading,
    error: adminError,
    refetch: refetchAdminExists,
  } = useSuperAdminExists(
    !isAuthenticated && isConfigReady && isCoreProviderReady && !isOAuthCallback
      ? (fenceBaseURL ?? undefined)
      : undefined,
  );

  // Exchange an authorization code that came back to the app root. The dedicated
  // #/oauth/callback route is handled by the OAuthCallback page instead, so skip it here.
  useEffect(() => {
    if (onOAuthCallbackRoute || !hasPendingOAuthResponse || !isConfigReady) return;
    if (oauthCallbackTriggered.current) return;
    oauthCallbackTriggered.current = true;
    handleOAuthCallback().catch((error) => {
      // Drop the spent code from the URL so a refresh can't replay it, then surface the
      // failure instead of looping back into another sign-in attempt.
      window.history.replaceState({}, '', window.location.origin + window.location.pathname);
      setSignInError(error instanceof Error ? error : new Error('Sign in failed'));
    });
  }, [onOAuthCallbackRoute, hasPendingOAuthResponse, isConfigReady, handleOAuthCallback]);

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

  const step1Done = authProviderId !== null;
  const step2Done = isCoreProviderReady;
  const step3Done = adminExists !== undefined;

  const bootSteps: BootStep[] = [
    {
      label: 'Connecting to core',
      sublabel: 'getProvidersAuth',
      status: step1Done ? 'done' : 'active',
    },
    {
      label: 'Registering auth provider',
      sublabel: 'triggerFirstTimeSetup / selectCoreProvider',
      status: step2Done ? 'done' : step1Done ? 'active' : 'pending',
    },
    {
      label: 'Checking account status',
      sublabel: 'GET /users/super-admin',
      status: step3Done ? 'done' : step2Done ? 'active' : 'pending',
    },
  ];

  const adminReady = !isConfigReady || !isCoreProviderReady || adminExists !== undefined;
  const readyToSignIn =
    !authLoading &&
    !adminLoading &&
    !isAuthenticated &&
    isConfigReady &&
    isCoreProviderReady &&
    adminExists === true;
  const needsFirstBoot =
    !authLoading &&
    !adminLoading &&
    !isAuthenticated &&
    isConfigReady &&
    isCoreProviderReady &&
    adminExists === false &&
    !!fenceBaseURL;

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

  // Dedicated callback route: the OAuthCallback page owns the exchange.
  if (onOAuthCallbackRoute) return <>{children}</>;
  if (signInError) {
    return (
      <ErrorScreen
        title="Sign in failed"
        message={signInError.message || 'The sign-in could not be completed.'}
        onRetry={() => window.location.reload()}
      />
    );
  }
  // Code came back to the app root — hold on the boot screen while it is exchanged.
  if (hasPendingOAuthResponse) return <BootScreen steps={bootSteps} />;
  // Auth state is known synchronously (localStorage) — render the app immediately.
  if (isAuthenticated) return <>{children}</>;
  if (bootstrapError) {
    return (
      <ErrorScreen
        title="Authentication setup failed"
        message={bootstrapError.message || 'Core could not configure the auth provider.'}
        onRetry={() => window.location.reload()}
      />
    );
  }
  if (adminError) {
    return (
      <ErrorScreen
        title="Account setup check failed"
        message={adminError instanceof Error ? adminError.message : 'Fence could not be reached.'}
        onRetry={() => refetchAdminExists()}
      />
    );
  }
  if (needsFirstBoot) {
    return (
      <CreateAccountForm
        baseURL={fenceBaseURL}
        onCreated={() => {
          if (signInTriggered.current) return;
          signInTriggered.current = true;
          signIn();
        }}
      />
    );
  }
  if (!adminReady || readyToSignIn) return <BootScreen steps={bootSteps} />;
  // Covers: provider registration, OAuth redirect startup, or any unknown interim state.
  // Fence owns its login and first-user setup once OAuth starts.
  return <BootScreen steps={bootSteps} />;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OAuth4WebApiAuthProvider>
      <AppGate>{children}</AppGate>
    </OAuth4WebApiAuthProvider>
  );
}
