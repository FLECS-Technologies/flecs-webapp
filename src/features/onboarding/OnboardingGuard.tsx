import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProvidersAuth } from '@generated/core/experimental/experimental';
import type { AuthProvidersAndDefaults } from '@generated/core/schemas';

export function extractCoreProviderId(data: AuthProvidersAndDefaults): string | null {
  const ref = data?.core;
  if (typeof ref === 'string' && ref !== 'Default') return ref;
  if (ref && typeof ref === 'object' && 'Provider' in ref) return ref.Provider;
  return null;
}

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);

  const { data: needsOnboarding, isLoading } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: async () => {
      const res = await getProvidersAuth();
      return !extractCoreProviderId(res.data as AuthProvidersAndDefaults);
    },
    retry: 1,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!isLoading && needsOnboarding && !hasRedirected.current && location.pathname !== '/onboarding') {
      hasRedirected.current = true;
      navigate('/onboarding');
    }
  }, [isLoading, needsOnboarding, location.pathname]);

  return <>{children}</>;
}
