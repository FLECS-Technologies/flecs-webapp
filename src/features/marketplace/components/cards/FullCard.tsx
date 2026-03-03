/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Wed Jan 29 2025
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState } from 'react';
import parse from 'html-react-parser';
import {
  Dialog,
  DialogContent,
  Box,
  Avatar,
  Typography,
  Chip,
  Button,
  Divider,
  IconButton,
  Rating,
  Stack,
  Alert,
} from '@mui/material';

import {
  X,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  ShoppingCart,
  Star,
  Cpu,
  BookOpen,
  Store,
} from 'lucide-react';
import { App } from '@shared/types/app';
import { useSystemInfo } from '@shared/hooks/system-queries';
import { isBlacklisted } from '@shared/api/product-service';
import { createVersion, createVersions, getLatestVersion } from '@shared/utils/version-utils';
import { Version } from '@shared/types/version';
import { EditorButtons } from '@shared/components/app-actions/editors/EditorButtons';
import { VersionSelector } from '@shared/components/VersionSelector';
import UninstallButton from '@shared/components/app-actions/UninstallButton';
import ActionSnackbar from '@shared/components/ActionSnackbar';
import InstallButton from '@shared/components/app-actions/InstallButton';
import UpdateButton from '@shared/components/app-actions/UpdateButton';

interface FullCardProps {
  app: App;
  open: boolean;
  onClose: () => void;
}

