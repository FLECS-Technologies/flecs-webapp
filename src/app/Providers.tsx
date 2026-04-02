import React from 'react';
import { OAuth4WebApiAuthProvider, useOAuth4WebApiAuth } from '@features/auth/AuthProvider';
import OnboardingGuard from '@features/onboarding/OnboardingGuard';
import DeviceLogin from '@pages/DeviceLogin';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useOAuth4WebApiAuth();
  if (window.location.hash.includes('/oauth/callback')) return <>{children}</>;
  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin h-6 w-6 border-2 border-brand border-t-transparent rounded-full" />
    </div>
  );
  if (!isAuthenticated) return <DeviceLogin />;
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OAuth4WebApiAuthProvider>
      <OnboardingGuard>
        <AuthGate>
          {children}
        </AuthGate>
      </OnboardingGuard>
    </OAuth4WebApiAuthProvider>
  );
}
