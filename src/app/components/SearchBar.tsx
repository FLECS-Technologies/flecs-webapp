import { Filter, Search } from 'lucide-react';
import { useState } from 'react';

const SearchBar = (props: any) => {
  const { defaultSearchValue, searchTitle, setToggleFilter, search } = props;
  const [value, setValue] = useState(defaultSearchValue || '');

  return (
    <div data-testid="search-bar" className="flex items-center rounded-xl bg-dark-end p-1 px-2">
      {setToggleFilter && (
        <button
          onClick={setToggleFilter}
          className="px-3 py-2 text-sm font-semibold inline-flex items-center gap-1 hover:bg-white/10 rounded-lg transition"
          aria-label="filter"
        >
          <Filter size={18} /> Filter
        </button>
      )}
      <Search size={18} aria-label="search-icon" className="ml-2 opacity-50" />
      <input
        aria-label="search-field"
        data-testid="search-field"
        autoFocus
        placeholder={searchTitle}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (search) search(e, e.target.value);
        }}
        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
        className="flex-1 ml-2 bg-transparent outline-none text-white placeholder-muted text-sm"
      />
    </div>
  );
};
export default SearchBar;
