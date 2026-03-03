/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { useState } from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { Box, Button, Stack, Tooltip } from '@mui/material';
import { createVersion, createVersions, getLatestVersion } from '@shared/utils/version-utils';
import { Version } from '@shared/types/version';
import { App } from '@features/apps/types';
import { useSystemInfo } from '@features/system/hooks';
import FullCard from './FullCard';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import InstallButton from '@features/apps/components/buttons/InstallButton';

export default function MarketplaceCard(props: App) {
  const { data: systemInfo } = useSystemInfo();
  const installed = props.status === 'installed';
  const versionsArray = props.versions
    ? createVersions(props.versions, props.installedVersions || [])
    : [];
  const [latestVersion] = useState<Version>(getLatestVersion(versionsArray) ?? createVersion(''));
  const installable =
    props.requirement && systemInfo?.arch && props.requirement.includes(systemInfo.arch);
  const [fullCardOpen, setFullCardOpen] = useState<boolean>(false);

  // Strip HTML tags for plain text description
  const plainDescription = (props.short_description || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");

  return (
    <Card
      data-testid="app-card"
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 8px 24px rgba(0,0,0,0.4)'
              : '0 8px 24px rgba(0,0,0,0.08)',
        },
      }}
      onClick={() => setFullCardOpen(true)}
    >
      {/* Content area */}
      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Icon + title row */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={props.avatar}
            variant="rounded"
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'action.hover',
              fontSize: 20,
              borderRadius: 2,
              flexShrink: 0,
            }}
          >
            {props.title?.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ lineHeight: 1.3 }}>
                {props.title}
              </Typography>
              {installed && (
                <Tooltip title="Installed">
                  <span><CheckCircle2 size={16} color="#10B981" /></span>
                </Tooltip>
              )}
              {!installable && (
                <Tooltip title="Not compatible with your architecture">
                  <span><AlertCircle size={14} color="#EF4444" /></span>
                </Tooltip>
              )}
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.25,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4,
              }}
            >
              {plainDescription || 'No description available'}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Install action — full width, outlined style */}
      <Box sx={{ px: 2.5, pb: 2.5, pt: 0 }} onClick={(e) => e.stopPropagation()}>
        {!installed ? (
          <InstallButton
            app={props}
            version={latestVersion}
            disabled={installed || !installable}
            fullWidth
            variant="outlined"
            color="inherit"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              py: 1,
              borderColor: 'divider',
            }}
          />
        ) : (
          <Button
            variant="outlined"
            color="success"
            fullWidth
            startIcon={<CheckCircle2 size={16} />}
            disabled
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              py: 1,
            }}
          >
            Installed
          </Button>
        )}
      </Box>

      <FullCard app={props} open={fullCardOpen} onClose={() => setFullCardOpen(false)} />
    </Card>
  );
}
