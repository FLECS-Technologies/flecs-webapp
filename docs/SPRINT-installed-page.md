# Sprint: Installed Apps — Vercel-Style Redesign + Single-Instance Enforcement

**Date:** 2026-03-03
**Branch:** `feature/ux-redesign`
**Status:** Complete
**CTO Decision:** One instance per app — multi-instance UX is dead.

---

## Problem Statement

1. **"Open app" button (EditorButtons) disappeared** — after the marketplace card redesign, the installed apps page still uses the old table layout with tiny icon-button actions. The "Open" button for apps like MariaDB is buried in a row of 16px icon buttons and only appears when exactly 1 instance exists. Users can't find it.

2. **Table layout is not Vercel-like** — the installed apps page uses a dense MUI `<Table>` with columns (Version, Category, Status, Actions). This is information overload for a device-local SPA. Vercel's project list is clean: icon + name + metadata + prominent CTA.

3. **Multi-instance UX adds complexity for zero value** — CTO confirmed: one instance per app. The current UI has expand/collapse rows, instance sub-rows, "Create & start" buttons, `multiInstance` guards, `showEditors` prop branching, `InstanceStartCreateButtons` split-button, and per-instance Start/Stop/Delete/Info/Settings actions. All of this collapses to a flat list when instances are 1:1 with apps.

4. **Legacy dead code** — `InstalledAppsList`, `InstalledAppsListRow`, `AppInstanceRow`, `InstanceStartCreateButtons`, `AppCard`, `AppGrid`, `InstanceList`, `AppCardSkeleton`, `AppGridSkeleton`, `AppFilter` — none are used by the current page. ~1200 lines of dead weight.

---

## Design: Vercel-Style App List

Replace the MUI `<Table>` with a clean card-list. Each app is a single row-card (not a table row).

### Layout per app row

```
┌──────────────────────────────────────────────────────────────────────┐
│  [48px Avatar]   App Title                    [Open ▸]  [•••]       │
│                  by Author · v3.2.1           ← prominent CTA       │
│                  ● Running                                          │
└──────────────────────────────────────────────────────────────────────┘
```

**Key design decisions:**

| Element | Design |
|---------|--------|
| **Container** | `Paper variant="outlined"` with `borderRadius: 3`, vertical `Stack` of rows, `Divider` between |
| **App identity** | 48px `Avatar` + title (bold) + author + version (monospace caption) |
| **Status** | `AppStatusDot` + label ("Running" / "Stopped" / "Not created") inline below title |
| **Primary CTA — "Open"** | `EditorButtons` rendered as a styled `Button` (not icon-only). Always visible at app level. Disabled when instance not running. If no editors → hidden. |
| **Overflow menu** | `IconButton` with `MoreHorizontal` → `Menu` with: Start, Stop, Settings, Info, Uninstall, Docs |
| **No expand/collapse** | Gone. One instance = flat row. Instance actions live in the overflow menu. |
| **No Category column** | Removed from list view (already in marketplace FullCard) |
| **Responsive** | Single column. On mobile, "Open" button shrinks to icon-only `ExternalLink`. |

### Empty state

Keep existing `EmptyApps` component with Marketplace CTA.

### Toolbar

Keep `AppsToolbar` (Export, Import, Sideload) below the list. No changes.

---

## Phases

### Phase 1: Single-Instance Enforcement (cleanup)

**Goal:** Remove all multi-instance UX code. The data model stays (API still returns an instances array), but the UI always picks `instances[0]`.

**Files to modify:**

| File | Change |
|------|--------|
| `InstalledAppRow.tsx` | Remove: expand/collapse, instance sub-rows, `showEditors` branching, Plus button, `createNewInstance()`. Always read `instances[0]` for status/editors/actions. |
| `InstanceRow.tsx` | Will be absorbed into the new `AppRow` — no standalone instance rows needed. |
| `EditorButtons.tsx` | Remove `showEditors` prop dependency from call sites. Always render at app level. |

**Files to delete (dead code):**

| File | Reason |
|------|--------|
| `InstalledAppsList.tsx` | Legacy list — not imported anywhere active |
| `InstalledAppsListRow.tsx` | Legacy row — only used by above |
| `AppInstanceRow.tsx` | Legacy instance row — only used by above |
| `InstanceStartCreateButtons.tsx` + test | Multi-instance "Create & start" split-button — only used by legacy |
| `AppCard.tsx` | Card-grid view — not used by InstalledApps page |
| `AppGrid.tsx` | Grid layout for cards — not used |
| `InstanceList.tsx` | Multi-instance list — not used when 1:1 |
| `AppCardSkeleton.tsx` | Skeleton for unused card |
| `AppGridSkeleton.tsx` | Skeleton for unused grid |
| `AppFilter.tsx` | Legacy filter — not used by current page |

**Barrel update:** Clean `features/apps/index.ts` — remove all dead exports.

