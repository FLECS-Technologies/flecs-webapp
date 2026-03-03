import { Paper, InputBase, IconButton, Stack } from '@mui/material';
import { Search, SlidersHorizontal } from 'lucide-react';

interface MarketplaceSearchProps {
  value: string;
  onSearch: (event: any, value: string) => void;
  onToggleFilter: () => void;
}

export default function MarketplaceSearch({ value, onSearch, onToggleFilter }: MarketplaceSearchProps) {
  return (
    <Paper
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1,
        borderRadius: 3,
      }}
    >
      <Search size={20} style={{ opacity: 0.5, marginRight: 12 }} />
      <InputBase
        autoFocus
        fullWidth
        placeholder="Search apps by name, author, or description..."
        value={value ?? ''}
        onChange={(e) => onSearch(e, e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
        sx={{ flex: 1, fontSize: '0.95rem' }}
      />
      <IconButton size="small" onClick={onToggleFilter} sx={{ ml: 1 }}>
        <SlidersHorizontal size={18} />
      </IconButton>
    </Paper>
  );
}
