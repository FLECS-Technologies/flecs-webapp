import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
  OAuth4WebApiAuthProvider,
  useOAuth4WebApiAuth,
  extractCoreProviderId,
} from '@features/auth/AuthProvider';
import { useSuperAdminExists, useCreateSuperAdmin } from '@features/auth/fence-api';
import {
  getProvidersAuth,
  putProvidersAuthCore,
  postProvidersAuthFirstTimeSetupFlecsport,
} from '@generated/core/experimental/experimental';
import { unwrapSuccess } from '@app/api/unwrap';
import { useQuestActions } from '@features/notifications/quests/hooks';
import { questStateFinishedOk } from '@features/notifications/quests/QuestItem';

const FormSchema = z.object({
  name: z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required'),
});

function CreateAccountForm({ baseURL, onCreated }: { baseURL: string; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; password?: string }>({});
  const { mutateAsync, isPending, error } = useCreateSuperAdmin(baseURL);

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
    await mutateAsync({ name, full_name: name, password });
    onCreated();
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <div>
          <h4 className="text-xl font-semibold">Create your account</h4>
          <p className="text-sm text-muted mt-1">Set up your administrator account to continue.</p>
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Username</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            disabled={isPending}
            className="w-full px-3 py-2 bg-dark rounded-lg border border-white/10 text-white focus:outline-none focus:border-brand"
          />
          {fieldErrors.name && <p className="text-xs text-error mt-1">{fieldErrors.name}</p>}
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2 bg-dark rounded-lg border border-white/10 text-white focus:outline-none focus:border-brand"
          />
          {fieldErrors.password && (
            <p className="text-xs text-error mt-1">{fieldErrors.password}</p>
          )}
        </div>
        {error && (
          <p className="text-sm text-error">
            {error instanceof Error ? error.message : 'Failed to create account'}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-end transition disabled:opacity-50"
        >
          {isPending ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  );
}

const Spinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin h-6 w-6 border-2 border-brand border-t-transparent rounded-full" />
  </div>
);

const OnboardingError = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="w-full max-w-sm flex flex-col gap-4 text-center">
      <h4 className="text-xl font-semibold">Setup could not be completed</h4>
      <p className="px-4 py-3 rounded-lg bg-error/10 text-error text-sm">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-end transition"
      >
        Retry
      </button>
    </div>
  </div>
);

function AppGate({ children }: { children: React.ReactNode }) {
  const {
    isAuthenticated,
    isLoading: authLoading,
    isConfigReady,
    signIn,
    fenceBaseURL,
  } = useOAuth4WebApiAuth();
  const queryClient = useQueryClient();
  const { fetchQuest, waitForQuest } = useQuestActions();
  const bootstrapped = useRef(false);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);

  const isOAuthCallback = window.location.hash.includes('/oauth/callback');

  // Drive (or resume) first-boot onboarding to completion. flecs-core may be in
  // any partial state: no provider registered yet, or a provider registered but
  // not yet promoted to `core`. The app cannot authenticate until `core` is set,
  // so we pick up wherever setup left off and finish it — never give up silently.
  const ensureCoreProvider = useCallback(async () => {
    const data = unwrapSuccess(await getProvidersAuth());
    if (!data) throw new Error('Could not read auth providers from flecs-core');
    if (extractCoreProviderId(data)) return; // core already configured

    let providerIds = Object.keys(data.providers ?? {});
    if (providerIds.length === 0) {
      // Nothing registered yet — create the built-in Fence provider and wait for
      // the import job to finish before continuing.
      const accepted = unwrapSuccess(await postProvidersAuthFirstTimeSetupFlecsport());
      if (!accepted) throw new Error('flecs-core did not accept first-time setup');
      await fetchQuest(accepted.jobId);
      const quest = await waitForQuest(accepted.jobId);
      if (!questStateFinishedOk(quest.state)) throw new Error('Auth provider import failed');

      const after = unwrapSuccess(await getProvidersAuth());
      if (after && extractCoreProviderId(after)) return; // setup also set core
      providerIds = Object.keys(after?.providers ?? {});
      if (providerIds.length === 0) throw new Error('No auth provider found after setup');
    }
    // Promote the registered provider to `core` — the step the flow was missing.
    await putProvidersAuthCore({ provider: providerIds[0] });
  }, [fetchQuest, waitForQuest]);

  const runOnboarding = useCallback(() => {
    setOnboardingError(null);
    bootstrapped.current = true;
    ensureCoreProvider()
      .then(() => queryClient.invalidateQueries({ queryKey: ['auth-config'] }))
      .catch((err: unknown) => {
        bootstrapped.current = false; // allow retry
        setOnboardingError(err instanceof Error ? err.message : String(err));
      });
  }, [ensureCoreProvider, queryClient]);

  useEffect(() => {
    if (isAuthenticated || isConfigReady || authLoading || bootstrapped.current || isOAuthCallback)
      return;
    runOnboarding();
  }, [isAuthenticated, isConfigReady, authLoading, isOAuthCallback, runOnboarding]);

  const { data: adminExists, isLoading: adminLoading } = useSuperAdminExists(
    !isAuthenticated && isConfigReady && !isOAuthCallback ? (fenceBaseURL ?? undefined) : undefined,
  );

  const loading = authLoading || (isConfigReady && adminLoading);
  const needsFirstBoot = !loading && isConfigReady && adminExists === false;
  const readyToSignIn = !loading && !isAuthenticated && isConfigReady && adminExists === true;

  useEffect(() => {
    if (readyToSignIn && !isOAuthCallback) signIn();
  }, [readyToSignIn, isOAuthCallback]);

  if (isOAuthCallback) return <>{children}</>;
  // Auth state is known synchronously (localStorage) — render the app immediately.
  // The loading/admin checks are only needed to gate unauthenticated sign-in.
  if (isAuthenticated) return <>{children}</>;
  if (onboardingError) return <OnboardingError message={onboardingError} onRetry={runOnboarding} />;
  if (loading || readyToSignIn) return <Spinner />;
  if (needsFirstBoot) return <CreateAccountForm baseURL={fenceBaseURL!} onCreated={signIn} />;
  // Onboarding still in flight (creating/promoting provider) or any interim state
  return <Spinner />;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OAuth4WebApiAuthProvider>
      <AppGate>{children}</AppGate>
    </OAuth4WebApiAuthProvider>
  );
}
