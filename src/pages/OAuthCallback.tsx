import { useEffect, useRef, useState } from 'react';
import { useOAuth4WebApiAuth } from '@features/auth/AuthProvider';

export default function OAuthCallback() {
  const { handleOAuthCallback, isConfigReady } = useOAuth4WebApiAuth();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (!isConfigReady || ran.current) return;
    ran.current = true;
    handleOAuthCallback().catch((e) => setError(e?.message || 'Auth failed'));
  }, [isConfigReady, handleOAuthCallback]);

  if (error) return (
    <div className="flex justify-center items-center min-h-screen text-center">
      <div>
        <p className="text-error font-semibold">Authentication Failed</p>
        <p className="mt-2 text-sm text-muted">{error}</p>
        <a href="/" className="mt-4 inline-block text-brand text-sm hover:underline">Return home</a>
      </div>
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-screen text-center">
      <div>
        <div className="animate-spin h-6 w-6 border-2 border-brand border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}
