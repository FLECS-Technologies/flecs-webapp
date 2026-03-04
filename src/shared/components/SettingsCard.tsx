import { Box, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface SettingsCardProps {
  title: string;
  description?: string;
  footer?: ReactNode;
  footerAction?: ReactNode;
  danger?: boolean;
  children?: ReactNode;
}

export default function SettingsCard({
  title,
  description,
  footer,
  footerAction,
  danger,
  children,
}: SettingsCardProps) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: danger ? 'error.main' : 'divider',
        overflow: 'hidden',
      }}
    >
      {/* Content */}
      <Box sx={{ px: 3, pt: 3, pb: children ? 3 : 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem' }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {description}
          </Typography>
        )}
        {children && <Box sx={{ mt: 2.5 }}>{children}</Box>}
      </Box>

      {/* Footer */}
      {(footer || footerAction) && (
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            px: 3,
            py: 1.75,
            borderTop: '1px solid',
            borderColor: danger ? 'error.main' : 'divider',
            bgcolor: (theme) =>
              danger
                ? theme.palette.mode === 'dark'
                  ? 'rgba(239,68,68,0.06)'
                  : 'rgba(239,68,68,0.03)'
                : theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.02)'
                  : 'rgba(0,0,0,0.015)',
          }}
        >
          {footer && (
            <Typography variant="caption" color="text.disabled" sx={{ flex: 1 }}>
              {footer}
            </Typography>
          )}
          {footerAction}
        </Stack>
      )}
    </Box>
  );
}
