import { Plus } from 'lucide-react';
import type { EnvironmentDraft } from '../useInstanceConfigDraft';
import EnvironmentVariableCard from './EnvironmentVariableCard';

interface EnvironmentConfigTabProps {
  rows: EnvironmentDraft[];
  onChange: (update: (rows: EnvironmentDraft[]) => EnvironmentDraft[]) => void;
}

const EnvironmentConfigTab = ({ rows, onChange }: EnvironmentConfigTabProps) => {
  const addVariable = () =>
    onChange((current) => [...current, { name: '', value: '', _rowId: crypto.randomUUID() }]);

  const updateVariable = (index: number, key: 'name' | 'value', value: string) =>
    onChange((current) =>
      current.map((variable, currentIndex) =>
        currentIndex === index ? { ...variable, [key]: value } : variable,
      ),
    );

  const deleteVariable = (index: number) =>
    onChange((current) => current.filter((_, currentIndex) => currentIndex !== index));

  if (rows.length === 0) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-subtle px-6 text-center">
        <p className="text-sm font-medium">No environment variables</p>
        <p className="mt-1 max-w-sm text-xs text-muted">
          Add values this instance needs when it starts.
        </p>
        <button
          type="button"
          onClick={addVariable}
          className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10"
        >
          <Plus size={16} /> Add variable
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-border bg-surface-raised">
        <div className="grid grid-cols-[1fr_1fr_36px] gap-3 border-b border-border bg-surface-subtle px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
          <span>Name</span>
          <span>Value</span>
          <span className="sr-only">Actions</span>
        </div>
        {rows.map((variable, index) => (
          <EnvironmentVariableCard
            key={variable._rowId}
            env={variable}
            index={index}
            onChange={updateVariable}
            onDelete={deleteVariable}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={addVariable}
        className="mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10"
      >
        <Plus size={16} /> Add variable
      </button>
    </div>
  );
};

export default EnvironmentConfigTab;
