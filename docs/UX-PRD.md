# UX PRD — Dashboard Redesign

**Version:** 1.0
**Date:** 2026-03-03
**Status:** Draft
**Inspiration:** Writeso marketplace UI (B2B SaaS app store pattern)

---

## 1. Design Philosophy

**Core insight from the reference:** The Writeso UI feels expensive because it does three things perfectly — structured sidebar with semantic grouping, prominent search as a first-class citizen, and information-dense cards that don't feel cluttered.

FLECS is **device-local IoT management**, not a cloud SaaS product. But the UX patterns are universal: operators need to find things fast, understand status at a glance, and act with confidence. We adopt the polish, not the context.

**Guiding rules:**
- Every pixel earns its space. No decorative chrome.
- Status is ambient (always visible, never interrupting).
- Search is the fastest path to anything.
- Cards are scannable in under 2 seconds.
- Dark-mode-first. FLECS brand: `#FF2E63` primary, `#0B0B18` dark.

---

## 2. Sidebar Redesign

### Current state
Flat list of 4 items: Apps, Marketplace, Service Mesh | System. No grouping, no counts, no user context.

### Target state

```
┌──────────────────────┐
│  [FLECS Logo] FLECS  │  ← stays, but logo area cleaner
│                      │
│  APPS                │  ← section label (overline, muted)
│  ● Installed    (3)  │  ← LayoutGrid icon, count badge
│  ● Marketplace (12)  │  ← Store icon, count badge
│                      │
│  DEVICE              │  ← section label
│  ● Service Mesh      │  ← Network icon
│  ● System            │  ← Settings icon
│                      │
│                      │
│  ─────────────────── │
│  [avatar] hostname   │  ← device identity at bottom
│           192.168.x  │  ← IP address, muted
└──────────────────────┘
```

### Changes

| Element | Current | Target |
|---------|---------|--------|
| Nav grouping | Flat list + divider | Semantic sections: "APPS", "DEVICE" |
| Section labels | None | Overline typography, `text.disabled` color, `px: 3`, `pt: 2` |
| Count badges | None | Chip or inline count for Installed (running apps) and Marketplace (total available) |
| Device identity | None | Bottom section: hostname + IP from `useSystemInfo()` |
| Active state | Pink bg + primary color | Same — already matches reference |
| Width | 220px | 220px (keep) |