**Estimated lines removed:** ~1200

### Phase 2: Vercel-Style App Row Component

**Goal:** Replace `InstalledAppsTable` + `InstalledAppRow` with a new `AppRow` component inside a simple `Paper` container.

**New component:** `InstalledAppRow.tsx` (rewrite in place)

```tsx
// Simplified structure — single instance, flat row
function InstalledAppRow({ app }: { app: App }) {
  const instance = app.instances?.[0];
  const isRunning = instance?.status === 'running';

  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 3, py: 2 }}>
      {/* Identity */}
      <Avatar src={app.avatar} sx={{ width: 48, height: 48 }} />
      <Box sx={{ flex: 1 }}>
        <Typography fontWeight={700}>{app.title}</Typography>
        <Typography variant="caption" color="text.secondary">
          by {app.author} · v{app.appKey.version}
        </Typography>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <AppStatusDot status={instance?.status} size={8} />
          <Typography variant="caption">{statusLabel}</Typography>
        </Stack>
      </Box>

      {/* Primary CTA: Open app */}
      {instance && <EditorButtons instance={instance} />}

      {/* Overflow menu: Start/Stop/Settings/Info/Uninstall/Docs */}
      <OverflowMenu instance={instance} app={app} />
    </Stack>
  );
}
```

**New component:** `InstalledAppsTable.tsx` (rewrite in place)

```tsx
function InstalledAppsTable({ apps }: { apps: App[] }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Stack divider={<Divider />}>
        {apps.map((app) => (
          <InstalledAppRow key={app.appKey.name} app={app} />
        ))}
      </Stack>
    </Paper>
  );
}
```

### Phase 3: Overflow Menu + Instance Actions

**Goal:** Move Start, Stop, Settings, Info, Delete/Uninstall into a `MoreHorizontal` overflow menu.

**New component:** Inline in `InstalledAppRow.tsx` — no separate file needed (KISS).

```tsx
// Inside InstalledAppRow
<IconButton onClick={openMenu}>
  <MoreHorizontal size={18} />
</IconButton>
<Menu anchorEl={anchor} open={!!anchor} onClose={closeMenu}>
  {instance?.status === 'stopped' && <MenuItem onClick={start}>Start</MenuItem>}
  {instance?.status === 'running' && <MenuItem onClick={stop}>Stop</MenuItem>}
  <MenuItem onClick={openSettings}>Settings</MenuItem>
  <MenuItem onClick={openInfo}>Info & Logs</MenuItem>
  {app.documentationUrl && <MenuItem onClick={openDocs}>Documentation</MenuItem>}
  <Divider />
  <MenuItem onClick={uninstall} sx={{ color: 'error.main' }}>Uninstall</MenuItem>
</Menu>
```

Dialogs (`InstanceConfigDialog`, `InstanceInfo`, `ConfirmDialog`) rendered via portal as before.

### Phase 4: Page Polish

**Goal:** Update `InstalledApps.tsx` page to match marketplace Vercel aesthetic.

| Change | Detail |
|--------|--------|
| Header | Clean: "Installed Apps" h4 + "{N} apps active on this device" — already done |
| Skeleton | Update `TableSkeleton` to match new row-card layout |
| Transitions | `<Fade>` or `<Grow>` on list mount |
| Hover state | Subtle `bgcolor` on row hover |

### Phase 5: EditorButtons Style Upgrade (Optional)

**Goal:** Restyle `EditorButtons` from a `ButtonGroup variant="contained"` to match the Vercel aesthetic.

Current: heavy blue `ButtonGroup` with "Open {name}" label.
Target: clean outlined button with `ExternalLink` icon, matches row style.

---

## Out of Scope

- No routing changes (no `/apps/:id` detail page — KISS, keep dialogs)
- No TanStack Query migration for instance actions (future sprint)
- No `InstanceConfigDialog` redesign (works fine, 5-tab dialog stays)
- No `multiInstance` removal from API types/schemas (backend still sends it)
- No changes to `InstanceRow.tsx` standalone — will be deleted or absorbed

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Breaking instance Start/Stop/Delete | Keep exact same API calls, just move from `InstanceRow` into overflow menu handler |
| EditorButtons regression | No logic change — just always render at app level instead of branching on instance count |
| Snackbar rendering | Keep `ReactDOM.createPortal` to `document.body` pattern |
| `appKey` undefined crashes | Already guarded in `app-queries.ts` with `.filter()` |

---

## Success Criteria

- [ ] "Open" button visible and prominent for every app with editors (e.g., MariaDB)
- [ ] Start/Stop/Settings/Info accessible from overflow menu
- [ ] No expand/collapse — flat list
- [ ] No "Create & start instance" button
- [ ] No `multiInstance` branching in any active component
- [ ] ~1200 lines of dead code deleted
- [ ] All existing tests pass
- [ ] Build stays under 345KB gzip
