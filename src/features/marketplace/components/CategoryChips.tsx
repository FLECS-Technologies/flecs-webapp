interface Category { id: number; name: string; count?: number; }
interface CategoryChipsProps { categories: Category[]; hiddenCategories: number[]; onToggle: (id: number) => void; }

const dotColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899', '#F97316'];

export default function CategoryChips({ categories, hiddenCategories, onToggle }: CategoryChipsProps) {
  if (!categories?.length) return null;
  return (
    <div className="flex gap-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      {categories.map((cat, i) => {
        const active = !hiddenCategories.includes(cat.id);
        const color = dotColors[i % dotColors.length];
        return (
          <button key={cat.id} onClick={() => onToggle(cat.id)} className={`flex items-center gap-2 cursor-pointer shrink-0 transition ${active ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-sm text-muted font-medium whitespace-nowrap">{cat.name}</span>
            {cat.count != null && <span className="text-sm text-muted/50">- {cat.count} Apps</span>}
          </button>
        );
      })}
    </div>
  );
}
