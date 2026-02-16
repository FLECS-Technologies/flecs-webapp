# FLECS WebApp Refactoring Specification

**Date Created:** February 9, 2026  
**Last Updated:** February 16, 2026  
**Version:** 1.4.0  
**Current Branch:** refactor-project-structure  
**Status:** Phase 1 Complete ✅ | Phase 2 Complete ✅ | Phase 3 Next ⭐

## Executive Summary

This document outlines a comprehensive refactoring plan for the FLECS WebApp project. After migrating from Create React App (CRA) with react-scripts to Vite and from Jest to Vitest, several legacy artifacts and structural inconsistencies remained.

**Phase 1 Status - ✅ COMPLETED:**
Phase 1 (Legacy Migration Artifacts) has been successfully completed, removing 454 packages (~35% reduction) including all Jest, Babel, and unused dependencies. The project now has a clean, modern testing setup with Vitest, functional VS Code debugging, and reduced technical debt.

**Phase 2 Status - ✅ COMPLETED:**
Phase 2 (Project Structure Improvements) has been successfully completed. Context/provider files consolidated into `src/contexts/` (Step 2.1). Component structure reorganized into 11 feature-based directories with zero loose files in `src/components/` root (Step 2.2, 6 sub-steps). All 668 tests passing across 97 test files.

**Phase Priority:**
Code modernization (Phase 3) is now the main focus, cleaning up React imports and preparing for future TypeScript migration.

**Implementation Phases:**

- Phase 2: **Project Structure Improvements** ✅ COMPLETED (context consolidation, comprehensive reorganization, path aliases)
- Phase 3: Code Modernization ⭐ NEXT (React imports cleanup)
- Phase 4: Final Cleanup (documentation, unused file audit)
- Phase 5: TypeScript Migration (comprehensive type safety)

---

## Table of Contents