### Count badge data sources
- **Installed count:** `appList.filter(a => a.status === 'installed').length` from `useAppList()`
- **Marketplace count:** `products.length` from `useMarketplaceProducts()` (only if already cached, don't fetch on mount)
- **Device hostname:** `window.location.hostname`
- **Device IP:** Already available from `useSystemInfo()`

### Implementation notes
- Section labels are plain `Typography variant="overline"` — no new component needed
- Count badges: `Typography variant="caption"` right-aligned in the `ListItemButton`, muted color
- Device footer: `Box` pinned to bottom of drawer with `mt: 'auto'`
- Don't fetch marketplace data just for the sidebar count — use TanStack Query cache (`staleTime: Infinity` + only populate when marketplace page loads)

---

## 3. Top Bar — Search Promotion

### Current state
AppBar has: logo (left), help + notifications + theme toggle + user (right). Search lives inside each page.

### Target state

```
┌─[FLECS]──[Search apps, instances, settings...  ⌘K]──[🔔]─[☀]─[👤]─┐
```

### Changes

| Element | Current | Target |
|---------|---------|--------|
| Search | Per-page (Marketplace only) | Global in AppBar, center position |
| Search trigger | Text input | Clickable pill that opens CommandPalette (`⌘K`) |
| Help icon | HelpCircle in AppBar | Move to sidebar bottom or System page |
| Layout | Logo left, icons right | Logo left, search center, icons right |

### Search pill spec
- Not a real input — a `Button` styled as a search bar
- Click opens `CommandPalette` (already exists at `shared/components/layout/CommandPalette.tsx`)
- Shows: `Search icon + "Search..." + ⌘K badge`
- `bgcolor: action.hover`, `borderRadius: 2`, `px: 2`, `py: 0.75`
- `minWidth: 280px` on desktop, icon-only on mobile
- The existing `CommandPalette` already handles navigation search — this just makes it more discoverable

### What NOT to change
- Notifications bell stays (with badge)
- Theme toggle stays
- User menu stays
- Mobile hamburger stays

---

## 4. Marketplace Page — Card Redesign

### Current state
Already close to the reference. Cards have: icon, title, description, install button. Missing: author line, rating, price.

### Target state (per card)

```
┌────────────────────────────────────────────┐
│  [icon]  App Name                          │
│          Publisher Name                     │
│          ★★★★★ 4.9                         │
│                                            │
│  Description text that wraps to two        │
│  lines maximum with ellipsis...            │
│                                            │
│  Free                          [Get]       │
│  — or —                                    │
│  $29/mo                    [✓ Installed]   │
└────────────────────────────────────────────┘
```

### Changes

| Element | Current | Target |
|---------|---------|--------|
| Author line | Not shown | Below title, `caption` variant, muted |
| Star rating | Not shown on card | Inline stars + numeric, `caption` variant |
| Price | Not shown | Bottom-left, `body2` bold or "Free" |
| Install button | Full-width outlined | Compact button bottom-right: "Get" (outlined) or "Installed" (success chip) |
| Description | 2-line clamp | Keep 2-line clamp, but move below author/rating block |
| Card click | Opens FullCard dialog | Keep — same behavior |
| Layout | Icon left, text right | Icon left, structured info block right (name → author → rating → description) |

### Card visual spec
Each card must have a **visible border at rest** — not just on hover. This is the key visual pattern from the reference: cards feel like distinct, tangible objects on the page.

- `variant="outlined"` (MUI Card — renders `1px solid divider` border)
- `borderRadius: 3` (12px)
- `border: '1px solid'`, `borderColor: 'divider'` — visible in default state (light gray in light mode, subtle white in dark mode)
- **Hover:** `borderColor: 'primary.main'` + subtle shadow. No `translateY` lift (reference doesn't lift — it just highlights the border).
- **No background fill difference** — card bg matches page bg (or paper). The border alone creates separation.
- **Generous internal padding:** `p: 2.5` (20px) content area, `px: 2.5, pb: 2` footer

### Card layout structure
```tsx
<Card
  variant="outlined"
  sx={{
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    '&:hover': {
      borderColor: 'primary.main',
      boxShadow: (theme) =>
        theme.palette.mode === 'dark'
          ? '0 4px 12px rgba(0,0,0,0.3)'
          : '0 4px 12px rgba(0,0,0,0.06)',
    },
  }}
>
  <Box p={2.5} flex={1}>
    <Stack direction="row" spacing={2}>
      <Avatar 48x48 />
      <Box flex={1}>
        <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
        <Typography variant="caption" color="text.secondary">{author}</Typography>
        <Stack direction="row" spacing={0.5} alignItems="center">
          {/* star icons + rating number */}
        </Stack>
      </Box>
    </Stack>
    <Typography variant="body2" mt={1.5} lineClamp={2}>{description}</Typography>
  </Box>
  <Stack direction="row" justifyContent="space-between" alignItems="center" px={2.5} pb={2}>
    <Typography variant="body2" fontWeight={600}>{price || 'Free'}</Typography>
    <Button variant="outlined" size="small">{installed ? '✓ Installed' : 'Get'}</Button>
  </Stack>
</Card>
```

### Data sources (already available)
- `author`: `getAuthor(product)` — already parsed, just not rendered on card
- `average_rating`: `getAverageRating(product)` — already prop on Card
- `price`: `getPrice(product)` — already parsed in `Marketplace.tsx`
- No new API calls needed

### Star rating component
- Simple inline: 5 `Star` icons (filled/unfilled from lucide-react) at 12px + numeric value
- No new dependency — just map over `[1,2,3,4,5]` and compare to `average_rating`
- Reusable: `shared/components/StarRating.tsx`

---

## 5. Marketplace Page — Header & Filters

### Current state
Title "FLECS Marketplace" + "500+ Apps" chip + subtitle + category chips + search bar + filter toggle.

### Target state

```
  MARKETPLACE                                            [Browse] [Installed]
  Browse Apps
  Extend your device with 12 integrations.

  [★ 4+ ×]  [Category ×]                                12 apps available

  ┌──────────────────────────────────────────────────────────────────────┐
  │  card   card   card                                                 │
```

### Changes

| Element | Current | Target |
|---------|---------|--------|
| Section label | None | "MARKETPLACE" overline above heading |
| Heading | "FLECS Marketplace" | "Browse Apps" (shorter, action-oriented) |
| Subtitle | "Choose from our curated collection..." | "Extend your device with {n} integrations." |
| Tabs | None | "Browse" / "Installed" toggle (ToggleButtonGroup) top-right of header |
| Category chips | Toggle opacity (show/hide) | Dismissable filter chips with ×, only shown when active |
| App count | "500+ Apps" chip next to title | "12 apps available" text below filters, left-aligned |
| Search | Separate MarketplaceSearch row | Merged into global AppBar search (see section 3) |
| Category selection | Click chips to hide categories | Move to filter dropdown (button with popover + checkboxes) |
| Filter badge | None | Filters button shows active count badge (like reference: "Filters 1") |

### Browse / Installed toggle
- `ToggleButtonGroup` with two options
- "Browse" = default marketplace view (current page)
- "Installed" = navigates to `/` (InstalledApps page) — or renders InstalledApps inline
- **Decision needed:** Navigate vs inline render. **Recommendation: Navigate.** Keeps pages thin, avoids loading both datasets. The toggle is a navigation affordance, not a tab.

### Filter system redesign
- **Current:** Categories shown as always-visible colored dots. Clicking hides a category.
- **Target:** "Filters" button (top-right, near toggle) that opens a Popover with:
  - Category checkboxes (all checked by default)
  - Rating minimum (slider or preset chips: 3+, 4+, 4.5+)
  - Availability toggle
- Active filters shown as dismissable chips below the header
- Filter count badge on the Filters button (e.g., "Filters (2)")

---

## 6. Installed Apps Page

### Current state
AppsToolbar (title + export/import/sideload) → AppGrid (card grid with expandable instances).

### Key insight from reference
**Browse = cards (discovery). Installed = table (management).** The reference uses a data table for installed apps — information-dense, scannable, actions right-aligned. This is the correct pattern: once you've installed an app, you need status-at-a-glance and quick actions, not visual browsing.

### Target state

```
  APPS                                                        [⟳ Update All]
  Installed Apps
  3 apps active on this device. 1 update available.

  ┌──────────────────────────────────────────────────────────────────────────┐
  │  APPLICATION          VERSION    CATEGORY     STATUS         ACTIONS     │
  │──────────────────────────────────────────────────────────────────────────│
  │  [icon] Node-RED      v3.1.0     Automation   ● Running      [▶][⚙][✕] │
  │    └─ instance-1      v3.1.0                  ● Running      [■][📝][i] │
  │    └─ instance-2      v3.1.0                  ● Stopped      [▶][📝][i] │
  │──────────────────────────────────────────────────────────────────────────│
  │  [icon] MQTT Broker   v2.0.5     Messaging    ● Running      [▶][⚙][✕] │
  │──────────────────────────────────────────────────────────────────────────│
  │  [icon] Grafana       v10.2.1    Monitoring   ● Update avail [↑][⚙][✕] │
  └──────────────────────────────────────────────────────────────────────────┘

  [Export] [Import] [Sideload]
```

### Changes

| Element | Current | Target |
|---------|---------|--------|
| Layout | **Card grid** (responsive columns) | **Data table** inside a bordered Paper |
| Section label | None | "APPS" overline above heading |
| Heading | "Installed Apps" (in toolbar) | "Installed Apps" as `h4`, below overline |
| Subtitle | None | "{n} apps active on this device. {m} update(s) available." |
| Update All | None | Top-right button with RefreshCw icon (only visible when updates available) |
| Toolbar actions | Inline with title | Below table: Export, Import, Sideload buttons |
| Per-app display | Card with avatar, title, expand | Table row: icon + name/author, version, category, status chip, actions |
| Instances | Expandable card section | Indented sub-rows below parent (like a tree) |
| Status | Small dot + instance count chip | Chip: "● Running" (green), "● Stopped" (gray), "● Update available" (amber) |
| Actions | Icon buttons in card footer | Right-aligned buttons: context-dependent (Start/Stop, Settings, Remove, Update) |

### Table spec

**Container:**
- `Paper` or `Card` with `variant="outlined"`, `borderRadius: 3`, `border: '1px solid'`, `borderColor: 'divider'`
- No outer shadow — border creates separation (matches marketplace cards)

**Column headers:**
- `Typography variant="overline"`, `color: text.disabled`
- Columns: APPLICATION (flex: 2), VERSION, CATEGORY, STATUS, ACTIONS (right-aligned)
- Sticky header if table scrolls (unlikely with <20 apps, but future-proof)

**App rows:**
- Height: ~64px
- Icon: `Avatar` 36×36, rounded, left of name
- Name: `subtitle2`, `fontWeight: 700`
- Author/publisher: `caption`, `color: text.secondary`, below name
- Version: `body2`, monospace feel (use `fontFamily: 'monospace'` or just regular)
- Category: `body2`, `color: text.secondary`
- Status chip: small `Chip` with colored dot prefix
  - Running: green dot + "Active" text, `color="success"` variant="outlined"
  - Stopped: gray dot + "Stopped" text, default variant="outlined"
  - Update available: amber dot + "Update available" text, `color="warning"` variant="outlined"
- Actions: `IconButton` group, right-aligned
  - **Running app:** Stop (Square), Settings (Settings), Remove (Trash2)
  - **Stopped app:** Start (Play), Settings (Settings), Remove (Trash2)
  - **Update available:** Update (RefreshCw), Settings (Settings), Remove (Trash2)
- Row divider: `1px solid divider` between rows
- Hover: subtle `bgcolor: action.hover`

**Instance sub-rows (FLECS-specific, not in reference):**
- Indented with `pl: 7` (to clear the app icon column)
- Tree connector: `└─` prefix or just indentation
- Smaller row height: ~48px
- Instance name + version + status dot + instance-specific actions (Start/Stop, Editor, Info, Delete)
- Toggle: clicking the app row expands/collapses its instances (ChevronDown/ChevronUp on the row)
- Sub-rows have slightly muted background: `bgcolor: action.hover` at 50% opacity

**Empty state:**
- Same as current EmptyApps: centered icon + "No apps installed" + CTA buttons

### "Update All" button
- Position: top-right of page header, aligned with the heading
- Only visible when at least 1 app has an update available
- `Button variant="outlined"` with `RefreshCw` icon + "Update All" text
- Triggers batch update flow

### Data mapping from current AppCard → table row
| Current (AppCard) | Table row |
|-------------------|-----------|
| `app.title` | APPLICATION name |
| `app.author` | APPLICATION subtitle |
| `app.appKey.version` | VERSION column |
| `app.categories?.[0]` | CATEGORY column (first category, or "—" if none) |
| `app.status` + instance count | STATUS chip |
| action icon buttons | ACTIONS column |
| `<Collapse>` + `<InstanceList>` | Instance sub-rows (indented) |

### Responsive behavior
- **Desktop (md+):** Full table with all columns
- **Tablet (sm):** Hide CATEGORY column, compress VERSION
- **Mobile (xs):** Stack layout — each row becomes a mini-card with name + status + actions. Or keep table but only show APPLICATION + STATUS + ACTIONS

---

## 7. System Page

### Current state
"System" heading → 2-column grid (SystemInfoCard, LicenseCard) → VersionCard → QuickActions → ExportsCard.

### Target state

```
  DEVICE
  System
  Device management and configuration.

  ┌─────────────────────────────┐  ┌─────────────────────────────┐
  │  Device                     │  │  License                    │
  │  hostname   192.168.1.x    │  │  ✓ Activated                │
  │  armhf      Debian 11      │  │  Expires: 2027-01-01        │
  │  5.15.0                    │  │                             │
  └─────────────────────────────┘  └─────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────┐
  │  FLECS Version                                                  │
  └─────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────┐
  │  Quick Actions          [Export]  [Import]  [Open Source]       │
  └─────────────────────────────────────────────────────────────────┘
```

### Changes
- Add section label "DEVICE" overline + subtitle
- Otherwise keep current layout — it's already clean and maps well to the reference's card-based sections

---

## 8. Shared Page Header Pattern

Extract a reusable pattern for all pages:

```tsx
// Not a component — just a consistent JSX pattern per page
<Box sx={{ mb: 3 }}>
  <Typography variant="overline" color="text.disabled" fontWeight={600}>
    {sectionLabel}
  </Typography>
  <Typography variant="h4" fontWeight={800}>
    {title}
  </Typography>
  <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
    {subtitle}
  </Typography>
</Box>
```

| Page | Section Label | Title | Subtitle |
|------|--------------|-------|----------|
| Installed Apps | APPS | Installed Apps | {n} apps active on this device. {m} update(s) available. |
| Marketplace | MARKETPLACE | Browse Apps | Extend your device with {n} integrations. |
| Service Mesh | DEVICE | Service Mesh | Network configuration and monitoring. |
| System | DEVICE | System | Device management and configuration. |
| Profile | ACCOUNT | Profile | Your account and authentication. |

---

## 9. What We Keep (Zero Change)

These are already good and match the reference quality:

- **Card hover effects** — border highlight + subtle shadow (remove current `translateY(-2px)` lift to match reference — cards stay flat, border changes color)
- **Responsive grid** — 1→2→3→4→5 columns with breakpoints
- **Empty states** — centered icon + heading + CTA buttons
- **Skeleton loading** — card-shaped skeletons during data fetch
- **CommandPalette** — `⌘K` search (just needs AppBar promotion)
- **Dark mode toggle** — Sun/Moon icons in AppBar
- **Notification bell** — badge with unread count
- **FullCard dialog** — detailed app view with gradient header
- **Expandable instance rows** — unique to FLECS, no equivalent in reference (and that's good)
- **Color palette** — `#FF2E63` primary is distinctive and works

---

## 10. Implementation Priority

### Wave 1: Quick wins (small changes, high visual impact)
1. **Page headers** — Add overline + subtitle to all 4 main pages
2. **Sidebar sections** — Add "APPS" / "DEVICE" grouping labels
3. **Search pill in AppBar** — Button that opens existing CommandPalette
4. **Marketplace card author line** — Render `author` (data already available)

### Wave 2: Medium effort
5. **Marketplace card rating** — StarRating component + render on cards
6. **Marketplace card price + compact button** — Bottom row: price left, "Get" right
7. **Sidebar count badges** — Running app count, marketplace count from cache
8. **Sidebar device footer** — Hostname + IP pinned to bottom

### Wave 3: Structural — Installed Apps table
9. **Installed Apps → table layout** — Replace AppGrid card grid with data table (biggest single change)
10. **Instance sub-rows** — Expandable indented rows below each app in the table
11. **"Update All" button** — Top-right, only visible when updates available

### Wave 4: Structural — Marketplace polish
12. **Filter system redesign** — Popover with checkboxes, dismissable chips, filter badge
13. **Browse/Installed toggle** — ToggleButtonGroup navigation on marketplace/installed headers

---

## 11. Anti-Patterns to Avoid

- **Don't add tabs that load both datasets.** Browse/Installed toggle is navigation, not a tab. Each page fetches its own data.
- **Don't move search into the page.** The AppBar search pill is global. Page-specific filters live in filter popovers.
- **Don't add a left sidebar user section with billing/account.** FLECS is device-local — there is no billing. The reference has "Account / Billing / Settings" because it's a cloud SaaS.
- **Don't add pricing tiers.** FLECS apps are either free or licensed. Show "Free" or the license status, not "$29/mo".
- **Don't create new components for things that can be inline JSX.** The page header pattern (section 8) is 5 lines of JSX, not a `<PageHeader>` component.
- **Don't over-abstract the star rating.** A 10-line inline component is fine. No npm package.
- **Don't build a generic `<DataTable>` component.** The installed apps table is the only table. Inline the JSX in the page or a single `InstalledAppsTable` component.
- **Don't remove AppCard entirely.** It may still be useful for other contexts (e.g., onboarding, quick-add flows). Just stop using it as the primary installed view.

---

## 12. Files to Touch

| File | Change |
|------|--------|
| `shared/components/layout/Drawer.tsx` | Section labels, count badges, device footer |
| `shared/components/layout/AppBar.tsx` | Search pill button, remove help icon |
| `pages/Marketplace.tsx` | Header pattern, Browse/Installed toggle |
| `pages/InstalledApps.tsx` | Full rewrite: header pattern + data table + instance sub-rows |
| `pages/System.tsx` | Header pattern |
| `pages/ServiceMesh.tsx` | Header pattern |
| `pages/Profile.tsx` | Header pattern |
| `features/apps/components/InstalledAppsTable.tsx` | New — table component for installed apps with expandable instance rows |
| `features/apps/components/InstalledAppRow.tsx` | New — single app row with status chip + actions |
| `features/apps/components/InstanceSubRow.tsx` | New — indented instance row (replaces InstanceRow in table context) |
| `features/marketplace/components/cards/Card.tsx` | Author, rating, price, compact button |
| `shared/components/StarRating.tsx` | New — tiny star rating display (10 lines) |
| `features/marketplace/components/MarketplaceSearch.tsx` | May be simplified/removed if search moves to AppBar |
| `features/marketplace/components/CategoryChips.tsx` | Rework into filter popover |

**Estimated scope:** ~10 files modified, 4 new files. No new dependencies.
