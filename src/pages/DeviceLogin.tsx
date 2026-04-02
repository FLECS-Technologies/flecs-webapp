import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import WhiteLabelLogo from '@app/theme/WhiteLabelLogo';
import { useOAuth4WebApiAuth } from '@features/auth/AuthProvider';
import { useSuperAdminExists, useCreateSuperAdmin } from '@features/auth/fence-api';

export default function DeviceLogin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const auth = useOAuth4WebApiAuth();

  const { data: exists, isLoading, isError, refetch } = useSuperAdminExists();
  const { mutateAsync: createAdmin, isPending, error: mutationError } = useCreateSuperAdmin();

  const handleLogin = () => auth.signIn();

  const handleSignup = async () => {
    if (password !== confirmPassword) return;
    if (password.length < 6) return;
    await createAdmin({ full_name: username, name: username, password });
    auth.signIn();
  };

  const error = mutationError?.message || null;
  const mode = isLoading ? 'loading' : isError ? 'error' : exists ? 'login' : 'signup';

  return (
    <div className="max-w-sm mx-auto px-4">
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
        <div className="w-full rounded-xl bg-dark-end p-8 flex flex-col items-center gap-6 shadow-lg">
          <WhiteLabelLogo logoColor="primary" />
          <h1 className="text-2xl font-semibold text-center text-brand">Welcome</h1>

          {mode === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted">Connecting to device...</p>
            </div>
          )}

          {mode === 'error' && (
            <div className="w-full">
              <div className="bg-error/10 border border-error/30 text-error rounded-lg px-4 py-3 mb-4 text-sm">Device not reachable</div>
              <button onClick={() => refetch()} className="w-full px-4 py-3 border border-brand text-brand rounded-lg font-semibold hover:bg-brand/10 transition">Retry</button>
            </div>
          )}

          {mode === 'login' && (
            <>
              <p className="text-base text-center text-muted">Please authenticate to continue</p>
              <button onClick={handleLogin} className="w-full px-4 py-3 bg-brand text-white rounded-lg font-semibold hover:bg-brand-end transition">Login</button>
            </>
          )}

          {mode === 'signup' && (
            <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }} className="w-full flex flex-col gap-4">
              <p className="text-sm text-center text-muted">Create the first admin account</p>
              {error && <div className="bg-error/10 border border-error/30 text-error rounded-lg px-4 py-3 text-sm">{error}</div>}
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full px-3 py-2 bg-dark rounded-lg border border-white/10 text-white placeholder-muted focus:outline-none focus:border-brand" />
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-3 py-2 bg-dark rounded-lg border border-white/10 text-white placeholder-muted focus:outline-none focus:border-brand pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2 p-1 text-muted hover:text-white">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full px-3 py-2 bg-dark rounded-lg border border-white/10 text-white placeholder-muted focus:outline-none focus:border-brand" />
              <button type="submit" disabled={isPending} className="w-full px-4 py-3 bg-brand text-white rounded-lg font-semibold hover:bg-brand-end transition disabled:opacity-50">
                {isPending ? 'Creating...' : 'Create Account & Login'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
