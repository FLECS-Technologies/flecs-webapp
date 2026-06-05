import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOAuth4WebApiAuth } from '@features/auth/AuthProvider';
import RowSkeleton from '@features/apps/components/RowSkeleton';

export default function OAuthCallback() {
  const { handleOAuthCallback, isConfigReady } = useOAuth4WebApiAuth();
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (!isConfigReady || ran.current) return;
    ran.current = true;
    // On success handleOAuthCallback reloads into the app, which keeps showing its
    // skeleton until data lands — so the whole sign-in reads as one loading state.
    // On failure, drop back to the login screen instead of a dead-end error page.
    handleOAuthCallback().catch((e) => {
      toast.error(e?.message || 'Sign in failed. Please try again.');
      navigate('/', { replace: true });
    });
  }, [isConfigReady, handleOAuthCallback, navigate]);

  // No separate "Completing sign in" screen — render the same skeleton the app
  // lands on, so there is no flicker between auth and the loaded page.
  return <RowSkeleton />;
}
