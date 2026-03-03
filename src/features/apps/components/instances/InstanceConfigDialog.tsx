/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import {
  X,
  Usb,
  Network,
  Cable,
  Variable,
  ExternalLink,
  GitBranch,
} from 'lucide-react';
import UsbConfigTab from './tabs/UsbConfigTab';
import NetworkConfigTab from './tabs/NetworkConfigTab';
import PortsConfigTab from './tabs/PortsConfigTab';
import EnvironmentConfigTab from './tabs/EnvironmentConfigTab';
import EditorConfigTab from './tabs/EditorConfigTab';
import { useProtectedApi } from '@shared/api/ApiProvider';

interface InstanceConfigDialogProps {
  instanceId: string;
  instanceName: string;
  open: boolean;
  onClose: () => void;
  /** Optional: pass app + version data to show version section */
  versionSection?: React.ReactNode;
}

const sections = [
  { key: 'usb', label: 'USB Devices', icon: Usb },
  { key: 'network', label: 'Network', icon: Network },
  { key: 'ports', label: 'Ports', icon: Cable },
  { key: 'env', label: 'Environment', icon: Variable },
  { key: 'editors', label: 'Editors', icon: ExternalLink },
] as const;

type SectionKey = (typeof sections)[number]['key'] | 'version';

const InstanceConfigDialog: React.FC<InstanceConfigDialogProps> = ({
  instanceId,
  instanceName,
  open,
  onClose,
  versionSection,
}) => {
  const [activeSection, setActiveSection] = useState<SectionKey>(
    versionSection ? 'version' : 'usb',
  );
  const [hasChanges, setHasChanges] = useState(false);
  const api = useProtectedApi();

  const handleClose = async () => {
    if (hasChanges) {
      try {
        await api.instances.instancesInstanceIdStopPost(instanceId);
        await api.instances.instancesInstanceIdStartPost(instanceId);
      } catch {
        // best-effort restart
      }
    }
    setHasChanges(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            height: '70vh',
            maxHeight: 640,
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0, display: 'flex', height: '100%' }}>
        {/* ─── Sidebar ─── */}
        <Box
          sx={{
            width: 220,
            flexShrink: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'grey.50',
          }}
        >
          <Box sx={{ px: 2.5, py: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {instanceName}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Settings
            </Typography>
          </Box>

          <Divider />

          <List dense sx={{ flex: 1, py: 1 }}>
            {versionSection && (
              <ListItemButton
                selected={activeSection === 'version'}
                onClick={() => setActiveSection('version')}
                sx={{
                  mx: 1,
                  borderRadius: 1.5,
                  mb: 0.25,
                  '&.Mui-selected': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.06)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <GitBranch size={16} />
                </ListItemIcon>
                <ListItemText
                  primary="Version"
                  primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                />
              </ListItemButton>
            )}
            {sections.map(({ key, label, icon: Icon }) => (
              <ListItemButton
                key={key}
                selected={activeSection === key}
                onClick={() => setActiveSection(key)}
                sx={{
                  mx: 1,
                  borderRadius: 1.5,
                  mb: 0.25,
                  '&.Mui-selected': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.06)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Icon size={16} />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                />
              </ListItemButton>
            ))}
          </List>

          <Divider />
          <Box sx={{ p: 1.5 }}>
            <Button
              fullWidth
              variant={hasChanges ? 'contained' : 'outlined'}
              color={hasChanges ? 'primary' : 'inherit'}
              size="small"
              onClick={handleClose}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                borderColor: hasChanges ? undefined : 'divider',
              }}
            >
              {hasChanges ? 'Save & Restart' : 'Close'}
            </Button>
          </Box>
        </Box>

        {/* ─── Content ─── */}
        <Box sx={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          {/* Close button */}
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              position: 'absolute',
              right: 12,
              top: 12,
              zIndex: 1,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              '&:hover': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
              },
            }}
          >
            <X size={16} />
          </IconButton>

          <Box sx={{ p: 3 }}>
            {/* Section header */}
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
              {activeSection === 'version'
                ? 'Version'
                : sections.find((s) => s.key === activeSection)?.label}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {activeSection === 'version' && 'Change or update the app version.'}
              {activeSection === 'usb' && 'Configure USB device passthrough.'}
              {activeSection === 'network' && 'Configure network interfaces.'}
              {activeSection === 'ports' && 'Configure port mappings.'}
              {activeSection === 'env' && 'Configure environment variables.'}
              {activeSection === 'editors' && 'Configure editor URLs and reverse proxy.'}
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* Tab content */}
            {activeSection === 'version' && versionSection}
            {activeSection === 'usb' && (
              <UsbConfigTab instanceId={instanceId} onChange={setHasChanges} />
            )}
            {activeSection === 'network' && (
              <NetworkConfigTab instanceId={instanceId} onChange={setHasChanges} />
            )}
            {activeSection === 'ports' && (
              <PortsConfigTab instanceId={instanceId} onChange={setHasChanges} />
            )}
            {activeSection === 'env' && (
              <EnvironmentConfigTab instanceId={instanceId} onChange={setHasChanges} />
            )}
            {activeSection === 'editors' && (
              <EditorConfigTab instanceId={instanceId} onChange={setHasChanges} />
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default InstanceConfigDialog;
