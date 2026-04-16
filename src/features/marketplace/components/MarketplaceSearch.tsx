import type { ChangeEvent } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

interface MarketplaceSearchProps { value: string; onSearch: (event: ChangeEvent<HTMLInputElement>, value: string) => void; onToggleFilter: () => void; }

export default function MarketplaceSearch({ value, onSearch, onToggleFilter }: MarketplaceSearchProps) {
  return (
    <div className="flex items-center px-4 py-2 rounded-xl bg-dark-end border border-white/10">
      <Search size={20} style={{ opacity: 0.5, marginRight: 12 }} />
      <input autoFocus placeholder="Search apps by name, author, or description..." value={value ?? ''} onChange={(e) => onSearch(e, e.target.value)} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} className="flex-1 bg-transparent outline-none text-white placeholder-muted text-sm" />
      <button className="p-1.5 rounded-lg hover:bg-white/10 transition ml-2" onClick={onToggleFilter}><SlidersHorizontal size={18} /></button>
    </div>
  );
}
