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
  DialogTitle,
  Box,
  Avatar,
  Typography,
  Chip,
  Button,
  Divider,
  IconButton,
  Rating,
  Stack,
  Card,
  CardContent,
  Alert,
} from '@mui/material';

import { Close, CheckCircle, Launch, Update, ShoppingCart, OpenInNew } from '@mui/icons-material';
import { App } from '../../../models/app';
import { SystemContextType } from '../../../models/system';
import { useSystemContext } from '@contexts/data/SystemProvider';
import { isBlacklisted } from '../../../api/marketplace/ProductService';
import { createVersion, createVersions, getLatestVersion } from '../../../utils/version-utils';
import { Version } from '../../../models/version';
import { EditorButtons } from '../../instances/tabs/editors/EditorButtons';
import { VersionSelector } from '../../ui/VersionSelector';
import UninstallButton from '../../buttons/app/UninstallButton';
import ActionSnackbar from '../../ui/ActionSnackbar';
import InstallButton from '../../../components/buttons/app/InstallButton';
import UpdateButton from '../../../components/buttons/app/UpdateButton';

interface FullCardProps {
  app: App;
  open: boolean;
  onClose: () => void;
}

export default function FullCard({ app, open, onClose }: FullCardProps) {
  const { systemInfo } = useSystemContext() as SystemContextType;
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
    const alertSeverity = success ? 'success' : 'error';
    setSnackbarState({
      alertSeverity,
      snackbarText: message,
      clipBoardContent: error || '',
    });
    setSnackbarOpen(true);
  };

  const rating = app.average_rating ? parseFloat(app.average_rating) : 0;
  const ratingCount = app.rating_count || 0;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={onClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                zIndex: 1,
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box>
            {/* Header Section */}
            <Box
              sx={(theme) => ({
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.main} 100%)`,
                p: 4,
                pb: 3,
              })}
            >
              <Stack direction="row" spacing={3} alignItems="flex-start">
                <Avatar
                  src={app.avatar}
                  variant="rounded"
                  sx={{
                    width: 120,
                    height: 120,
                    p: 1.5,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    {/* Title */}
                    <Typography variant="h4">{app.title}</Typography>
                    {updateAvailable && (
                      <Chip icon={<Update />} label="Update" color="info" size="small" />
                    )}
                    {installed && !updateAvailable && (
                      <Chip icon={<CheckCircle />} label="Installed" color="success" size="small" />
                    )}
                  </Stack>
                  {/* Author */}
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    by {app.author || 'Unknown'}
                  </Typography>

                  {/* Rating */}
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Rating value={rating} precision={0.1} readOnly size="small" />
                    <Typography variant="body2">
                      {rating.toFixed(1)} ({ratingCount} {ratingCount === 1 ? 'review' : 'reviews'})
                    </Typography>
                  </Stack>

                  {/* Categories */}
                  {app.categories && app.categories.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {app.categories.map((category: any, index) => (
                        <Chip
                          key={category.id || index}
                          label={category.name || category}
                          size="small"
                        />
                      ))}
                    </Stack>
                  )}
                  <Typography variant="overline" component="div">
                    {parse(app.short_description || '')}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ px: 4, py: 3, bgcolor: 'background.paper' }}>
              {/* Version Selector */}
              {versionsArray.length > 0 && (
                <VersionSelector
                  availableVersions={versionsArray}
                  selectedVersion={selectedVersion}
                  setSelectedVersion={setSelectedVersion}
                />
              )}

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                {!installed && (
                  <InstallButton
                    app={app}
                    version={selectedVersion}
                    disabled={!installable || blackListed}
                    showSelectedVersion={true}
                  ></InstallButton>
                )}
                {installed && app.instances && <EditorButtons instance={app.instances[0]} />}

                {selectedVersionNotInstalled && (
                  <UpdateButton
                    app={app}
                    to={selectedVersion}
                    showSelectedVersion={true}
                  ></UpdateButton>
                )}
                {installed && (
                  <UninstallButton
                    app={app}
                    selectedVersion={selectedVersion}
                    variant="button"
                    onUninstallComplete={handleUninstallComplete}
                  />
                )}
                {app.purchasable && app.permalink && Number(app.price) > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<ShoppingCart />}
                    endIcon={<Launch />}
                    href={app.permalink}
                    target="_blank"
                    fullWidth
                  >
                    Purchase License
                  </Button>
                )}
              </Stack>
              {!installable && app.requirement && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    {app.title} is not compatible with your system architecture ({systemInfo?.arch}
                    ). Required: {app.requirement.join(' or ')}
                  </Typography>
                </Alert>
              )}
            </Box>

            <Divider />

            {/* Content Section */}
            <Box sx={{ px: 4, py: 3 }}>
              <Card variant="outlined">
                <CardContent sx={{ p: 3 }}>
                  {/* About this app */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      About this app
                      <IconButton href={app.permalink || ''} target="_blank">
                        <OpenInNew />
                      </IconButton>
                    </Typography>

                    {/* Description */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body1" color="text.secondary" component="div">
                        {parse(
                          app.description || app.short_description || 'No description available.',
                        )}
                      </Typography>
                    </Box>

                    {/* Documentation Link */}
                    {app.documentationUrl && (
                      <Button
                        variant="outlined"
                        startIcon={<Launch />}
                        href={app.documentationUrl}
                        target="_blank"
                      >
                        Documentation
                      </Button>
                    )}
                  </Box>

                  {/* System Requirements */}
                  {app.requirement && app.requirement.length > 0 && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Box>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          System Requirements
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                          sx={{ mb: 1 }}
                        >
                          {app.requirement.map((req) => (
                            <Chip
                              key={req}
                              label={req}
                              size="small"
                              color={
                                systemInfo?.arch &&
                                req.toLowerCase().includes(systemInfo.arch.toLowerCase())
                                  ? 'success'
                                  : 'default'
                              }
                            />
                          ))}
                        </Stack>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      {/* Snackbar for notifications */}
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