1. [Issues Discovered](#issues-discovered)
2. [Refactoring Goals](#refactoring-goals)
3. [Implementation Plan](#implementation-plan)
   - [Phase 1: Legacy Migration Artifacts ✅ COMPLETED](#phase-1-remove-legacy-migration-artifacts--completed)
   - [Phase 2: Project Structure Improvements](#phase-2-project-structure-improvements-medium-risk-high-value) ✅ **COMPLETED**
   - [Phase 3: Code Modernization](#phase-3-code-modernization-low-risk-medium-value)
   - [Phase 4: Final Cleanup](#phase-4-final-cleanup-low-risk-low-value)
   - [Phase 5: TypeScript Migration](#phase-5-typescript-migration-medium-risk-high-value)
4. [Risk Assessment](#risk-assessment)
5. [Success Metrics](#success-metrics)
6. [Implementation Timeline](#implementation-timeline)

---

## Issues Discovered

### 1. Legacy Migration Artifacts

#### 1.1 React-Scripts Leftovers

**Location:** `.vscode/launch.json`

**Issue:** Three debug configurations still reference the non-existent `react-scripts` executable:

- "Debug tests single run" (line 27)
- "Debug tests watch mode" (line 38)
- "Debug tests opened file" (line 49)

**Impact:** Debug configurations are non-functional. Developers cannot debug tests from VS Code.

**Files Affected:**

- `.vscode/launch.json`

---

#### 1.2 Dual Testing Setup (Jest + Vitest)

**Locations:** Multiple configuration files

**Issue:** The project maintains both Jest and Vitest configurations simultaneously:

- `jest.config.js` exists alongside `vite.config.ts` test configuration
- `babel.config.js` primarily serves Jest (Vitest uses esbuild)
- Duplicate test setup files:
  - `src/setupTests.js` (references `@testing-library/jest-dom` and uses `require()`)
  - `src/test/setup.ts` (proper Vitest setup)

**Impact:**

- Confusion about which test runner to use
- Maintenance overhead for duplicate configurations
- Larger bundle with unnecessary dependencies
- Performance degradation (Babel transpilation for Jest vs native ESM for Vitest)

**Dependencies to Remove:**

```json
"jest": "^30.0.2",
"jest-environment-jsdom": "^30.0.2",
"babel-jest": "^30.0.2",
"ts-jest": "^29.4.0"
```

**Dependencies to Keep (Vitest-compatible):**

```json
"@testing-library/jest-dom": "^6.1.3"  // Provides DOM matchers for Vitest
"@testing-library/react": "^16.3.0"
"vitest": "^3.2.4"
"@vitest/coverage-v8": "^3.2.4"
```

**Files to Remove:**

- `jest.config.js`
- `src/setupTests.js`
- `babel.config.js` (if only used for Jest)

**Files to Keep:**

- `src/test/setup.ts` (primary Vitest setup)
- `vite.config.ts` (contains test configuration)

---

#### 1.3 Redundant Test Setup Imports

**Locations:** Multiple test files

**Issue:** Many test files manually import `@testing-library/jest-dom` even though it's globally configured in `src/test/setup.ts`:

```typescript
// Found in 20+ test files:
import '@testing-library/jest-dom';
```

**Impact:** Code duplication, inconsistent testing setup

**Files Affected:** (Sample)

- `src/components/autocomplete/__tests__/VersionSelector.test.tsx`
- `src/components/device/__tests__/DeviceActivation.test.tsx`
- `src/components/dialogs/tabs/__tests__/UsbConfigTab.test.tsx`
- ~15+ more test files

---

### 2. File Naming & Extension Inconsistencies

#### 2.1 Mixed JSX/TSX Extensions

**Issue:** The codebase contains 80+ `.jsx` files alongside `.tsx` files, creating inconsistency:

**JSX Files (should be TSX):**

- `src/App.jsx` ⚠️ Main app component should be TypeScript
- `src/pages/InstalledApps.jsx`
- `src/pages/Marketplace.jsx`
- `src/pages/ServiceMesh.jsx`
- `src/pages/System.jsx`
- `src/data/FilterContext.jsx`
- `src/data/AppList.jsx`
- `src/data/SystemData.jsx`
- `src/data/ReferenceDataContext.jsx`
- `src/components/Frame.jsx`
- `src/components/AppInstanceRow.jsx`
- 70+ additional component files

**Impact:**

- Loss of type safety
- Cannot leverage TypeScript features
- Inconsistent developer experience
- Longer build times due to mixed transpilation paths
- PropTypes used instead of TypeScript interfaces

---

#### 2.2 Mixed JS/TS Extensions

**JS Files (should be TS):**

- `src/setupTests.js` (uses CommonJS `require()`)
- `src/api/api-config.js`
- `src/api/device/InstanceDetailsService.js`
- `src/api/device/InstanceLogService.js`
- `src/api/marketplace/VersionService.js`
- `src/api/marketplace/ProductService.js`
- `src/api/marketplace/AppRatingService.js`
- `src/hooks/usePagination.js`
- `src/components/LocalStorage.js`
- Mock files using `.js` extension

**Impact:** Same as above, plus inability to use modern ESM imports consistently

---

### 3. Package.json Issues

#### 3.1 Incorrect Main Entry Point

```json
"main": "src/index.js"
```

**Issue:** The actual main file is `src/main.tsx`, making this field misleading.

**Impact:** Could cause issues if the package is ever imported as a module.

---

#### 3.2 Unnecessary Dependencies

**Babel Dependencies (Jest-Only):**
Since Vitest uses esbuild/Vite, Babel is only needed for Jest:

```json
"@babel/plugin-proposal-private-property-in-object": "^7.21.11",
"@babel/preset-env": "^7.27.2",
"@babel/preset-react": "^7.27.1",
"@babel/preset-typescript": "^7.27.1",
"@babel/runtime": "^7.21.0"
```

**Jest Dependencies:**

```json
"jest": "^30.0.2",
"jest-environment-jsdom": "^30.0.2",
"babel-jest": "^30.0.2",
"ts-jest": "^29.4.0",
"@types/jest": "^30.0.0"
```

**Potentially Unused:**

```json
"ts-loader": "^9.5.2"  // Vite doesn't use webpack
```

**Total Estimated Savings:** ~30MB+ in node_modules, faster installs

---

#### 3.3 Legacy ESLint Configuration

**Location:** `.eslintrc.js`

**Issue:**

```javascript
env: {
  jest: true,  // Should be vitest
}
```

**Impact:** ESLint treats Jest globals as valid, which may hide errors in Vitest tests.

---

### 4. Code Quality & Modernization

#### 4.1 Unnecessary React Imports

**React 19 with JSX Transform:** React no longer needs to be imported in JSX files

**Found Issues:**

```javascript
// Incorrect named import (src/App.jsx, src/pages/Marketplace.jsx):
import { React } from 'react'; // ❌ Wrong syntax

// Unnecessary default import (80+ files):
import React from 'react'; // ⚠️ Not needed with new JSX transform
```

**Files Affected:**

- `src/App.jsx` - Uses incorrect `import { React }` syntax
- `src/pages/Marketplace.jsx` - Same incorrect syntax
- 80+ component files with unnecessary `import React`

**Impact:**

- Slightly larger bundles
- Code confusion (what syntax is correct?)
- Not leveraging React 19 capabilities

---

#### 4.2 PropTypes Instead of TypeScript

**Issue:** Many JSX files use PropTypes for runtime validation:

```javascript
import PropTypes from 'prop-types';

FileOpen.propTypes = {
  buttonText: PropTypes.string,
  loading: PropTypes.bool,
  onConfirm: PropTypes.func,
};
```

**Impact:**

- Runtime overhead (PropTypes validation in development)
- Less powerful than TypeScript interfaces
- Duplicate validation patterns

**Files Affected:** 50+ component files

---

#### 4.3 CommonJS Require Statements

**Location:** `src/setupTests.js`

```javascript
global.createMockApi = require('./__mocks__/core-client-ts').createMockApi;
global.resetAllApiMocks = require('./__mocks__/core-client-ts').resetAllApiMocks;
global.setupQuestFailure = require('./__mocks__/core-client-ts').setupQuestFailure;
```

**Issue:** Mixes CommonJS with ESM throughout the codebase

**Impact:** Module system confusion, cannot use tree-shaking effectively

---

### 5. Project Structure Issues

#### 5.1 Inconsistent Folder Organization

**Issue:** Components are scattered with unclear organization:

**Current Structure Problems:**

```
src/
  ├── components/          # Mix of flat and nested components
  │   ├── Frame.jsx        # Top-level components (flat)
  │   ├── AppBar.jsx
  │   ├── Loading.tsx      # Mix of .jsx and .tsx
  │   ├── LocalStorage.js  # Utility disguised as component
  │   ├── app_bar/         # Subfolder for one component's parts
  │   ├── apps/            # Domain-specific
  │   ├── auth/            # Domain-specific
  │   ├── buttons/         # UI primitives
  │   ├── dialogs/         # UI primitives
  │   ├── navigation/      # Domain-specific
  │   ├── providers/       # Should be in separate context folder
  │   └── ...
  ├── data/                # Mix of context providers and data fetchers
  │   ├── AppList.jsx      # Data provider
  │   ├── SystemData.jsx   # Data provider
  │   ├── FilterContext.jsx
  │   └── SystemProvider.jsx
  ├── pages/               # Good - follows convention
  └── hooks/               # Good but under-utilized
      └── usePagination.js # Only one hook
```

**Problems:**

1. **Providers scattered:** Some in `components/providers/`, others in `data/`
2. **No clear component architecture:** Flat files mixed with deeply nested folders
3. **Domain vs UI components mixed:** Auth, apps, navigation mixed with generic UI
4. **Underutilized folders:** `hooks/` has only one hook
5. **Naming inconsistency:** `app_bar` uses snake_case folder name

---

#### 5.2 Deep Relative Import Paths

**Issue:** Excessive use of `../../` imports:

```typescript
import { useProtectedApi } from '../../../components/providers/ApiProvider';
import { createMockApi } from '../../../../__mocks__/core-client-ts';
import DeviceLogin from '../../pages/DeviceLogin';
import { QuestContextProvider } from '../../components/quests/QuestContext';
```

**Impact:**

- Fragile imports (break when files move)
- Harder to refactor
- Cognitive overhead

**Solution Available:** TypeScript path aliases are configured but underutilized:

```json
"paths": {
  "@components/*": ["./src/components/*"],
  "@api/*": ["./src/api/*"]
}
```

**Missing Aliases:**

- `@hooks/*`
- `@pages/*`
- `@utils/*`
- `@contexts/*` or `@providers/*`
- `@models/*`
- `@test/*`

---

### 6. Configuration File Redundancy

**Current Configuration Files:**

- `vite.config.ts` ✅ (Active)
- `jest.config.js` ❌ (Obsolete)
- `babel.config.js` ⚠️ (Only needed for Jest)
- `tsconfig.json` ✅ (Active)
- `.eslintrc.js` ⚠️ (References Jest environment)

**Issues:**

1. Dual test runner configurations
2. Babel only serves obsolete Jest setup
3. ESLint references wrong test environment

---

## Refactoring Goals

### Completed Primary Goals ✅

1. ✅ **Complete Migration to Vite/Vitest:** Removed all Jest and react-scripts artifacts (454 packages)
2. ✅ **Reduce Dependencies:** Removed 21 direct dependencies plus their transitive dependencies
3. ✅ **Fix VS Code Integration:** Updated debug configurations for Vitest

### Deferred to Future Initiative ⏸️

1. ⏸️ **TypeScript Consistency:** Convert all `.jsx` and `.js` files to `.tsx`/`.ts` (80+ files)
2. ⏸️ **Migrate PropTypes to TypeScript:** Replace runtime validation with compile-time type checking

### Remaining Primary Goals

1. **Modernize React Usage:** Remove unnecessary/incorrect React imports
2. **Improve Project Structure:** Organize components logically, utilize path aliases
3. **Final Cleanup:** Documentation updates, unused file audit

### Secondary Goals

1. Improve code documentation
2. Establish clear architectural patterns
3. Enhance developer experience
4. Maintain reduced bundle size

---

## Implementation Plan

### Phase 1: Remove Legacy Migration Artifacts ✅ **COMPLETED**

**Estimated Time:** 2-4 hours  
**Risk Level:** 🟢 Low  
**Status:** ✅ Completed on February 9, 2026

**Summary of Completion:**

- ✅ Removed all Jest/Babel configuration files and dependencies (383 packages)
- ✅ Cleaned redundant test imports from 28 test files
- ✅ Updated VS Code debug configurations for Vitest
- ✅ Updated ESLint configuration (ecmaVersion to 'latest')
- ✅ **Bonus:** Removed 71 additional unused packages (openapitools, test mocks, emailjs)
- ✅ **Total:** 454 packages removed (~35% reduction in dependencies)

#### Step 1.1: Clean Up Test Configurations

**Priority:** HIGH

**Actions:**

1. **Remove Jest configuration files:**

   ```bash
   rm jest.config.js
   rm src/setupTests.js
   ```

2. **Update package.json - Remove dependencies:**

   ```json
   Remove:
   - "jest": "^30.0.2"
   - "jest-environment-jsdom": "^30.0.2"
   - "babel-jest": "^30.0.2"
   - "ts-jest": "^29.4.0"
   - "@types/jest": "^30.0.0"
   - "@babel/plugin-proposal-private-property-in-object": "^7.21.11"
   - "@babel/preset-env": "^7.27.2"
   - "@babel/preset-react": "^7.27.1"
   - "@babel/preset-typescript": "^7.27.1"
   - "@babel/runtime": "^7.21.0"
   - "ts-loader": "^9.5.2"
   ```

3. **Remove babel.config.js:**

   ```bash
   rm babel.config.js
   ```

4. **Update package.json main field:**

   ```json
   "main": "src/main.tsx"
   ```

5. **Run dependency cleanup:**
   ```bash
   pnpm install
   ```

**Verification:**

```bash
pnpm test  # Should run Vitest
pnpm run coverage  # Should generate coverage
```

---

#### Step 1.2: Remove Redundant Test Imports

**Priority:** MEDIUM

**Actions:**

1. **Remove** `import '@testing-library/jest-dom';` from all test files (already in `src/test/setup.ts`)

**Files to Update:** (~20 files)

```
src/components/autocomplete/__tests__/VersionSelector.test.tsx
src/components/device/__tests__/DeviceActivation.test.tsx
src/components/device/version/__tests__/VersionsTable.test.jsx
src/components/dialogs/tabs/__tests__/UsbConfigTab.test.tsx
src/components/dialogs/tabs/__tests__/NetworkConfigTab.test.tsx
src/components/dialogs/tabs/__tests__/PortsConfigTab.test.tsx
src/components/__tests__/CollabsableRow.test.jsx
src/components/__tests__/LocalStorage.test.js
src/components/__tests__/SearchBar.test.jsx
src/components/__tests__/HostContainerTable.test.jsx
src/components/buttons/help/__tests__/HelpButton.test.tsx
src/components/__tests__/RequestAppDialog.test.jsx
src/components/__tests__/LoadIconButton.test.jsx
src/components/__tests__/Drawer.test.jsx
... (additional test files)
```

**Script to Automate:**

```bash
find src -name "*.test.tsx" -o -name "*.test.jsx" -o -name "*.test.ts" | \
  xargs sed -i "/^import '@testing-library\/jest-dom';$/d"
```

**Verification:**

```bash
pnpm test  # All tests should still pass
```

---

#### Step 1.3: Update VS Code Debug Configuration

**Priority:** MEDIUM

**Actions:**

1. **Update `.vscode/launch.json`** to use Vitest:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "pwa-chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "https://localhost:5173/",
      "webRoot": "${workspaceFolder}",
      "runtimeArgs": ["--disable-web-security"]
    },
    {
      "type": "firefox",
      "request": "launch",
      "name": "Launch Firefox against localhost",
      "url": "https://localhost:5173/",
      "webRoot": "${workspaceFolder}"
    },
    {
      "name": "Debug Vitest Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["test", "--run"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Debug Vitest Tests (Watch)",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["test"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

**Verification:**

- Press F5 in VS Code with a test file open
- Tests should run in debug mode

---

#### Step 1.4: Update ESLint Configuration

**Priority:** LOW

**Actions:**

1. **Update `.eslintrc.js`:**

```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true,
    'vitest-globals/env': true, // Changed from jest: true
  },
  extends: [
    'plugin:react/recommended',
    'plugin:react/jsx-runtime', // Added for React 19
    'standard',
    'prettier',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest', // Changed from 12
    sourceType: 'module',
  },
  plugins: ['react', 'vitest-globals'], // Added vitest-globals
  rules: {
    camelcase: 'off',
    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'no-undef': 'off',
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
    'react/prop-types': 'off', // We'll use TypeScript instead
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

2. **Install vitest-globals ESLint plugin:**

```bash
pnpm add -D eslint-plugin-vitest-globals
```

**Verification:**

```bash
pnpm run lint
```

---

### Phase 2: Project Structure Improvements ✅ **COMPLETED** (Medium Risk, High Value)

**Previously Phase 3 - Promoted to Phase 2 as primary initiative**

**Estimated Time:** 20-35 hours (comprehensive restructuring)  
**Risk Level:** 🟡 Medium

**Rationale:**
This phase is now the main focus of the refactoring effort. A well-organized project structure provides:

- **Feature Autonomy:** Self-contained features with clear boundaries
- **Improved Discoverability:** Easy navigation by domain/feature
- **Better Scalability:** Add new features without affecting existing ones
- **Reduced Coupling:** Clear dependencies between modules
- **Enhanced Maintainability:** Related code physically co-located

The comprehensive reorganization will move from a scattered component-centric structure to a feature-based architecture with proper separation of concerns.

---

#### Step 2.1: Consolidate Context/Provider Files ✅ COMPLETED

**Priority:** HIGH  
**Status:** ✅ Completed February 16, 2026

**What was done:**

- Moved 28 files from `src/components/providers/` and `src/data/` to `src/contexts/` using `git mv` (preserving history)
- Created organized subdirectory structure under `src/contexts/`
- Created barrel export `src/contexts/index.ts`
- Updated 80+ application source file imports to use `@contexts/*` aliases
- Fixed 97 test files with corrected `vi.mock()` paths and import statements
- Configured 11 path aliases in both `tsconfig.json` and `vite.config.ts`
- Kept `AppList.jsx` and `SystemData.jsx` in `src/data/` (data fetchers, not contexts)

**Resulting Structure:**

```
src/
  ├── contexts/
  │   ├── api/
  │   │   ├── ApiProvider.tsx
  │   │   ├── AuthProviderApiProvider.tsx
  │   │   └── __tests__/
  │   ├── auth/
  │   │   ├── OAuth4WebApiAuthProvider.tsx
  │   │   ├── __mocks__/
  │   │   ├── __tests__/
  │   │   └── oauth/  (useAuthSession, useOAuthCallback, useOAuthConfig, useOAuthFlow, types)
  │   ├── data/
  │   │   ├── FilterContext.jsx
  │   │   ├── ReferenceDataContext.jsx
  │   │   ├── SystemProvider.jsx
  │   │   ├── __mocks__/
  │   │   └── __tests__/
  │   ├── device/
  │   │   ├── DeviceActivationContext.tsx
  │   │   ├── DeviceActivationProvider.tsx
  │   │   ├── DeviceStateProvider.tsx
  │   │   ├── __mocks__/
  │   │   └── __tests__/
  │   ├── marketplace/
  │   │   └── MarketplaceUserProvider.tsx
  │   ├── quests/
  │   │   └── QuestContext.tsx
  │   ├── Providers.tsx  (Root provider composition)
  │   └── index.ts  (Barrel re-export)
```

**Path aliases configured:**

```json
"@components/*", "@contexts/*", "@pages/*", "@hooks/*", "@utils/*",
"@models/*", "@api/*", "@test/*", "@assets/*", "@styles/*", "@data/*"
```

**Validation:** Build passes (12,228 modules), all 668 tests pass (97 test files)

---

#### Step 2.2: Reorganize Component Structure ✅ COMPLETED

**Priority:** HIGH  
**Status:** ✅ Completed February 16, 2026  
**Estimated Effort:** 12-18 hours (across sub-steps)

**Goal:** Reorganize `src/components/` from a flat/mixed structure into a feature-based architecture with clear separation between layout, shared UI, and domain features.

**Current State (post-2.1):**

```
src/components/                      # 25 root files + 14 subdirectories
  ├── 25 flat root files (.jsx/.tsx) # Mix of layout, UI, and domain components
  ├── apps/          (8 files)       # App cards, installation, rating
  ├── auth/          (2 files)       # AuthGuard, MarketplaceLogin
  ├── buttons/       (9 files)       # Mixed domain buttons (app, instance, export, license, help, editors)
  ├── dialogs/       (16 files)      # Instance config dialog with tabs
  ├── device/        (3 files)       # DeviceActivation, LicenseInfo, VersionsTable
  ├── onboarding/    (17 files)      # Well-organized internally (already feature-like)
  ├── quests/        (6 files)       # Quest components (already feature-like)
  ├── steppers/      (11 files)      # Generic wizard framework (already well-organized)
  ├── app_bar/       (1 file)        # Logo.tsx
  ├── menus/avatar/  (1 file)        # Avatar.tsx
  ├── navigation/    (2 files)       # FLECSLogo.jsx, PoweredBy.tsx
  ├── text/          (1 file)        # MarqueeText.tsx
  ├── lists/         (1 file)        # ExportList.tsx
  └── autocomplete/  (1 file)        # VersionSelector.tsx
```

**Problems to solve:**

1. 25 flat root files with no grouping — hard to find things
2. `buttons/` groups by UI type rather than domain — scattered across features
3. `dialogs/` is entirely instance-config related but named generically
4. `app_bar/`, `navigation/`, `menus/` are layout fragments in separate dirs
5. `LocalStorage.js` is a hook, not a component
6. Domain-specific buttons (`InstallButton`, `DeviceActivationButton`) are far from their feature components

**Target Structure:**

```
src/components/
  ├── layout/                        # Shell/chrome components
  │   ├── AppBar.jsx
  │   ├── Logo.tsx                   # from app_bar/
  │   ├── Avatar.tsx                 # from menus/avatar/
  │   ├── Drawer.jsx
  │   ├── Frame.jsx
  │   ├── FLECSLogo.jsx              # from navigation/
  │   ├── PoweredBy.tsx              # from navigation/
  │   └── __tests__/
  │
  ├── ui/                            # Reusable, domain-agnostic components
  │   ├── ActionSnackbar.jsx
  │   ├── ConfirmDialog.jsx
  │   ├── ContentDialog.jsx
  │   ├── FileOpen.jsx
  │   ├── LoadButton.jsx
  │   ├── LoadIconButton.jsx
  │   ├── Loading.tsx
  │   ├── SearchBar.jsx
  │   ├── MarqueeText.tsx            # from text/
  │   ├── VersionSelector.tsx        # from autocomplete/
  │   ├── CollapsableRow.jsx
  │   └── __tests__/
  │
  ├── apps/                          # App management feature (EXISTING, expanded)
  │   ├── cards/
  │   ├── installation/
  │   ├── rating/
  │   ├── buttons/                   # from buttons/app/ (InstallButton, UninstallButton, UpdateButton)
  │   ├── AppFilter.jsx              # from root
  │   ├── AppInstanceRow.jsx         # from root
  │   ├── InstalledAppsList.jsx      # from root
  │   ├── InstalledAppsListRow.jsx   # from root
  │   ├── MarketplaceList.jsx        # from root
  │   └── __tests__/
  │
  ├── instances/                     # Instance management feature (NEW, from dialogs/)
  │   ├── InstanceInfo.jsx           # from root
  │   ├── InstanceDetails.jsx        # from root
  │   ├── InstanceLog.jsx            # from root
  │   ├── VolumesTable.jsx           # from root
  │   ├── HostContainerTable.jsx     # from root
  │   ├── InstanceConfigDialog.tsx   # from dialogs/
  │   ├── tabs/                      # from dialogs/tabs/
  │   ├── buttons/                   # from buttons/instance/
  │   └── __tests__/
  │
  ├── device/                        # Device management (EXISTING, expanded)
  │   ├── DeviceActivation.tsx
  │   ├── license/
  │   │   ├── LicenseInfo.tsx
  │   │   └── DeviceActivationButton.tsx  # from buttons/license/
  │   ├── version/
  │   │   └── VersionsTable.tsx
  │   ├── Version.jsx                # from root
  │   └── __tests__/
  │
  ├── auth/                          # Auth UI (EXISTING)
  │   ├── AuthGuard.tsx
  │   ├── marketplace/
  │   │   └── MarketplaceLogin.tsx
  │   └── __tests__/
  │
  ├── quests/                        # Quest system (EXISTING, no change)
  │   └── (6 files, already organized)
  │
  ├── onboarding/                    # Onboarding wizard (EXISTING, no change)
  │   └── (17 files, already organized)
  │
  ├── steppers/                      # Generic wizard framework (EXISTING, no change)
  │   └── (11 files, already organized)
  │
  ├── export/                        # Export feature (NEW)
  │   ├── Export.tsx                  # from buttons/export/
  │   ├── ExportList.tsx             # from lists/flecsports/
  │   └── __tests__/
  │
  └── help/                          # Help feature (EXISTING, expanded)
      ├── HelpButton.tsx             # from buttons/help/
      └── __tests__/
```

**What does NOT move:**

- `src/api/` — stays as-is (shared API layer, well-organized by domain)
- `src/models/` — stays as-is (shared type definitions)
- `src/contexts/` — stays as-is (consolidated in Step 2.1)
- `src/hooks/` — stays as-is
- `src/utils/` — stays as-is
- `src/pages/` — stays as-is
- `src/data/` — stays as-is
- `App.jsx`, `main.tsx` — stay at `src/` root (Vite entry point)

**What does NOT get renamed:**

- No file renames in this step (e.g., Card.tsx stays Card.tsx, not AppCard.tsx)
- No page renames (e.g., InstalledApps.jsx stays as-is, no Page suffix)
- Renaming can be a separate future step if desired

**Design decisions:**

1. **Keep everything under `src/components/`** — avoids breaking the `@components/*` alias and keeps scope manageable. No new top-level `features/`, `layout/`, `ui/` dirs.
2. **Move domain buttons to their features** — `buttons/app/` → `apps/buttons/`, `buttons/instance/` → `instances/buttons/`, etc.
3. **Leave `onboarding/`, `quests/`, `steppers/` alone** — they're already well-organized internally.
4. **Co-locate tests** — move tests alongside the components they test (from central `__tests__/` to feature `__tests__/`).
5. **`editors/` buttons stay with instances** — `EditorButton.tsx` and `EditorButtons.tsx` are part of the instance config feature. They move to `instances/tabs/editors/` alongside `EditorConfigTab.tsx`.

---

##### Sub-step 2.2a: Create `layout/` and `ui/` directories ✅ _(~1 hour)_

Move shell/chrome components to `layout/` and shared UI components to `ui/`. These have few cross-dependencies, making them low-risk.

**Files to move:**

Layout (7 files + tests):

- `AppBar.jsx` → `layout/AppBar.jsx`
- `Drawer.jsx` → `layout/Drawer.jsx`
- `Frame.jsx` → `layout/Frame.jsx`
- `app_bar/Logo.tsx` → `layout/Logo.tsx`
- `menus/avatar/Avatar.tsx` → `layout/Avatar.tsx`
- `navigation/FLECSLogo.jsx` → `layout/FLECSLogo.jsx`
- `navigation/PoweredBy.tsx` → `layout/PoweredBy.tsx`

UI (11 files + tests):

- `ActionSnackbar.jsx` → `ui/ActionSnackbar.jsx`
- `ConfirmDialog.jsx` → `ui/ConfirmDialog.jsx`
- `ContentDialog.jsx` → `ui/ContentDialog.jsx`
- `FileOpen.jsx` → `ui/FileOpen.jsx`
- `LoadButton.jsx` → `ui/LoadButton.jsx`
- `LoadIconButton.jsx` → `ui/LoadIconButton.jsx`
- `Loading.tsx` → `ui/Loading.tsx`
- `SearchBar.jsx` → `ui/SearchBar.jsx`
- `CollapsableRow.jsx` → `ui/CollapsableRow.jsx`
- `text/MarqueeText.tsx` → `ui/MarqueeText.tsx`
- `autocomplete/VersionSelector.tsx` → `ui/VersionSelector.tsx`

**Validation:** Build passes, all tests pass.  
**Commit:** `ee5f765` — `refactor: create layout/ and ui/ component groups (Step 2.2a)`

---

##### Sub-step 2.2b: Consolidate `instances/` feature ✅ _(~2 hours)_

Move instance-related components and the instance config dialog into one feature directory.

**Files to move:**

From root:

- `InstanceInfo.jsx` → `instances/InstanceInfo.jsx`
- `InstanceDetails.jsx` → `instances/InstanceDetails.jsx`
- `InstanceLog.jsx` → `instances/InstanceLog.jsx`
- `VolumesTable.jsx` → `instances/VolumesTable.jsx`
- `HostContainerTable.jsx` → `instances/HostContainerTable.jsx`

From `dialogs/`:

- `InstanceConfigDialog.tsx` → `instances/InstanceConfigDialog.tsx`
- `tabs/` (entire directory, 16 files) → `instances/tabs/`

From `buttons/`:

- `buttons/instance/InstanceStartCreateButtons.tsx` → `instances/buttons/InstanceStartCreateButtons.tsx`
- `buttons/editors/EditorButton.tsx` → `instances/tabs/editors/EditorButton.tsx`
- `buttons/editors/EditorButtons.tsx` → `instances/tabs/editors/EditorButtons.tsx`

**After this step, `dialogs/` is reduced to just `QuestLogDialog.tsx` — move it to `quests/`.**

**Validation:** Build passes, all tests pass.  
**Commit:** `544cf4d` — `refactor: consolidate instances/ feature components (Step 2.2b)`

---

##### Sub-step 2.2c: Expand `apps/` feature and create `export/` ✅ _(~1.5 hours)_

Move app-related root components and buttons into the existing `apps/` directory. Create `export/` feature.

**Files to move:**

To `apps/`:

- `AppFilter.jsx` → `apps/AppFilter.jsx`
- `AppInstanceRow.jsx` → `apps/AppInstanceRow.jsx`
- `InstalledAppsList.jsx` → `apps/InstalledAppsList.jsx`
- `InstalledAppsListRow.jsx` → `apps/InstalledAppsListRow.jsx`
- `MarketplaceList.jsx` → `apps/MarketplaceList.jsx`
- `buttons/app/InstallButton.tsx` → `apps/buttons/InstallButton.tsx`
- `buttons/app/UninstallButton.tsx` → `apps/buttons/UninstallButton.tsx`
- `buttons/app/UpdateButton.tsx` → `apps/buttons/UpdateButton.tsx`

To `export/` (new):

- `buttons/export/Export.tsx` → `export/Export.tsx`
- `lists/flecsports/ExportList.tsx` → `export/ExportList.tsx`

**Validation:** Build passes, all tests pass.  
**Commit:** `65e4af7` — `refactor: expand apps/ feature and create export/ (Step 2.2c)`

---

##### Sub-step 2.2d: Expand `device/` and move remaining buttons ✅ _(~1 hour)_

Move device-related root components and the license button into `device/`.

**Files to move:**

- `Version.jsx` → `device/Version.jsx`
- `Import.jsx` → `device/Import.jsx`
- `buttons/license/DeviceActivationButton.tsx` → `device/license/DeviceActivationButton.tsx`
- `buttons/help/HelpButton.tsx` → `help/HelpButton.tsx` (already has `help/` dir with tests)

**After this step, `buttons/` directory should be empty and can be deleted.**

**Validation:** Build passes, all tests pass.  
**Commit:** `84000b6` — `refactor: expand device/ feature and clean up buttons/ (Step 2.2d)`

---

##### Sub-step 2.2e: Move `LocalStorage.js` to `hooks/` ✅ _(~30 min)_

`LocalStorage.js` is a custom hook (`useLocalStorage`), not a component. Move it to `src/hooks/`.

**Files to move:**

- `components/LocalStorage.js` → `hooks/LocalStorage.js`
- `components/__tests__/LocalStorage.test.js` → `hooks/__tests__/LocalStorage.test.js`

**Note:** Keep the filename as `LocalStorage.js` (no rename to `useLocalStorage.ts`). TypeScript conversion is out of scope for this step.

**Validation:** Build passes, all tests pass.  
**Commit:** `4f7ce64` — `refactor: move LocalStorage hook to hooks/ (Step 2.2e)`

---

##### Sub-step 2.2f: Move remaining `QuestLogDialog.tsx` and clean up empty dirs ✅ _(~30 min)_

**Note:** `QuestLogDialog.tsx` was already moved to `quests/` in Step 2.2b. All empty directories (`buttons/`, `dialogs/`, `app_bar/`, `menus/`, `navigation/`, `text/`, `lists/`, `autocomplete/`, `components/__tests__/`) were cleaned up incrementally during sub-steps 2.2a-2.2e. No separate commit needed — this step was a no-op.

---

##### Step 2.2 Summary

| Sub-step | Scope                    | Files moved   | Risk   | Status |
| -------- | ------------------------ | ------------- | ------ | ------ |
| 2.2a     | layout/ + ui/            | 18 + 15 tests | Low    | ✅    |
| 2.2b     | instances/               | 18 + tests    | Medium | ✅    |
| 2.2c     | apps/ + export/          | 10 + 10 tests | Low    | ✅    |
| 2.2d     | device/ + help/          | 5 + 2 tests   | Low    | ✅    |
| 2.2e     | LocalStorage → hooks/    | 1 + 1 test    | Low    | ✅    |
| 2.2f     | cleanup (no-op)          | 0             | Low    | ✅    |

**Total:** ~52 source files + ~28 test files moved across 5 commits (2.2f was a no-op).

**Path alias note:** The `@components/*` alias continues to work throughout since all moves are within `src/components/`. After Step 2.2 is complete, consider adding granular aliases (`@layout/*`, `@ui/*`, `@features/*`) in a follow-up step if desired — but this is optional since `@components/layout/*` and `@components/ui/*` already work.

**Post-reorganization `src/components/` contents:**

```
src/components/
  ├── layout/     (7 files)    # Shell: AppBar, Drawer, Frame, Logo, Avatar, etc.
  ├── ui/         (11 files)   # Shared: buttons, dialogs, feedback, inputs
  ├── apps/       (16+ files)  # App cards, installation, rating, lists, buttons
  ├── instances/  (21+ files)  # Instance details, config dialog, tabs, buttons
  ├── device/     (7+ files)   # DeviceActivation, license, version, Version, Import
  ├── auth/       (2 files)    # AuthGuard, MarketplaceLogin
  ├── quests/     (7+ files)   # Quest UI + QuestLogDialog
  ├── onboarding/ (17 files)   # First-time setup wizard (unchanged)
  ├── steppers/   (11 files)   # Generic wizard framework (unchanged)
  ├── export/     (2 files)    # Export + ExportList
  └── help/       (1 file)     # HelpButton
```

---

#### Step 2.3: Add Granular Path Aliases (Optional) ✂️ DEFERRED

**Priority:** LOW (Optional follow-up after Step 2.2)

**Note:** After Step 2.2, `@components/layout/AppBar` and `@components/ui/LoadButton` already work via the existing `@components/*` alias. Adding dedicated `@layout/*`, `@ui/*` aliases is purely cosmetic and can be done later if desired. Skipping this step has no functional impact.

If desired in the future, add:

```json
"@layout/*": ["./src/components/layout/*"],
"@ui/*": ["./src/components/ui/*"]
```

---

### Phase 3: Code Modernization (Low Risk, Medium Value)

**Previously Phase 2 - Moved after structural improvements**

**Estimated Time:** 4-6 hours  
**Risk Level:** 🟢 Low

**Rationale:**
These changes prepare the codebase for React 19 best practices and remove technical debt. While less impactful than structural improvements, they improve code quality and reduce bundle size.

---

#### Step 3.1: Remove Unnecessary React Imports

**Priority:** HIGH

**Actions:**

1. **Fix incorrect React imports** in files using `import { React }`:

   ```typescript
   // Files: src/App.jsx, src/pages/Marketplace.jsx
   // Before:
   import { React } from 'react'; // ❌ Wrong

   // After (if using React namespace):
   import React from 'react';

   // Or remove if not needed:
   // (delete the line entirely)
   ```

2. **Remove unnecessary React imports** (React 19 with JSX transform doesn't need it):
   - Scan files for `import React from 'react';`
   - If the file only uses JSX (no hooks, no `React.*` calls), remove the import
   - Keep if using: `React.useState`, `React.useEffect`, `React.FC`, etc.

**Script to Find Candidates:**

```bash
# Find files that import React but might not need it
grep -r "^import React from 'react';" src/ | grep -E "\.(tsx|jsx)$"
```

**Manual Review Required:** Some files may still need React for:

- `React.useState`, `React.useEffect`, etc.
- `React.FC` type annotations
- `React.memo`, `React.Fragment`

---

### Phase 4: Final Cleanup (Low Risk, Low Value)

**Estimated Time:** 2-3 hours  
**Risk Level:** 🟢 Low

**Rationale:**
Final documentation and maintenance tasks to ensure the refactored codebase is well-documented and free of unused code.

---

#### Step 4.1: Update Documentation

**Priority:** MEDIUM

**Actions:**

1. **Update README.md:**
   - Remove references to Jest
   - Update setup instructions for Vitest
   - Document new project structure
   - Update TypeScript migration status

2. **Update test documentation:**
   - `src/test/README.md` (if exists)
   - `src/test/README-OAuth-Testing.md` (update to reference Vitest)

3. **Create ARCHITECTURE.md:**
   - Document provider hierarchy
   - Document folder structure
   - Document path aliases
   - Document testing patterns

---

#### Step 4.2: Audit Unused Files

**Priority:** LOW

**Actions:**

1. Run dead code detection:

   ```bash
   pnpm add -D unimported
   pnpm unimported
   ```

2. Review and remove unused:
   - Mock files
   - Old test fixtures
   - Commented-out code
   - Unused imports

---

#### Step 4.3: Final Dependency Audit

**Priority:** LOW

**Actions:**

1. **Check for unused dependencies:**

   ```bash
   pnpm add -D depcheck
   pnpm exec depcheck
   ```

2. **Update all dependencies** (review breaking changes):

   ```bash
   pnpm update --latest --interactive
   ```

3. **Run full test suite:**
   ```bash
   pnpm run lint
   pnpm test
   pnpm run build
   ```

---

### Phase 5: TypeScript Migration (Medium Risk, High Value)

**Previously deferred - Now final phase after all structural improvements**

**Estimated Time:** 8-16 hours  
**Risk Level:** 🟡 Medium

**Rationale:**
TypeScript migration is scheduled as the final phase to avoid conflicts with the major structural reorganization in Phase 2. This approach:

- Prevents massive merge conflicts between file moves and TypeScript conversions
- Allows structural changes to stabilize first
- Enables focused attention on comprehensive type coverage
- Simplifies coordination by completing one major transformation at a time

**Current State:**

- ~80 `.jsx` files remain to be converted to `.tsx`
- ~19 `.js` service/utility files remain to be converted to `.ts`
- PropTypes still in use across 50+ component files

**Note:** This phase should only begin after Phase 2 (Project Structure) is complete and stable.

---

#### Step 5.1: Migrate Priority Files to TypeScript

**Priority:** HIGH

**Suggested Migration Order:**

1. Main app files first
2. Pages
3. Data/Context providers
4. Shared components
5. Specific feature components

**Priority Files to Migrate:**

**Tier 1 - Core (do first):**

```
src/App.jsx → src/App.tsx
src/pages/InstalledApps.jsx → src/pages/InstalledApps.tsx
src/pages/Marketplace.jsx → src/pages/Marketplace.tsx
src/pages/ServiceMesh.jsx → src/pages/ServiceMesh.tsx
src/pages/System.jsx → src/pages/System.tsx
```

**Tier 2 - Data Layer:**

```
src/contexts/data/FilterContext.jsx → src/contexts/data/FilterContext.tsx
src/contexts/data/ReferenceDataContext.jsx → src/contexts/data/ReferenceDataContext.tsx
src/contexts/data/SystemProvider.jsx → src/contexts/data/SystemProvider.tsx
src/data/AppList.jsx → src/data/AppList.tsx
src/data/SystemData.jsx → src/data/SystemData.tsx
```

**Tier 3 - Core Components:**

```
src/components/layout/Frame.jsx → src/components/layout/Frame.tsx
src/components/apps/AppInstanceRow.jsx → src/components/apps/AppInstanceRow.tsx
src/components/apps/InstalledAppsList.jsx → src/components/apps/InstalledAppsList.tsx
src/components/apps/MarketplaceList.jsx → src/components/apps/MarketplaceList.tsx
```

**Tier 4 - Supporting Components:** (Remaining ~70 JSX files)

**Process for Each File:**

1. Rename `.jsx` → `.tsx`
2. Fix incorrect React imports:

   ```typescript
   // Before:
   import { React } from 'react';

   // After (if using hooks/React namespace):
   import React from 'react';

   // Or remove entirely if not using React namespace:
   // (Just JSX works with new transform)
   ```

3. Replace PropTypes with TypeScript interfaces:

   ```typescript
   // Before:
   import PropTypes from 'prop-types';

   function FileOpen({ buttonText, loading, onConfirm }) { ... }

   FileOpen.propTypes = {
     buttonText: PropTypes.string,
     loading: PropTypes.bool,
     onConfirm: PropTypes.func,
   };

   // After:
   interface FileOpenProps {
     buttonText?: string;
     loading?: boolean;
     onConfirm?: () => void;
   }

   function FileOpen({ buttonText, loading, onConfirm }: FileOpenProps) { ... }
   ```

4. Add proper typing for hooks, context, etc.
5. Update imports in dependent files
6. Run tests to verify

**Verification Per File:**

```bash
pnpm run build  # Should compile without errors
pnpm test       # Related tests should pass
```

---

#### Step 5.2: Migrate JavaScript Files to TypeScript

**Priority:** MEDIUM

**Files to Migrate:**

**API Services:**

```
src/api/api-config.js → src/api/api-config.ts
src/api/device/InstanceDetailsService.js → .ts
src/api/device/InstanceLogService.js → .ts
src/api/marketplace/VersionService.js → .ts
src/api/marketplace/ProductService.js → .ts
src/api/marketplace/AppRatingService.js → .ts
```

**Utilities & Hooks:**

```
src/hooks/usePagination.js → src/hooks/usePagination.ts
src/hooks/LocalStorage.js → src/hooks/useLocalStorage.ts (also rename)
```

**Mocks:**

```
src/api/__mocks__/auth-header.js → .ts
src/api/marketplace/__mocks__/*.js → .ts
src/contexts/data/__mocks__/*.js → .ts
```

**Test Files:**

```
src/components/__tests__/LocalStorage.test.js → .test.ts
src/api/device/__tests__/*.test.js → .test.ts
src/api/marketplace/__tests__/*.test.js → .test.ts
```

**Process:**

1. Rename `.js` → `.ts`
2. Convert CommonJS `require()` to ESM imports
3. Add type annotations
4. Export types alongside implementations
5. Update imports in dependent files

---

#### Step 5.3: Remove PropTypes Package

**Priority:** LOW

**Note:** This step can only be completed after all files have been migrated to TypeScript.

**Actions:**

1. **Verify** all PropTypes have been replaced with TypeScript interfaces
2. **Remove** `prop-types` dependency:
   ```bash
   pnpm remove prop-types
   ```
3. **Search** for any remaining usage:
   ```bash
   grep -r "PropTypes" src/
   ```
4. **Final verification:**
   ```bash
   pnpm run build
   pnpm test
   ```

---

## Risk Assessment

### High-Risk Items

- ~~**Phase 2 (Structure Changes):** Mass file moves can break imports~~ ✅ **COMPLETED** - All imports verified, 668 tests passing
  - Result: 52 source files + 28 test files moved across 6 commits with zero regressions

- **Phase 5 (TypeScript Migration):** Breaking changes if types are incorrect
  - **Mitigation:** Migrate incrementally, run tests after each file, tier-based approach
  - **Rollback Plan:** Git allows reverting individual file migrations

### Medium-Risk Items

- ~~**Phase 1 (Removing Dependencies):** Test suite could break~~ ✅ **COMPLETED** - Successfully removed 454 packages
  - Result: All tests passing, no issues

### Low-Risk Items

- **Phase 3 (Code Modernization):** Mostly cosmetic changes
- **Phase 4 (Final Cleanup):** No functional changes

---

## Success Metrics

### Quantitative Metrics

**Completed (Phase 1):**

- ✅ **0** legacy config files (jest.config.js, babel.config.js, setupTests.js) - DONE
- ✅ **21** dependencies removed (Jest, Babel, unused packages) - DONE
- ✅ **454** total packages removed (~35% reduction) - DONE
- ✅ **28** test files cleaned of redundant imports - DONE
- ✅ **100%** test pass rate maintained - DONE
- ✅ **0** ESLint errors related to test environment - DONE
- ✅ VS Code debugging functional - DONE

**Remaining (Phases 2-5):**

- ✅ **Phase 2:** Project structure reorganization - DONE (context consolidation, component restructuring, path aliases)
- ⚪ **Phase 3:** React import cleanup and code modernization
- ⚪ **Phase 4:** Documentation updates and final cleanup
- ⚪ **Phase 5:** TypeScript migration (~80 JSX → TSX, ~19 JS → TS, PropTypes replacement)

### Qualitative Metrics

**Completed:**

- ✅ Developers can debug tests in VS Code
- ✅ Faster test execution (Vitest vs Jest)
- ✅ Cleaner dependency tree
- ✅ No dual testing configurations
- ✅ Clearer project structure (Phase 2)
- ✅ Reduced cognitive load for new developers (Phase 2)
- ✅ Improved code navigation with path aliases (Phase 2)
- ✅ Feature-based architecture (Phase 2)

**Remaining:**

- ⚪ Modern React 19 code practices (Phase 3)
- ⚪ Full type safety in all components (Phase 5)
- ⚪ Consistent file naming across project (Phase 5)

---

## Implementation Timeline

### Current Status (Updated February 16, 2026)

**✅ Completed:**

- Phase 1: Legacy artifact removal - DONE
- Phase 2: Project Structure Improvements - DONE
  - Step 2.1: Context/provider consolidation (`7693271`)
  - Step 2.2a: layout/ and ui/ (`ee5f765`)
  - Step 2.2b: instances/ feature (`544cf4d`)
  - Step 2.2c: apps/ and export/ (`65e4af7`)
  - Step 2.2d: device/ and help/ (`84000b6`)
  - Step 2.2e: LocalStorage → hooks/ (`4f7ce64`)
  - Step 2.2f: cleanup (no-op, completed during prior steps)
  - Step 2.3: Granular path aliases (deferred, optional)

**⏸️ Deferred to Future Initiative:**

- TypeScript Migration (Former Phase 2) - To be planned separately

**📋 Remaining Phases:**

**Phase 3: Code Modernization** ⭐ NEXT (Est. 4-6 hours)

- Fix incorrect React imports in App.jsx and Marketplace.jsx
- Remove unnecessary React imports where applicable
- Document PropTypes removal for future TypeScript migration

**Phase 4: Final Cleanup** (Est. 2-3 hours)

- Update documentation
- Audit unused files
- Final dependency audit

---

## Appendix

### A. Commands Reference

```bash
# Legacy dependencies (ALREADY REMOVED - Phase 1 Complete) ✅
# pnpm remove jest jest-environment-jsdom babel-jest ts-jest @types/jest \
#   @babel/plugin-proposal-private-property-in-object @babel/preset-env \
#   @babel/preset-react @babel/preset-typescript @babel/runtime ts-loader

# Optional: Install vitest-globals ESLint plugin (not required)
# pnpm add -D eslint-plugin-vitest-globals

# Run tests ✅
pnpm test

# Run tests with coverage ✅
pnpm run coverage

# Run linter ✅
pnpm run lint

# Build project ✅
pnpm run build

# Check for unused dependencies
pnpm exec depcheck

# Check for dead code
pnpm exec unimported

# Format all files
pnpm run format
```

---

### B. File Conversion Checklist

For each `.jsx` → `.tsx` conversion:

- [ ] Rename file to `.tsx`
- [ ] Fix React import (remove `{ React }` syntax if present)
- [ ] Remove unnecessary `import React` if file only uses JSX
- [ ] Replace PropTypes with TypeScript interface/type
- [ ] Add types for function parameters
- [ ] Add types for useState, useEffect, etc.
- [ ] Add types for context values
- [ ] Update imports in parent/child components
- [ ] Run `pnpm test` for related tests
- [ ] Run `pnpm run build` to check compilation
- [ ] Commit changes

---

### C. Testing Checklist

After each phase:

- [ ] All unit tests pass (`pnpm test`)
- [ ] No TypeScript errors (`pnpm run build`)
- [ ] No ESLint errors (`pnpm run lint`)
- [ ] Coverage remains above threshold (`pnpm run coverage`)
- [ ] Dev server runs (`pnpm run dev`)
- [ ] Production build succeeds (`pnpm run build:production`)
- [ ] Manual smoke test of key features

---

## Conclusion

This refactoring specification provides a comprehensive, phased approach to modernizing the FLECS WebApp codebase.

**Completed Achievements (Phases 1-2):**

1. ✅ **Removed technical debt** - Eliminated 454 obsolete packages (~35% reduction)
2. ✅ **Improved developer experience** - Working debug tools for Vitest
3. ✅ **Cleaner configuration** - No dual test runner setup
4. ✅ **Faster development** - Vitest performance improvements
5. ✅ **Reduced bundle size** - Lighter dependency footprint
6. ✅ **Feature-based architecture** - 11 organized component directories, zero loose files
7. ✅ **Consolidated contexts** - All providers/contexts in `src/contexts/` with 11 path aliases
8. ✅ **Improved discoverability** - Clear domain boundaries (apps, instances, device, etc.)

**Remaining Work:**

The plan continues with Phases 3-4 focused on code modernization and final cleanup. TypeScript migration has been deferred to a dedicated future initiative to allow for focused, comprehensive type coverage without mixing concerns.

**Current Status:** Phase 1 complete, Phase 2 complete. All 668 tests passing across 97 test files. Build produces 12,228 modules successfully.

**Next Steps:**

- Phase 3: Code Modernization (fix React imports, remove unnecessary imports)
- Phase 4: Final Cleanup (documentation updates, unused file audit)
- Future: TypeScript Migration (separate dedicated initiative)
