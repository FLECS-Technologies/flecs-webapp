import React, { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { OAuth4WebApiAuthProvider, useOAuth4WebApiAuth } from '@features/auth/AuthProvider';
import { useSuperAdminExists, useCreateSuperAdmin } from '@features/auth/fence-api';
import { postProvidersAuthFirstTimeSetupFlecsport } from '@generated/core/experimental/experimental';

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

function AppGate({ children }: { children: React.ReactNode }) {
  const {
    isAuthenticated,
    isLoading: authLoading,
    isConfigReady,
    signIn,
    fenceBaseURL,
  } = useOAuth4WebApiAuth();
  const queryClient = useQueryClient();
  const bootstrapped = useRef(false);

  const isOAuthCallback = window.location.hash.includes('/oauth/callback');

  // Trigger first-time provider setup if flecs-core hasn't registered Fence yet.
  // Fire-and-forget: refetchInterval in useAuthConfig polls until the provider appears.
  useEffect(() => {
    if (isConfigReady || authLoading || bootstrapped.current || isOAuthCallback) return;
    bootstrapped.current = true;
    postProvidersAuthFirstTimeSetupFlecsport()
      .then(() => queryClient.invalidateQueries({ queryKey: ['auth-config'] }))
      .catch(() => {});
  }, [isConfigReady, authLoading, isOAuthCallback]);

  const { data: adminExists, isLoading: adminLoading } = useSuperAdminExists(
    isConfigReady && !isOAuthCallback ? (fenceBaseURL ?? undefined) : undefined,
  );

  const loading = authLoading || (isConfigReady && adminLoading);
  const needsFirstBoot = !loading && isConfigReady && adminExists === false;
  const readyToSignIn = !loading && !isAuthenticated && isConfigReady && adminExists === true;

  useEffect(() => {
    if (readyToSignIn && !isOAuthCallback) signIn();
  }, [readyToSignIn, isOAuthCallback]);

  if (isOAuthCallback) return <>{children}</>;
  if (loading || readyToSignIn) return <Spinner />;
  if (needsFirstBoot) return <CreateAccountForm baseURL={fenceBaseURL!} onCreated={signIn} />;
  // Covers: provider still registering, admin probe errored, or any unknown interim state
  if (!isAuthenticated) return <Spinner />;

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OAuth4WebApiAuthProvider>
      <AppGate>{children}</AppGate>
    </OAuth4WebApiAuthProvider>
  );
}