export default function FullCard({ app, open, onClose }: FullCardProps) {
  const { data: systemInfo } = useSystemInfo();
  const [blackListed] = useState<boolean>(isBlacklisted(systemInfo, app.blacklist));
  const installed = app.status === 'installed';
  const versionsArray = app.versions
    ? createVersions(app.versions, app.installedVersions || [])
    : [];
  const initialVersion = getLatestVersion(versionsArray) ?? createVersion('');
  const [selectedVersion, setSelectedVersion] = useState<Version>(initialVersion);
  const installable =
    app.requirement && systemInfo?.arch && app.requirement.includes(systemInfo.arch);
  const updateAvailable =
    !app.installedVersions?.includes(getLatestVersion(versionsArray)?.version || '') && installed;
  const selectedVersionNotInstalled =
    installed && !app.installedVersions?.includes(selectedVersion.version);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarState, setSnackbarState] = useState({
    snackbarText: '',
    alertSeverity: 'success' as 'success' | 'error' | 'info' | 'warning',
    clipBoardContent: '',
  });

  const handleUninstallComplete = (success: boolean, message: string, error?: string) => {
    setSnackbarState({
      alertSeverity: success ? 'success' : 'error',
      snackbarText: message,
      clipBoardContent: error || '',
    });
    setSnackbarOpen(true);
  };

  const rating = app.average_rating ? parseFloat(app.average_rating) : 0;
  const ratingCount = app.rating_count || 0;
  const isFree = !app.price || parseFloat(app.price) === 0;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              overflow: 'hidden',
            },
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {/* Close */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              zIndex: 10,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              '&:hover': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)',
              },
            }}
            size="small"
          >
            <X size={18} />
          </IconButton>

          {/* ─── Hero ─── */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              px: 4,
              pt: 5,
              pb: 4,
            }}
          >
            <Avatar
              src={app.avatar}
              variant="rounded"
              sx={{
                width: 88,
                height: 88,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'grey.50',
                fontSize: 32,
                fontWeight: 700,
                mb: 2.5,
              }}
            >
              {app.title?.charAt(0).toUpperCase()}
            </Avatar>

            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
              {app.title}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              by {app.author || 'Unknown'}
            </Typography>

            {/* Status + Rating + Price row */}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              divider={
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: 'divider',
                  }}
                />
              }
              sx={{ mb: 2.5 }}
            >
              {installed && !updateAvailable && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <CheckCircle2 size={15} color="var(--mui-palette-success-main)" />
                  <Typography variant="caption" fontWeight={600} color="success.main">
                    Installed
                  </Typography>
                </Stack>
              )}
              {updateAvailable && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <RefreshCw size={15} color="var(--mui-palette-info-main)" />
                  <Typography variant="caption" fontWeight={600} color="info.main">
                    Update available
                  </Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Star size={14} fill="#F59E0B" color="#F59E0B" />
                <Typography variant="caption" fontWeight={600}>
                  {rating.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  ({ratingCount})
                </Typography>
              </Stack>
              <Typography
                variant="caption"
                fontWeight={700}
                color={isFree ? 'success.main' : 'text.primary'}
              >
                {isFree ? 'Free' : `$${app.price}`}
              </Typography>
            </Stack>

            {/* Rating bar — always show */}
            <Rating
              value={rating}
              precision={0.1}
              readOnly
              size="medium"
              sx={{ mb: 2 }}
            />

            {/* Categories */}
            {app.categories && app.categories.length > 0 && (
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap justifyContent="center">
                {app.categories.map((category: any, index) => (
                  <Chip
                    key={category.id || index}
                    label={category.name || category}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 26,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      borderColor: 'divider',
                      color: 'text.secondary',
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>

          {/* ─── CTA Section ─── */}
          <Box
            sx={{
              px: 4,
              py: 3,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'grey.50',
              borderTop: '1px solid',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            {versionsArray.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <VersionSelector
                  availableVersions={versionsArray}
                  selectedVersion={selectedVersion}
                  setSelectedVersion={setSelectedVersion}
                />
              </Box>
            )}

            {/* Primary action — full width */}
            {!installed && (
              <InstallButton
                app={app}
                version={selectedVersion}
                disabled={!installable || blackListed}
                showSelectedVersion={true}
                size="large"
                fullWidth
                color="primary"
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  py: 1.5,
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 'none' },
                }}
              />
            )}

            {/* Installed actions row */}
            {installed && (
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                {app.instances && <EditorButtons instance={app.instances[0]} />}
                {selectedVersionNotInstalled && (
                  <UpdateButton app={app} to={selectedVersion} showSelectedVersion={true} />
                )}
                <UninstallButton
                  app={app}
                  selectedVersion={selectedVersion}
                  variant="button"
                  onUninstallComplete={handleUninstallComplete}
                />
              </Stack>
            )}

            {app.purchasable && app.permalink && Number(app.price) > 0 && (
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ShoppingCart size={16} />}
                href={app.permalink}
                target="_blank"
                sx={{
                  mt: 1.5,
                  textTransform: 'none',
                  borderRadius: 3,
                  fontWeight: 600,
                  py: 1.25,
                }}
              >
                Purchase License
              </Button>
            )}

            {!installable && app.requirement && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                <Typography variant="body2">
                  Not compatible with {systemInfo?.arch}. Requires{' '}
                  {app.requirement.join(' or ')}.
                </Typography>
              </Alert>
            )}
          </Box>

          {/* ─── Description ─── */}
          <Box sx={{ px: 4, py: 3 }}>
            <Typography
              variant="overline"
              color="text.disabled"
              fontWeight={700}
              sx={{ fontSize: '0.65rem', letterSpacing: '0.1em', display: 'block', mb: 1.5 }}
            >
              About
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              component="div"
              sx={{
                lineHeight: 1.8,
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'text.primary',
                  mt: 2,
                  mb: 1,
                },
                '& p': { mb: 1.5 },
                '& ul, & ol': { pl: 2.5, mb: 1.5 },
                '& li': { mb: 0.5 },
              }}
            >
              {parse(app.description || app.short_description || 'No description available.')}
            </Typography>

            {/* Links */}
            {(app.documentationUrl || app.permalink) && (
              <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                {app.documentationUrl && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<BookOpen size={14} />}
                    href={app.documentationUrl}
                    target="_blank"
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      borderColor: 'divider',
                      color: 'text.secondary',
                    }}
                  >
                    Docs
                  </Button>
                )}
                {app.permalink && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Store size={14} />}
                    href={app.permalink}
                    target="_blank"
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      borderColor: 'divider',
                      color: 'text.secondary',
                    }}
                  >
                    Store
                  </Button>
                )}
              </Stack>
            )}
          </Box>

          {/* ─── System Requirements ─── */}
          {app.requirement && app.requirement.length > 0 && (
            <>
              <Divider />
              <Box sx={{ px: 4, py: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <Cpu size={14} style={{ opacity: 0.5 }} />
                  <Typography
                    variant="overline"
                    color="text.disabled"
                    fontWeight={700}
                    sx={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}
                  >
                    System Requirements
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  {app.requirement.map((req) => {
                    const compatible =
                      systemInfo?.arch &&
                      req.toLowerCase().includes(systemInfo.arch.toLowerCase());
                    return (
                      <Chip
                        key={req}
                        label={req}
                        size="small"
                        variant={compatible ? 'filled' : 'outlined'}
                        sx={{
                          height: 28,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          bgcolor: compatible ? 'success.main' : undefined,
                          color: compatible ? '#fff' : 'text.secondary',
                          borderColor: compatible ? 'transparent' : 'divider',
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ActionSnackbar
        text={snackbarState.snackbarText}
        errorText={snackbarState.clipBoardContent}
        open={snackbarOpen}
        setOpen={setSnackbarOpen}
        alertSeverity={snackbarState.alertSeverity}
      />
    </>
  );
}
