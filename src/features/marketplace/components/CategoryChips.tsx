import { Stack, Typography, Box } from '@mui/material';

interface Category {
  id: number;
  name: string;
  count?: number;
}

interface CategoryChipsProps {
  categories: Category[];
  hiddenCategories: number[];
  onToggle: (id: number) => void;
}

// Stable color palette for category dots
const dotColors = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EF4444', // red
  '#06B6D4', // cyan
  '#EC4899', // pink
  '#F97316', // orange
];

export default function CategoryChips({ categories, hiddenCategories, onToggle }: CategoryChipsProps) {
  if (!categories?.length) return null;

  return (
    <Stack
      direction="row"
      spacing={3}
      sx={{
        overflowX: 'auto',
        pb: 0.5,
        '&::-webkit-scrollbar': { height: 0 },
      }}
    >
      {categories.map((cat, i) => {
        const active = !hiddenCategories.includes(cat.id);
        const color = dotColors[i % dotColors.length];
        return (
          <Box
            key={cat.id}
            onClick={() => onToggle(cat.id)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              opacity: active ? 1 : 0.4,
              transition: 'opacity 0.2s',
              flexShrink: 0,
              '&:hover': { opacity: active ? 1 : 0.7 },
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: color,
                flexShrink: 0,
              }}
            />
            <Typography variant="body2" color="text.secondary" noWrap sx={{ fontWeight: 500 }}>
              {cat.name}
            </Typography>
            {cat.count != null && (
              <Typography variant="body2" color="text.disabled" sx={{ fontWeight: 400 }}>
                · {cat.count} Apps
              </Typography>
            )}
          </Box>
        );
      })}
    </Stack>
  );
}
