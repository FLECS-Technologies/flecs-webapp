/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Dialog,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { Search, LayoutGrid, Store, Network, Settings, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { brand } from '@app/theme/tokens';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const go = useCallback(
    (path: string) => {
      navigate(path);
      setOpen(false);
    },
    [navigate],
  );

  const commands: CommandItem[] = useMemo(
    () => [
      { id: 'apps', label: 'Apps', description: 'Installed applications', icon: <LayoutGrid size={18} />, action: () => go('/'), category: 'Navigation' },
      { id: 'marketplace', label: 'Marketplace', description: 'Browse and install apps', icon: <Store size={18} />, action: () => go('/marketplace'), category: 'Navigation' },
      { id: 'mesh', label: 'Service Mesh', description: 'Network mesh configuration', icon: <Network size={18} />, action: () => go('/service-mesh'), category: 'Navigation' },
      { id: 'system', label: 'System', description: 'Device info, license, exports', icon: <Settings size={18} />, action: () => go('/system'), category: 'Navigation' },
      { id: 'licenses', label: 'Open Source Licenses', description: 'Third-party licenses', icon: <FileText size={18} />, action: () => go('/open-source'), category: 'Navigation' },
    ],
    [go],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
    );
  }, [query, commands]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Keyboard navigation inside the palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      filtered[selectedIndex].action();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="sm"
      fullWidth
      aria-label="Command palette"
      PaperProps={{
        sx: {
          position: 'fixed',
          top: '20%',
          m: 0,
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
      slotProps={{
        backdrop: { sx: { bgcolor: 'rgba(0,0,0,0.5)' } },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Search size={20} style={{ marginRight: 12, opacity: 0.5 }} />
        <InputBase
          inputRef={inputRef}
          autoFocus
          fullWidth
          placeholder="Search pages, commands..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ fontSize: '1rem' }}
          aria-label="Search commands"
        />
        <Chip label="ESC" size="small" variant="outlined" sx={{ ml: 1, fontSize: 11 }} />
      </Box>

      <List role="listbox" sx={{ maxHeight: 320, overflow: 'auto', py: 1 }}>
        {filtered.length === 0 && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No results for "{query}"
            </Typography>
          </Box>
        )}
        {filtered.map((item, index) => (
          <ListItemButton
            key={item.id}
            role="option"
            aria-selected={index === selectedIndex}
            selected={index === selectedIndex}
            onClick={item.action}
            sx={{
              mx: 1,
              borderRadius: 1.5,
              '&.Mui-selected': { bgcolor: `${brand.primary}20` },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              secondary={item.description}
              slotProps={{
                primary: { variant: 'body2', fontWeight: 500 },
                secondary: { variant: 'caption' },
              }}
            />
            <ArrowRight size={14} style={{ opacity: 0.3 }} />
          </ListItemButton>
        ))}
      </List>
    </Dialog>
  );
}
