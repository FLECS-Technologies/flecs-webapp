import { User, Shield, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useOAuth4WebApiAuth } from '@features/auth/AuthProvider';
import SettingsCard from '@app/components/SettingsCard';

export default function Profile() {
  const auth = useOAuth4WebApiAuth();
  const user = auth.user;
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTokenExpiration = (exp?: number) => {
    if (!exp) return 'Unknown';
    const expDate = new Date(exp * 1000);
    return expDate.toLocaleString();
  };

  const getRoles = () => {
    const roles = new Set<string>();
    user?.realm_access?.roles?.forEach((role) => roles.add(role));
    if (user?.resource_access) {
      Object.values(user.resource_access).forEach((resource) => {
        resource.roles?.forEach((role) => roles.add(role));
      });
    }
    return Array.from(roles);
  };

  return (
    <div>
      <div className="flex flex-col gap-6">
        {/* Account (avatar card) */}
        <SettingsCard
          title="Account"
          description="Your account identity from the identity provider."
          footer="Account details are managed by your administrator."
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">
                {user?.preferred_username || 'Anonymous'}
              </h1>
              <span
                className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                  auth.isAuthenticated
                    ? 'bg-success/20 text-success'
                    : 'bg-error/20 text-error'
                }`}
              >
                {auth.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </span>
            </div>
            <div className="w-20 h-20 rounded-full bg-brand/10 border-2 border-brand/15 flex items-center justify-center text-brand text-[1.75rem] font-bold">
              {user?.preferred_username ? getInitials(user.preferred_username) : <User size={20} />}
            </div>
          </div>
        </SettingsCard>

        {/* User Information */}
        <SettingsCard
          title="User Information"
          description="Your account details from the identity provider."
          footer="Account details are managed by your administrator."
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center">
              <p className="text-sm text-muted w-40 shrink-0">Username:</p>
              <p className="text-sm font-semibold">{user?.preferred_username || 'Not available'}</p>
            </div>
            {user?.email && (
              <div className="flex items-center">
                <p className="text-sm text-muted w-40 shrink-0">Email:</p>
                <p className="text-sm font-semibold">-</p>
              </div>
            )}
            <div className="flex items-center">
              <p className="text-sm text-muted w-40 shrink-0">User ID:</p>
              <span className="text-sm font-semibold font-mono text-[0.8rem] bg-white/5 px-2 py-0.5 rounded">
                -
              </span>
            </div>
          </div>
        </SettingsCard>

        {/* Roles & Permissions */}
        {getRoles().length > 0 && (
          <SettingsCard
            title="Roles & Permissions"
            description="Your access level and permissions on this device."
            footer="Roles are assigned by your identity provider."
          >
            <div className="flex flex-wrap gap-2">
              {getRoles().map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-brand text-brand text-xs font-medium"
                >
                  <Shield size={16} />
                  {role}
                </span>
              ))}
            </div>
          </SettingsCard>
        )}

        {/* Login Information */}
        <SettingsCard
          title="Login Information"
          description="Your current authentication session details."
          footer="Sessions are managed by your identity provider."
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center">
              <p className="text-sm text-muted w-40 shrink-0">Login Expires:</p>
              <p className="text-sm font-semibold">{formatTokenExpiration(user?.exp)}</p>
            </div>
            <div className="flex items-center">
              <p className="text-sm text-muted w-40 shrink-0">Authentication Status:</p>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  auth.isAuthenticated
                    ? 'bg-success/20 text-success'
                    : 'bg-error/20 text-error'
                }`}
              >
                {auth.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </span>
            </div>
          </div>
        </SettingsCard>

        {/* End Session (danger) */}
        <SettingsCard
          danger
          title="End Session"
          description="Sign out and end your current session on this device. You will be redirected to the login page."
          footer="This will not affect other active sessions."
          footerAction={
            <button
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-error text-error rounded-lg text-sm font-semibold hover:bg-error/10 transition disabled:opacity-50"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut size={14} />
              {isSigningOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          }
        />
      </div>
    </div>
  );
}
