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
import { Search, LayoutGrid, Store, Network, Settings, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

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

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[1300]"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div
        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg rounded-xl bg-dark-end border border-white/10 shadow-2xl z-[1301] overflow-hidden"
        aria-label="Command palette"
      >
        <div className="flex items-center px-4 py-3 border-b border-white/10">
          <Search size={20} className="mr-3 opacity-50" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none text-base placeholder:text-muted"
            placeholder="Search pages, commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search commands"
          />
          <span className="ml-2 px-1.5 py-0.5 rounded border border-white/10 text-[11px] text-muted">
            ESC
          </span>
        </div>

        <div role="listbox" className="max-h-80 overflow-auto py-2">
          {filtered.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-muted">No results for "{query}"</p>
            </div>
          )}
          {filtered.map((item, index) => (
            <button
              key={item.id}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={item.action}
              className={`flex items-center w-[calc(100%-16px)] mx-2 px-3 py-2 rounded-md transition ${
                index === selectedIndex ? 'bg-brand/15' : 'hover:bg-white/5'
              }`}
            >
              <span className="w-9 shrink-0 flex justify-center">{item.icon}</span>
              <span className="flex-1 text-left">
                <span className="text-sm font-medium block">{item.label}</span>
                {item.description && (
                  <span className="text-xs text-muted block">{item.description}</span>
                )}
              </span>
              <ArrowRight size={14} className="opacity-30" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
