import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postApiV2AuthLogin } from '@generated/console/default/default';
import { putConsoleAuthentication } from '@generated/core/console/console';
import { postDeviceLicenseActivation, getGetDeviceLicenseActivationStatusQueryKey } from '@generated/core/device/device';
import { useMarketplaceUser } from '@stores/marketplace-user';
import { unwrapSuccess } from '@app/api/unwrap';
import { getErrorMessage } from '@app/api/fetch-error';
import type { AuthResponseData } from '@generated/core/schemas';

/**
 * Marketplace login + device activation — single atomic mutation.
 * Steps: 1) Login to console → 2) Store JWT on device → 3) Activate license
 * If any step fails, the whole flow fails. No race conditions.
 */
function useMarketplaceLoginAndActivate() {
  const qc = useQueryClient();
  const { setUser } = useMarketplaceUser();

  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      // Step 1: Login to marketplace
      const loginRes = await postApiV2AuthLogin(credentials);
      const raw = unwrapSuccess(loginRes);

      // Server error (500, 401, etc.)
      if (raw?.statusCode && raw.statusCode >= 400) {
        throw new Error(raw.statusText || `Marketplace error (${raw.statusCode})`);
      }

      const loginData = raw?.data;

      if (!loginData?.jwt?.token) {
        throw new Error('Marketplace login failed — no JWT received');
      }

      // Step 2: Store auth on device (so flecsd can talk to marketplace)
      const authPayload: AuthResponseData = {
        user: {
          ID: loginData.user?.ID ?? 0,
          display_name: loginData.user?.display_name ?? '',
          user_email: loginData.user?.user_email ?? '',
          user_login: loginData.user?.user_login ?? '',
        },
        jwt: {
          token: loginData.jwt.token,
          token_expires: loginData.jwt.token_expires ?? 0,
        },
        feature_flags: {
          isVendor: loginData.feature_flags?.isVendor ?? false,
          isWhitelabeled: loginData.feature_flags?.isWhitelabeled ?? false,
        },
      };

      await putConsoleAuthentication(authPayload);

      // Step 3: Activate license (device now has JWT stored)
      await postDeviceLicenseActivation();

      return loginData;
    },
    onSuccess: (loginData) => {
      setUser(loginData);
      qc.invalidateQueries({ queryKey: getGetDeviceLicenseActivationStatusQueryKey() });
    },
  });
}

const MarketplaceLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { mutateAsync: loginAndActivate, isPending, error } = useMarketplaceLoginAndActivate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginAndActivate({ username, password }).catch(() => {});
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto mt-8">
      <div className="mb-4"><label className="block text-sm text-muted mb-1">Username</label><input value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-3 py-2 bg-dark rounded-lg border border-white/10 text-white placeholder-muted focus:outline-none focus:border-brand" /></div>
      <div className="mb-4"><label className="block text-sm text-muted mb-1">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 bg-dark rounded-lg border border-white/10 text-white placeholder-muted focus:outline-none focus:border-brand" /></div>
      {error && <p className="text-error mb-4 text-sm">{getErrorMessage(error)}</p>}
      <button type="submit" disabled={isPending} className="w-full px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-end transition disabled:opacity-50">{isPending ? 'Activating...' : 'Login & Activate'}</button>
    </form>
  );
};
export default MarketplaceLogin;
