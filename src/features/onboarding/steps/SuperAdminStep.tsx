import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useCreateSuperAdmin } from '@features/auth/fence-api';

const SuperAdminStepComponent: React.FC<{ onNext?: () => void; onComplete?: () => void }> = ({ onNext, onComplete }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { mutateAsync: createAdmin, isPending, error: mutationError } = useCreateSuperAdmin();

  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score += 25; if (pw.length >= 12) score += 25;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 25;
    if (/\d/.test(pw)) score += 25; if (/[^a-zA-Z0-9]/.test(pw)) score += 25;
    if (score <= 25) return { score, label: 'Weak', color: 'bg-error' };
    if (score <= 50) return { score, label: 'Fair', color: 'bg-warning' };
    if (score <= 75) return { score, label: 'Good', color: 'bg-accent' };
    return { score, label: 'Strong', color: 'bg-success' };
  };

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!username.trim()) errors.username = 'Username is required';
    if (!password) errors.password = 'Password is required';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      await createAdmin({ full_name: username, name: username, password });
      onComplete?.();
      onNext?.();
    } catch {
      // mutationError is set automatically by TanStack
    }
  };

  const ps = getPasswordStrength(password);
  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <h5 className="text-xl font-semibold mb-2">Create Super Administrator</h5>
        <p className="text-sm text-muted mb-6">Create the initial administrator account for your device.</p>
        <div className="flex flex-col gap-4">
          <div><label className="block text-sm text-muted mb-1">Username</label><input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus disabled={isPending} className="w-full px-3 py-2 bg-dark rounded-lg border border-white/10 text-white focus:outline-none focus:border-brand" />{validationErrors.username && <p className="text-xs text-error mt-1">{validationErrors.username}</p>}</div>
          <div><label className="block text-sm text-muted mb-1">Password</label><div className="relative"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} disabled={isPending} className="w-full px-3 py-2 bg-dark rounded-lg border border-white/10 text-white focus:outline-none focus:border-brand pr-10" /><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>{validationErrors.password && <p className="text-xs text-error mt-1">{validationErrors.password}</p>}</div>
          {password && <div><span className="text-xs text-muted">Strength: {ps.label}</span><div className="h-1 bg-white/10 rounded mt-1"><div className={`h-full rounded ${ps.color}`} style={{ width: `${ps.score}%` }} /></div></div>}
          <div><label className="block text-sm text-muted mb-1">Confirm Password</label><div className="relative"><input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isPending} className="w-full px-3 py-2 bg-dark rounded-lg border border-white/10 text-white focus:outline-none focus:border-brand pr-10" /><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>{validationErrors.confirmPassword && <p className="text-xs text-error mt-1">{validationErrors.confirmPassword}</p>}</div>
        </div>
        <div className="flex justify-between mt-8"><button type="submit" className="px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-end transition disabled:opacity-50" disabled={isPending}>{isPending ? 'Creating Admin...' : 'Create Administrator'}</button></div>
        {mutationError && <div className="px-4 py-3 rounded-lg bg-error/10 text-error mt-4">{mutationError.message}</div>}
        {validationErrors.general && <div className="px-4 py-3 rounded-lg bg-error/10 text-error mt-4">{validationErrors.general}</div>}
      </form>
    </div>
  );
};

export default SuperAdminStepComponent;
