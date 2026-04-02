import React, { useState, useEffect } from 'react';
import type { AuthProvidersAndDefaults, AuthProvider, Accepted } from '@generated/core/schemas';
import { getProvidersAuth, putProvidersAuthCore, postProvidersAuthFirstTimeSetupFlecsport } from '@generated/core/experimental/experimental';
import { extractCoreProviderId } from '@features/onboarding/OnboardingGuard';
const checkAuthProviderConfigured = async () => (await getProvidersAuth().then(r => extractCoreProviderId((r as any).data))) !== null;
const checkAuthProviderCoreConfigured = checkAuthProviderConfigured;
import { useQuestActions } from '@features/notifications/quests/hooks';
import { isFinishedOk as questStateFinishedOk } from '@features/notifications/quests/QuestItem';

type SetupMode = 'loading' | 'select' | 'first-time' | 'polling' | 'completed';

const AuthProviderStepComponent: React.FC<{ onNext?: () => void; onPrevious?: () => void; onComplete?: () => void; isLoading?: boolean; error?: string }> = ({ onNext, onPrevious, onComplete, isLoading: parentLoading, error: parentError }) => {
  const [authProviders, setAuthProviders] = useState<AuthProvidersAndDefaults | null>(null);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [setupMode, setSetupMode] = useState<SetupMode>('loading');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const executedRef = React.useRef(false);
  const { fetchQuest, waitForQuest } = useQuestActions();
  const resetError = () => setError(null);
  const getProviderIds = (data: AuthProvidersAndDefaults | null) => data?.providers ? Object.keys(data.providers) : [];
  const completeStep = async () => { await onComplete(); onNext(); };
  const configureAndComplete = async (id: string) => { setIsLoading(true); resetError(); try { await putProvidersAuthCore({ provider: id }); setSetupMode('completed'); await completeStep(); } catch (err: any) { setError(err.message); throw err; } finally { setIsLoading(false); } };

  const initializeStep = async () => {
    if (initialized) return;
    try {
      setInitialized(true); setIsLoading(true); resetError();
      if (await checkAuthProviderCoreConfigured()) { setSetupMode('completed'); await completeStep(); return; }
      const r = await getProvidersAuth(); const data = r.data as AuthProvidersAndDefaults; setAuthProviders(data);
      const ids = getProviderIds(data);
      if (ids.length > 0) { setSelectedProvider(ids[0]); setSetupMode('select'); if (ids.length === 1) await configureAndComplete(ids[0]); }
      else { setSetupMode('first-time'); const fr = await postProvidersAuthFirstTimeSetupFlecsport(); setSetupMode('polling'); const questId = (fr as any).jobId ?? (fr as any).data?.jobId; await fetchQuest(questId); const result = await waitForQuest(questId); if (!questStateFinishedOk(result.state)) throw new Error('Failed to import auth provider.'); const r2 = await getProvidersAuth(); const d2 = r2.data as AuthProvidersAndDefaults; if (d2?.core) { setSetupMode('completed'); await completeStep(); return; } const ids2 = getProviderIds(d2); if (ids2.length > 0) { setAuthProviders(d2); setSelectedProvider(ids2[0]); setSetupMode('select'); await configureAndComplete(ids2[0]); } else throw new Error('No providers found after setup'); }
    } catch (err: any) { setInitialized(false); setError(err.message); } finally { setIsLoading(false); }
  };

  useEffect(() => { if (executedRef.current) return; if (!initialized) initializeStep(); executedRef.current = true; }, []);

  if (error || parentError) return <div className="max-w-xl mx-auto"><h5 className="text-xl font-semibold mb-2">Auth Provider Setup Error</h5><div className="px-4 py-3 rounded-lg bg-error/10 text-error mb-4">{error || parentError}</div><div className="flex justify-between mt-8"><button onClick={onPrevious} className="px-4 py-2 rounded-lg font-semibold hover:bg-white/10 transition">Previous</button><button onClick={() => { resetError(); setSetupMode('loading'); setInitialized(false); initializeStep(); }} className="px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-end transition">Retry</button></div></div>;
  if (setupMode === 'loading') return <div className="max-w-xl mx-auto text-center py-8"><div className="animate-spin h-6 w-6 border-2 border-brand border-t-transparent rounded-full mx-auto" /><p className="mt-4 text-sm">Checking authentication provider status...</p></div>;
  if (setupMode === 'completed') return <div className="max-w-xl mx-auto"><h5 className="text-xl font-semibold mb-2">Authentication Provider</h5><div className="px-4 py-3 rounded-lg bg-success/10 text-success mb-4">Authentication provider is already configured.</div><div className="flex justify-between mt-8"><button onClick={onPrevious} className="px-4 py-2 rounded-lg font-semibold hover:bg-white/10 transition">Previous</button><button onClick={onNext} className="px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-end transition">Continue</button></div></div>;
  if (setupMode === 'first-time' || setupMode === 'polling') return <div className="max-w-3xl mx-auto py-8 text-center"><h5 className="text-xl font-semibold mb-2">Setup Authentication Provider</h5><div className="px-4 py-3 rounded-lg bg-accent/10 text-accent mb-4">{setupMode === 'first-time' ? 'Setting up built-in authentication...' : 'Waiting for providers...'}</div><div className="flex justify-center my-6"><div className="animate-spin h-6 w-6 border-2 border-brand border-t-transparent rounded-full" /></div></div>;

  return (
    <div className="max-w-3xl mx-auto py-8 text-center">
      <h5 className="text-xl font-semibold mb-2">Setup Authentication Provider</h5>
      <p className="text-sm text-muted mb-6">Configure the default authentication provider.</p>
      <div className="px-4 py-3 rounded-lg bg-accent/10 text-accent mb-4">Authentication provider found. Confirm to proceed.</div>
      <div className="mb-6"><label className="block text-sm text-muted mb-1">Select Provider</label><select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)} className="w-full px-3 py-2 bg-dark rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-brand">{authProviders?.providers && Object.entries(authProviders.providers).map(([id, p]) => <option key={id} value={id}>{(p as AuthProvider).name || id}</option>)}</select></div>
      <div className="flex justify-between mt-8"><button onClick={onPrevious} disabled={isLoading} className="px-4 py-2 rounded-lg font-semibold hover:bg-white/10 transition disabled:opacity-50">Previous</button><button onClick={() => selectedProvider && configureAndComplete(selectedProvider)} disabled={isLoading || !selectedProvider} className="px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-end transition disabled:opacity-50">{isLoading ? 'Setting up...' : 'Setup Provider'}</button></div>
    </div>
  );
};


export default AuthProviderStepComponent;
