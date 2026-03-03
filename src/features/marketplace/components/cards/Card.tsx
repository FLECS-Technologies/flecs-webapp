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
import { Box, Button, Stack, Chip } from '@mui/material';
import { createVersion, createVersions, getLatestVersion } from '@shared/utils/version-utils';
import { Version } from '@shared/types/version';
import { App } from '@shared/types/app';
import { useSystemInfo } from '@shared/hooks/system-queries';
import FullCard from './FullCard';
import { Check, Star, AlertTriangle, ArrowUpRight } from 'lucide-react';
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

  const rating = parseFloat(props.average_rating || '0');

  const plainDescription = (props.short_description || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");

  const categories = (props.categories ?? []).slice(0, 2);

  return (
    <Card
      data-testid="app-card"
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: 'primary.main',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,46,99,0.1)'
              : '0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,46,99,0.06)',
          '& .hover-arrow': {
            opacity: 1,
            transform: 'translateX(0)',
          },
        },
      }}
      onClick={() => setFullCardOpen(true)}
    >
      {/* Content */}
      <Box sx={{ p: 2.5, pb: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header row: icon + title/desc + hover arrow */}
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Avatar
            src={props.avatar}
            variant="rounded"
            sx={{
              width: 44,
              height: 44,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'grey.100',
              fontSize: 18,
              borderRadius: 1.5,
              flexShrink: 0,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {props.title?.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="body2" fontWeight={700} noWrap lineHeight={1.3} sx={{ flex: 1 }}>
                {props.title}
              </Typography>
              <ArrowUpRight
                size={14}
                className="hover-arrow"
                style={{
                  opacity: 0,
                  transform: 'translateX(-4px)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  flexShrink: 0,
                  color: 'var(--mui-palette-text-disabled)',
                }}
              />
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mt: 0.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.5,
                fontSize: '0.75rem',
              }}
            >
              {plainDescription || 'No description available'}
            </Typography>
          </Box>
        </Stack>

        {/* Meta block — pushed to bottom */}
        <Box sx={{ mt: 'auto', pt: 2, pb: 2 }}>
          {/* Author + rating + price */}
          <Stack direction="row" alignItems="center" spacing={0.75}>
            {props.author && (
              <Typography variant="caption" color="text.disabled" fontSize="0.7rem" noWrap sx={{ maxWidth: '40%' }}>
                {props.author}
              </Typography>
            )}
            {rating > 0 && (
              <>
                <Typography variant="caption" color="text.disabled" fontSize="0.55rem">
                  &middot;
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.25}>
                  <Star size={10} fill="#F59E0B" color="#F59E0B" />
                  <Typography variant="caption" color="text.disabled" fontSize="0.7rem">
                    {rating.toFixed(1)}
                  </Typography>
                </Stack>
              </>
            )}
            <Box sx={{ flex: 1 }} />
            <Chip
              label={props.price && parseFloat(props.price) > 0 ? `$${props.price}` : 'Free'}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: (theme) =>
                  props.price && parseFloat(props.price) > 0
                    ? theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'grey.100'
                    : theme.palette.mode === 'dark'
                      ? 'rgba(46,204,113,0.15)'
                      : 'rgba(46,204,113,0.1)',
                color: props.price && parseFloat(props.price) > 0 ? 'text.secondary' : 'success.main',
                border: 'none',
                '& .MuiChip-label': { px: 1 },
              }}
            />
          </Stack>

          {/* Category chips */}
          {categories.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
              {categories.map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 20,
                    fontSize: '0.6rem',
                    fontWeight: 500,
                    borderColor: 'divider',
                    color: 'text.disabled',
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Box>

      {/* CTA — subtle elevated footer */}
      <Box
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'grey.50',
          borderTop: '1px solid',
          borderColor: 'divider',
          px: 2.5,
          py: 1.5,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {installed ? (
          <Chip
            icon={<Check size={14} />}
            label="Installed"
            color="success"
            variant="outlined"
            sx={{
              width: '100%',
              height: 40,
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: 1.5,
              justifyContent: 'center',
            }}
          />
        ) : !installable ? (
          <Button
            fullWidth
            size="small"
            disabled
            startIcon={<AlertTriangle size={15} />}
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8rem',
              py: 1,
            }}
          >
            Not compatible
          </Button>
        ) : (
          <InstallButton
            app={props}
            version={latestVersion}
            disabled={false}
            size="small"
            fullWidth
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              py: 1,
              color: 'text.secondary',
              bgcolor: 'transparent',
              boxShadow: 'none',
              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: 'primary.main',
                color: '#fff',
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
