import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDeviceState } from '@stores/device-state';
import { useOnboardingStatus } from '@features/onboarding';

/**
 * Route-based onboarding redirect.
 * Extracted from the old SystemContextProvider.
 */
export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const deviceState = useDeviceState();
  const { isRequired: onboardingRequired, isLoading } = useOnboardingStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const shouldOnboard =
      deviceState.loaded &&
      !deviceState.onboarded &&
      onboardingRequired &&
      !isLoading &&
      !hasRedirected.current &&
      location.pathname !== '/onboarding';

    if (shouldOnboard) {
      hasRedirected.current = true;
      navigate('/onboarding');
    }
  }, [deviceState.loaded, deviceState.onboarded, onboardingRequired, isLoading, location.pathname, navigate]);

  return <>{children}</>;
}
