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
import { Box, Button } from '@mui/material';
import { createVersion, createVersions, getLatestVersion } from '@shared/utils/version-utils';
import { Version } from '@shared/types/version';
import { App } from '@shared/types/app';
import { useSystemInfo } from '@shared/hooks/system-queries';
import FullCard from './FullCard';
import { Check, AlertTriangle } from 'lucide-react';
import InstallButton from '@shared/components/app-actions/InstallButton';

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

  const plainDescription = (props.short_description || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");

  const isFree = !props.price || parseFloat(props.price) === 0;

  return (
    <Card
      data-testid="app-card"
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: 'transparent',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)'
              : '0 20px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
          '& .card-icon': {
            transform: 'scale(1.05)',
          },
        },
      }}
      onClick={() => setFullCardOpen(true)}
    >
      {/* Content — centered */}
      <Box
        sx={{
          p: 3,
          pt: 4,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: 260,
        }}
      >
        <Avatar
          src={props.avatar}
          variant="rounded"
          className="card-icon"
          sx={{
            width: 72,
            height: 72,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'grey.50',
            fontSize: 26,
            fontWeight: 700,
            borderRadius: 2.5,
            mb: 2,
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {props.title?.charAt(0).toUpperCase()}
        </Avatar>

        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            textAlign: 'center',
            wordBreak: 'break-word',
            mb: 0.5,
          }}
        >
          {props.title}
        </Typography>

        {props.author && (
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.75rem' }}>
            {props.author}
          </Typography>
        )}

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1.5,
            textAlign: 'center',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.6,
            fontSize: '0.8rem',
          }}
        >
          {plainDescription || 'No description available'}
        </Typography>

        <Box sx={{ flex: 1, minHeight: 16 }} />

        <Typography
          variant="caption"
          sx={{
            mt: 2,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: isFree ? 'success.main' : 'text.secondary',
          }}
        >
          {isFree ? 'Free' : `$${props.price}`}
        </Typography>
      </Box>

      {/* CTA footer */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          px: 2.5,
          py: 2,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'grey.50',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        {installed ? (
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Check size={18} />}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              py: 1.75,
              borderColor: 'success.main',
              color: 'success.main',
              '&:hover': {
                borderColor: 'success.main',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(16,185,129,0.08)'
                    : 'rgba(16,185,129,0.04)',
              },
            }}
            onClick={() => setFullCardOpen(true)}
          >
            Installed
          </Button>
        ) : !installable ? (
          <Button
            fullWidth
            disabled
            size="large"
            startIcon={<AlertTriangle size={18} />}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              py: 1.75,
            }}
          >
            Not compatible
          </Button>
        ) : (
          <InstallButton
            app={props}
            version={latestVersion}
            disabled={false}
            size="large"
            fullWidth
            color="primary"
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              py: 1.75,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            }}
          />
        )}
      </Box>

      <FullCard app={props} open={fullCardOpen} onClose={() => setFullCardOpen(false)} />
    </Card>
  );
}
