import React from 'react';
import { Trash2 } from 'lucide-react';

interface EnvironmentVariableCardProps { env: { name: string; value: string }; index: number; isNew?: boolean; isModified?: boolean; onChange: (index: number, key: string, value: string) => void; onDelete: (index: number) => void; }

const EnvironmentVariableCard: React.FC<EnvironmentVariableCardProps> = ({ env, index, isNew, isModified, onChange, onDelete }) => {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition ${isNew ? 'border-l-[3px] border-l-success' : isModified ? 'border-l-[3px] border-l-warning' : 'border-l-[3px] border-l-transparent'}`}>
      <input placeholder="VARIABLE_NAME" value={env.name} onChange={(e) => onChange(index, 'name', e.target.value)} className="flex-1 px-3 py-2 bg-dark rounded-lg border border-white/10 text-white placeholder-muted focus:outline-none focus:border-brand text-sm font-mono" />
      <input placeholder="value" value={env.value} onChange={(e) => onChange(index, 'value', e.target.value)} className="flex-1 px-3 py-2 bg-dark rounded-lg border border-white/10 text-white placeholder-muted focus:outline-none focus:border-brand text-sm font-mono" />
      {isNew && <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-medium">New</span>}
      {isModified && !isNew && <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning text-xs font-medium">Edited</span>}
      {!isNew && !isModified && <span className="w-14" />}
      <button title="Delete variable" className="p-1.5 rounded-lg hover:bg-white/10 transition text-muted hover:text-error" onClick={() => onDelete(index)} aria-label="Delete Environment Variable"><Trash2 size={16} /></button>
    </div>
  );
};
export default EnvironmentVariableCard;
