import React, { useState } from 'react';
import { postApiV2AuthLogin } from '@generated/console/default/default';
import { useMarketplaceUser } from '@stores/marketplace-user';
import { putConsoleAuthentication } from '@generated/core/console/console';

const MarketplaceLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useMarketplaceUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const response = await postApiV2AuthLogin({ username, password });
      const user = (response as any).data?.data ?? (response as any).data ?? response;
      if (user) { await putConsoleAuthentication({ user: { ID: user.ID || 0, display_name: user.display_name || '', user_email: user.user_email || '', user_login: user.user_login || '' }, feature_flags: user.feature_flags || { isVendor: false, isWhitelabeled: false }, jwt: user.jwt || { token: '', token_expires: 0 } }); }
      setUser(user);
    } catch (err: any) { setError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto mt-8">
      <div className="mb-4"><label className="block text-sm text-muted mb-1">Username</label><input value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-3 py-2 bg-dark rounded-lg border border-white/10 text-white placeholder-muted focus:outline-none focus:border-brand" /></div>
      <div className="mb-4"><label className="block text-sm text-muted mb-1">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 bg-dark rounded-lg border border-white/10 text-white placeholder-muted focus:outline-none focus:border-brand" /></div>
      {error && <p className="text-error mb-4 text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="w-full px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-end transition disabled:opacity-50">{loading ? 'Logging in...' : 'Login'}</button>
    </form>
  );
};
export default MarketplaceLogin;
