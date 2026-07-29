import { Trash2 } from 'lucide-react';

interface EnvironmentVariableCardProps {
  env: { name: string; value?: string };
  index: number;
  onChange: (index: number, key: 'name' | 'value', value: string) => void;
  onDelete: (index: number) => void;
}

const EnvironmentVariableCard = ({
  env,
  index,
  onChange,
  onDelete,
}: EnvironmentVariableCardProps) => (
  <div className="grid grid-cols-[1fr_1fr_36px] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 focus-within:bg-surface-subtle">
    <input
      aria-label={`Name for environment variable ${index + 1}`}
      placeholder="VARIABLE_NAME"
      value={env.name}
      onChange={(event) => onChange(index, 'name', event.target.value)}
      className="min-w-0 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary placeholder-muted outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
    />
    <input
      aria-label={`Value for ${env.name || `environment variable ${index + 1}`}`}
      placeholder="value"
      value={env.value ?? ''}
      onChange={(event) => onChange(index, 'value', event.target.value)}
      className="min-w-0 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary placeholder-muted outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
    />
    <button
      type="button"
      title="Delete environment variable"
      aria-label="Delete environment variable"
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-error/10 hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      onClick={() => onDelete(index)}
    >
      <Trash2 size={16} />
    </button>
  </div>
);

export default EnvironmentVariableCard;
