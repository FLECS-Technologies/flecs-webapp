import React from 'react';
import { useLocation } from 'react-router-dom';
import { OAuth4WebApiAuthProvider, useOAuth4WebApiAuth } from '@features/auth/AuthProvider';
import OnboardingGuard from '@features/onboarding/OnboardingGuard';
import DeviceLogin from '@pages/DeviceLogin';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useOAuth4WebApiAuth();
  const location = useLocation();
  // Onboarding configures the first auth provider, so it must stay reachable
  // before any login is possible. Gating it behind auth leaves no way out of
  // the unauthenticated state. Allow it through, like the OAuth callback below.
  if (location.pathname === '/onboarding') return <>{children}</>;
  if (window.location.hash.includes('/oauth/callback')) return <>{children}</>;
  // Auth state is known synchronously (localStorage) — render the app immediately.
  // isLoading only tracks the auth-config fetch, which signIn needs but the app doesn't;
  // gating on it flashed a spinner on every reload and after the OAuth redirect.
  if (isAuthenticated) return <>{children}</>;
  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-6 w-6 border-2 border-brand border-t-transparent rounded-full" />
      </div>
    );
  return <DeviceLogin />;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OAuth4WebApiAuthProvider>
      <OnboardingGuard>
        <AuthGate>{children}</AuthGate>
      </OnboardingGuard>
    </OAuth4WebApiAuthProvider>
  );
}
