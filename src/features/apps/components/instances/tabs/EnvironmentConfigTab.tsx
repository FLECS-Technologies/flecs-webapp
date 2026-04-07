import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Save } from 'lucide-react';
import { InstanceEnvironmentVariable } from '@generated/core/schemas';
import { useGetInstancesInstanceIdConfigEnvironment, usePutInstancesInstanceIdConfigEnvironment, useDeleteInstancesInstanceIdConfigEnvironmentVariableName } from '@generated/core/instances/instances';
import EnvironmentVariableCard from './EnvironmentVariableCard';

interface EnvironmentConfigTabProps { instanceId: string; onChange: (hasChanges: boolean) => void; }

const EnvironmentConfigTab: React.FC<EnvironmentConfigTabProps> = ({ instanceId, onChange }) => {
  const [envVars, setEnvVars] = useState<InstanceEnvironmentVariable[]>([]);
  const [savedSnapshot, setSavedSnapshot] = useState<InstanceEnvironmentVariable[]>([]);
  const [newIndices, setNewIndices] = useState<Set<number>>(new Set());
  const [modifiedIndices, setModifiedIndices] = useState<Set<number>>(new Set());
  const { data: envResponse, isLoading } = useGetInstancesInstanceIdConfigEnvironment(instanceId);
  const { mutateAsync: putEnvironment } = usePutInstancesInstanceIdConfigEnvironment();
  const { mutateAsync: deleteVariable } = useDeleteInstancesInstanceIdConfigEnvironmentVariableName();
  const hasChanges = newIndices.size > 0 || modifiedIndices.size > 0;

  useEffect(() => { if (envResponse?.data) { const d = envResponse.data as InstanceEnvironmentVariable[]; if (Array.isArray(d)) { setEnvVars(d); setSavedSnapshot(d.map(e => ({ ...e }))); setNewIndices(new Set()); setModifiedIndices(new Set()); } } }, [envResponse]);
  useEffect(() => { onChange(hasChanges); }, [hasChanges]);

  const handleAdd = () => { setEnvVars(prev => { const next = [...prev, { name: '', value: '' }]; setNewIndices(s => new Set(s).add(next.length - 1)); return next; }); };
  const handleChange = useCallback((index: number, key: string, value: string) => { setEnvVars(prev => prev.map((env, i) => i === index ? { ...env, [key]: value } : env)); setModifiedIndices(prev => { const next = new Set(prev); next.add(index); return next; }); }, []);

  const reindex = (prev: Set<number>, index: number) => { const next = new Set<number>(); prev.forEach(i => { if (i < index) next.add(i); else if (i > index) next.add(i - 1); }); return next; };

  const handleDelete = async (index: number) => {
    const envVar = envVars[index];
    if (newIndices.has(index)) { setEnvVars(prev => prev.filter((_, i) => i !== index)); setNewIndices(prev => reindex(prev, index)); setModifiedIndices(prev => reindex(prev, index)); return; }
    if (envVar.name) {
      try { await deleteVariable({ instanceId, variableName: envVar.name }); onChange(true); setEnvVars(prev => prev.filter((_, i) => i !== index)); setNewIndices(prev => reindex(prev, index)); setModifiedIndices(prev => reindex(prev, index)); setSavedSnapshot(prev => prev.filter((_, i) => i !== index)); toast.success(`Deleted "${envVar.name}"`); }
      catch { toast.error('Failed to delete environment variable!'); }
    }
  };

  const handleSaveAll = async () => {
    try { const variables = envVars.filter(({ name }) => name).map(({ name, value }) => ({ name, value })); await putEnvironment({ instanceId, data: variables }); onChange(true); setSavedSnapshot(variables.map(e => ({ ...e }))); setNewIndices(new Set()); setModifiedIndices(new Set()); toast.success(`Saved ${variables.length} variable${variables.length !== 1 ? 's' : ''}`); }
    catch { toast.error('Failed to save environment variables!'); }
  };

  if (isLoading) return <div className="animate-spin h-5 w-5 border-2 border-brand border-t-transparent rounded-full" />;

  return (
    <div>
      {envVars.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-white/10 rounded-xl mb-4">
          <p className="text-sm text-muted mb-3">No environment variables configured.</p>
          <button onClick={handleAdd} className="px-4 py-2 border border-brand text-brand rounded-lg font-semibold hover:bg-brand/10 transition inline-flex items-center gap-2 text-sm"><Plus size={16} /> Add Environment Variable</button>
        </div>
      ) : (
        <>
          <div className="border border-white/10 rounded-xl overflow-hidden mb-4">
            {envVars.map((env, index) => (
              <React.Fragment key={index}>
                {index > 0 && <hr className="border-white/10" />}
                <EnvironmentVariableCard env={{ ...env, value: env.value || '' }} index={index} isNew={newIndices.has(index)} isModified={modifiedIndices.has(index) && !newIndices.has(index)} onChange={handleChange} onDelete={handleDelete} />
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleAdd} className="px-4 py-2 text-brand rounded-lg font-semibold hover:bg-brand/10 transition inline-flex items-center gap-2 text-sm"><Plus size={16} /> Add Environment Variable</button>
            <div className="flex-1" />
            {hasChanges && <span className="text-xs text-warning font-semibold">{newIndices.size + modifiedIndices.size} unsaved change{newIndices.size + modifiedIndices.size !== 1 ? 's' : ''}</span>}
            <button className="px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-end transition inline-flex items-center gap-2 text-sm disabled:opacity-50" disabled={!hasChanges} onClick={handleSaveAll}><Save size={14} /> Save All</button>
          </div>
        </>
      )}
    </div>
  );
};
export default EnvironmentConfigTab;
