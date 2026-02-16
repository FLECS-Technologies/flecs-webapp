# FLECS WebApp Refactoring Specification

**Date Created:** February 9, 2026  
**Last Updated:** February 16, 2026  
**Version:** 1.3.0  
**Current Branch:** refactor-project-structure  
**Status:** Phase 1 Complete ✅ | Phase 2 Step 2.1 Complete ✅ | Step 2.2 Next ⭐

## Executive Summary

This document outlines a comprehensive refactoring plan for the FLECS WebApp project. After migrating from Create React App (CRA) with react-scripts to Vite and from Jest to Vitest, several legacy artifacts and structural inconsistencies remained.

**Phase 1 Status - ✅ COMPLETED:**
Phase 1 (Legacy Migration Artifacts) has been successfully completed, removing 454 packages (~35% reduction) including all Jest, Babel, and unused dependencies. The project now has a clean, modern testing setup with Vitest, functional VS Code debugging, and reduced technical debt.

**Phase Priority:**
The project structure reorganization (Phase 2) is now the main focus, providing clear architectural improvements and better maintainability. This comprehensive restructuring will establish a solid foundation for future development.

**Implementation Phases:**

- Phase 2: **Project Structure Improvements** (MAIN FOCUS - context consolidation, comprehensive reorganization, path aliases)
- Phase 3: Code Modernization (React imports cleanup)
- Phase 4: Final Cleanup (documentation, unused file audit)
- Phase 5: TypeScript Migration (comprehensive type safety)

---

## Table of Contents

1. [Issues Discovered](#issues-discovered)
2. [Refactoring Goals](#refactoring-goals)
3. [Implementation Plan](#implementation-plan)
   - [Phase 1: Legacy Migration Artifacts ✅ COMPLETED](#phase-1-remove-legacy-migration-artifacts--completed)
   - [Phase 2: Project Structure Improvements](#phase-2-project-structure-improvements-medium-risk-high-value) ⭐ **MAIN FOCUS**
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

### Phase 2: Project Structure Improvements ⭐ **MAIN FOCUS** (Medium Risk, High Value)

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

**Validation:** Build passes (12,228 modules), all 419 tests pass

---

#### Step 2.2: Reorganize Component and Source Structure

**Priority:** HIGH (Main focus of Phase 2)

**Current Project Structure Analysis:**

```json
"paths": {
  "@components/*": ["./src/components/*"],
  "@contexts/*": ["./src/contexts/*"],
  "@pages/*": ["./src/pages/*"],
  "@hooks/*": ["./src/hooks/*"],
  "@utils/*": ["./src/utils/*"],
  "@models/*": ["./src/models/*"],
  "@api/*": ["./src/api/*"],
  "@test/*": ["./src/test/*"],
  "@assets/*": ["./src/assets/*"],
  "@styles/*": ["./src/styles/*"],
  "@data/*": ["./src/data/*"]
}
```

**Proposed Additions (After Component Reorganization - Step 3.3):**

If component structure is reorganized per Step 3.3, add these granular aliases:

```json
"paths": {
  // Top-level folders
  "@components/*": ["./src/components/*"],
  "@contexts/*": ["./src/contexts/*"],
  "@pages/*": ["./src/pages/*"],
  "@hooks/*": ["./src/hooks/*"],
  "@utils/*": ["./src/utils/*"],
  "@models/*": ["./src/models/*"],
  "@api/*": ["./src/api/*"],
  "@test/*": ["./src/test/*"],
  "@assets/*": ["./src/assets/*"],
  "@styles/*": ["./src/styles/*"],
  "@data/*": ["./src/data/*"],

  // Component structure aliases (after reorganization)
  "@layout/*": ["./src/components/layout/*"],
  "@ui/*": ["./src/components/ui/*"],
  "@features/*": ["./src/components/features/*"],
  "@shared/*": ["./src/components/shared/*"]
}
```

**Actions:**

1. **Update `tsconfig.json`** (Basic aliases first):

   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@components/*": ["./src/components/*"],
         "@contexts/*": ["./src/contexts/*"],
         "@pages/*": ["./src/pages/*"],
         "@hooks/*": ["./src/hooks/*"],
         "@utils/*": ["./src/utils/*"],
         "@models/*": ["./src/models/*"],
         "@api/*": ["./src/api/*"],
         "@test/*": ["./src/test/*"],
         "@assets/*": ["./src/assets/*"],
         "@styles/*": ["./src/styles/*"],
         "@data/*": ["./src/data/*"]
       }
     }
   }
   ```

2. **Update `vite.config.ts`** (add resolve.alias):

   ```typescript
   import path from 'path';

   export default defineConfig({
     // ...
     resolve: {
       alias: {
         '@components': path.resolve(__dirname, './src/components'),
         '@contexts': path.resolve(__dirname, './src/contexts'),
         '@pages': path.resolve(__dirname, './src/pages'),
         '@hooks': path.resolve(__dirname, './src/hooks'),
         '@utils': path.resolve(__dirname, './src/utils'),
         '@models': path.resolve(__dirname, './src/models'),
         '@api': path.resolve(__dirname, './src/api'),
         '@test': path.resolve(__dirname, './src/test'),
         '@assets': path.resolve(__dirname, './src/assets'),
         '@styles': path.resolve(__dirname, './src/styles'),
         '@data': path.resolve(__dirname, './src/data'),
         // Add after component reorganization:
         // '@layout': path.resolve(__dirname, './src/components/layout'),
         // '@ui': path.resolve(__dirname, './src/components/ui'),
         // '@features': path.resolve(__dirname, './src/components/features'),
         // '@shared': path.resolve(__dirname, './src/components/shared'),
       },
     },
   });
   ```

3. **Example usage after basic aliases:**

   ```typescript
   // Before:
   import { useProtectedApi } from '../../../components/providers/ApiProvider';
   import { ReferenceDataContext } from '../../../data/ReferenceDataContext';
   import DeviceLogin from '../../pages/DeviceLogin';

   // After (with basic aliases):
   import { useProtectedApi } from '@contexts/api/ApiProvider';
   import { ReferenceDataContext } from '@data/ReferenceDataContext';
   import DeviceLogin from '@pages/DeviceLogin';
   ```

4. **Example usage after component reorganization (Step 3.3):**

   ```typescript
   // Before:
   import ConfirmDialog from '../../../components/ConfirmDialog';
   import { EditorButtons } from '../../../components/buttons/editors/EditorButtons';
   import InstallButton from '../../../components/buttons/app/InstallButton';

   // After (with granular aliases):
   import ConfirmDialog from '@ui/dialogs/ConfirmDialog';
   import { EditorButtons } from '@features/instance-config/tabs/editors/EditorButtons';
   import InstallButton from '@features/apps/buttons/InstallButton';

   // Or even simpler with @features:
   import InstallButton from '@features/apps/buttons/InstallButton';
   import { MarketplaceList } from '@features/marketplace/MarketplaceList';
   import { AppBar } from '@layout/AppBar/AppBar';
   import { LoadButton } from '@ui/buttons/LoadButton';
   ```

**Benefits:**

- **Shorter imports:** No more `../../../` chains
- **Location independent:** Move files without breaking imports
- **Self-documenting:** Clear where components come from
- **IDE support:** Better autocomplete and navigation
- **Refactor-friendly:** Easier to reorganize structure

**Recommendation:**

1. Implement basic aliases (top-level folders) immediately - Low risk, high value
2. Add granular component aliases only after Step 2.2 completion
3. Update imports incrementally, file by file, during other refactoring work
4. Use IDE's "Refactor → Move" feature to automatically update imports when reorganizing

---

#### Step 2.3: Enhance TypeScript Path Aliases

**Priority:** MEDIUM (After Step 2.2 completion)

**Note:** This step should be implemented AFTER the component and source structure reorganization (Step 2.2) to align path aliases with the new folder structure.

**Current Aliases:**

```
src/
  ├── App.jsx                    # Main app component
  ├── main.tsx                   # Entry point
  ├── __mocks__/ (3 files)       # Root-level mocks
  ├── __tests__/                 # Root-level tests
  ├── api/ (29 files)            # API services and clients
  ├── assets/                    # Static assets
  ├── components/ (172 files)    # React components
  ├── data/ (9 files)            # Context providers (mixed with components/providers/)
  ├── hooks/ (1 file)            # Custom React hooks
  ├── models/ (8 files)          # TypeScript interfaces/types
  ├── pages/ (18 files)          # Route/page components
  ├── styles/ (4 files)          # Theme and styling
  ├── test/ (6 files)            # Test utilities
  ├── utils/ (8 files)           # Utility functions
  └── whitelabeling/ (4 files)  # Custom branding
```

**Current Issues:**

**Components folder (172 files):**

- Mix of flat and nested structure (25 root-level component files + 10 subdirectories)
- Inconsistent naming conventions (app_bar uses snake_case)
- Domain-specific vs UI components not clearly separated
- Similar components scattered across different locations

**Data folder (9 files):**

- Mix of context providers and data fetchers
- Some providers in `components/providers/`, others in `data/`
- No clear distinction between contexts and data services

**API folder (29 files):**

- Well-organized by domain (device/, marketplace/)
- Could benefit from better separation of concerns

**Other folders:**

- `hooks/` only has 1 file (usePagination.js)
- `components/LocalStorage.js` is actually a hook, not a component
- Test utilities scattered between `test/` and `__tests__/`
- Root level could be cleaner

**Proposed Comprehensive Reorganization:**

```
src/
  │
  ├── app/                                     # Application core (NEW)
  │   ├── App.tsx                              # Main app component (from root)
  │   ├── main.tsx                             # Entry point (from root)
  │   └── routes.tsx                           # Route definitions (from pages/ui-routes.tsx)
  │
  ├── pages/                                   # Route components (18 files)
  │   ├── InstalledAppsPage.tsx                # Renamed for clarity
  │   ├── MarketplacePage.tsx
  │   ├── ServiceMeshPage.tsx
  │   ├── SystemPage.tsx
  │   ├── ProfilePage.tsx
  │   ├── DeviceLoginPage.tsx
  │   ├── OAuthCallbackPage.tsx
  │   ├── OpenSourcePage.tsx
  │   ├── NotFoundPage.tsx
  │   └── __tests__/                           # Co-located tests
  │
  ├── features/                                # Feature modules (NEW organization)
  │   │
  │   ├── apps/                                # App management (31 files)
  │   │   ├── components/
  │   │   │   ├── cards/
  │   │   │   │   ├── AppCard.tsx              # Renamed from Card.tsx
  │   │   │   │   └── AppCardFull.tsx          # Renamed from FullCard.tsx
  │   │   │   ├── installation/
  │   │   │   │   ├── InstallationStepper.tsx
  │   │   │   │   ├── InstallApp.tsx
  │   │   │   │   ├── UpdateApp.tsx
  │   │   │   │   ├── SideloadApp.tsx
  │   │   │   │   └── DeviceActivationStep.tsx
  │   │   │   ├── rating/
  │   │   │   │   └── AppRating.tsx
  │   │   │   ├── AppInstanceRow.tsx           # From components root
  │   │   │   └── AppFilter.tsx                # From components root
  │   │   ├── buttons/
  │   │   │   ├── InstallButton.tsx
  │   │   │   ├── UninstallButton.tsx
  │   │   │   └── UpdateButton.tsx
  │   │   ├── api/                             # From src/api/device/apps/
  │   │   │   └── install.ts
  │   │   ├── models/
  │   │   │   └── app.ts                       # From src/models/
  │   │   └── __tests__/
  │   │
  │   ├── marketplace/                         # Marketplace features (5 files)
  │   │   ├── components/
  │   │   │   ├── MarketplaceList.tsx          # From components root
  │   │   │   ├── InstalledAppsList.tsx        # From components root
  │   │   │   └── InstalledAppsListRow.tsx     # From components root
  │   │   ├── api/                             # From src/api/marketplace/
  │   │   │   ├── ProductService.ts
  │   │   │   ├── VersionService.ts
  │   │   │   ├── AppRatingService.ts
  │   │   │   └── MarketplaceAuthService.ts
  │   │   ├── models/
  │   │   │   └── marketplace.ts               # From src/models/
  │   │   └── __tests__/
  │   │
  │   ├── instances/                           # Instance management (14 files)
  │   │   ├── components/
  │   │   │   ├── InstanceInfo.tsx             # From components root
  │   │   │   ├── InstanceDetails.tsx          # From components root
  │   │   │   ├── InstanceLog.tsx              # From components root
  │   │   │   ├── VolumesTable.tsx             # From components root
  │   │   │   ├── HostContainerTable.tsx       # From components root
  │   │   │   └── CollapsableRow.tsx           # From components root
  │   │   ├── config/                          # Instance configuration dialogs (18 files)
  │   │   │   ├── InstanceConfigDialog.tsx     # From components/dialogs/
  │   │   │   └── tabs/
  │   │   │       ├── PortsConfigTab.tsx
  │   │   │       ├── NetworkConfigTab.tsx
  │   │   │       ├── UsbConfigTab.tsx
  │   │   │       ├── EnvironmentConfigTab.tsx
  │   │   │       ├── EditorConfigTab.tsx
  │   │   │       ├── port-mappings/
  │   │   │       ├── networks/
  │   │   │       ├── usb-devices/
  │   │   │       ├── environments/
  │   │   │       └── editors/
  │   │   ├── buttons/
  │   │   │   └── InstanceStartCreateButtons.tsx
  │   │   ├── api/                             # From src/api/device/
  │   │   │   ├── instance.ts
  │   │   │   ├── InstanceDetailsService.ts
  │   │   │   └── InstanceLogService.ts
  │   │   └── __tests__/
  │   │
  │   ├── device/                              # Device management (11 files)
  │   │   ├── components/
  │   │   │   ├── DeviceActivation.tsx
  │   │   │   └── version/
  │   │   │       └── VersionsTable.tsx
  │   │   ├── license/
  │   │   │   ├── LicenseInfo.tsx
  │   │   │   └── DeviceActivationButton.tsx   # From components/buttons/license/
  │   │   ├── api/                             # From src/api/device/
  │   │   │   ├── license/
  │   │   │   └── onboarding/
  │   │   ├── models/
  │   │   │   └── system.ts                    # From src/models/
  │   │   └── __tests__/
  │   │
  │   ├── auth/                                # Authentication (6 files)
  │   │   ├── components/
  │   │   │   ├── AuthGuard.tsx
  │   │   │   └── MarketplaceLogin.tsx
  │   │   ├── api/                             # From src/api/auth-provider-client/
  │   │   │   └── api-client.ts
  │   │   ├── utils/                           # From src/utils/auth/
  │   │   │   ├── authprovider-utils.ts
  │   │   │   └── jwt-utils.ts
  │   │   └── __tests__/
  │   │
  │   ├── quests/                              # Quest system (8 files)
  │   │   ├── components/
  │   │   │   ├── QuestLog.tsx
  │   │   │   ├── QuestLogDialog.tsx           # From components/dialogs/
  │   │   │   ├── QuestLogEntry.tsx
  │   │   │   ├── QuestLogEntryBody.tsx
  │   │   │   ├── QuestIcon.tsx
  │   │   │   ├── QuestProgressIndicator.tsx
  │   │   │   └── SubQuestProgressIndicator.tsx
  │   │   ├── contexts/
  │   │   │   └── QuestContext.tsx
  │   │   ├── utils/                           # From src/utils/quests/
  │   │   │   ├── Quest.ts
  │   │   │   └── QuestState.ts
  │   │   └── __tests__/
  │   │
  │   ├── onboarding/                          # First-time setup (9 files)
  │   │   ├── components/
  │   │   │   ├── OnboardingDialog.tsx
  │   │   │   └── OnboardingStepper.tsx
  │   │   ├── steps/
  │   │   │   ├── AuthProviderStep.tsx
  │   │   │   ├── SuperAdminStep.tsx
  │   │   │   └── CompletionStep.tsx
  │   │   ├── providers/
  │   │   │   └── OnboardingProvider.tsx
  │   │   └── __tests__/
  │   │
  │   ├── export/                              # Export functionality (2 files)
  │   │   ├── components/
  │   │   │   ├── Export.tsx                   # From components/buttons/export/
  │   │   │   └── ExportList.tsx               # From components/lists/flecsports/
  │   │   └── __tests__/
  │   │
  │   ├── system/                              # System info (3 files)
  │   │   ├── components/
  │   │   │   ├── Version.tsx                  # From components root
  │   │   │   └── Import.tsx                   # From components root
  │   │   ├── contexts/
  │   │   │   ├── SystemData.tsx               # From src/data/
  │   │   │   └── SystemProvider.tsx           # From src/data/
  │   │   └── __tests__/
  │   │
  │   └── help/                                # Help system (1 file)
  │       ├── components/
  │       │   └── HelpButton.tsx
  │       └── __tests__/
  │
  ├── layout/                                  # Layout components (8 files)
  │   ├── AppBar/
  │   │   ├── AppBar.tsx                       # From components root
  │   │   ├── Logo.tsx                         # From components/app_bar/
  │   │   └── Avatar.tsx                       # From components/menus/avatar/
  │   ├── Drawer/
  │   │   ├── Drawer.tsx                       # From components root
  │   │   ├── PoweredBy.tsx                    # From components/navigation/
  │   │   └── FLECSLogo.tsx                    # From components/navigation/
  │   ├── Frame/
  │   │   └── Frame.tsx                        # From components root
  │   └── __tests__/
  │
  ├── ui/                                      # Reusable UI components (27 files)
  │   ├── buttons/
  │   │   ├── LoadButton.tsx                   # From components root
  │   │   └── LoadIconButton.tsx               # From components root
  │   ├── dialogs/
  │   │   ├── ConfirmDialog.tsx                # From components root
  │   │   └── ContentDialog.tsx                # From components root
  │   ├── feedback/
  │   │   ├── ActionSnackbar.tsx               # From components root
  │   │   └── Loading.tsx                      # From components root
  │   ├── inputs/
  │   │   ├── SearchBar.tsx                    # From components root
  │   │   ├── FileOpen.tsx                     # From components root
  │   │   └── VersionSelector.tsx              # From components/autocomplete/
  │   ├── text/
  │   │   └── MarqueeText.tsx                  # From components/text/
  │   ├── steppers/                            # Generic wizard (4 files)
  │   │   ├── components/
  │   │   │   ├── MultiStepWizard.tsx
  │   │   │   └── HorizontalStepper.tsx
  │   │   ├── providers/
  │   │   │   └── WizardProvider.tsx
  │   │   └── types/
  │   │       └── types.tsx
  │   └── __tests__/
  │
  ├── contexts/                                # React contexts (NEW, consolidate)
  │   ├── api/
  │   │   ├── ApiProvider.tsx                  # From components/providers/
  │   │   └── AuthProviderApiProvider.tsx      # From components/providers/
  │   ├── auth/
  │   │   └── OAuth4WebApiAuthProvider.tsx     # From components/providers/
  │   ├── data/
  │   │   ├── AppListContext.tsx               # From data/AppList.jsx
  │   │   ├── FilterContext.tsx                # From data/FilterContext.jsx
  │   │   └── ReferenceDataContext.tsx         # From data/ReferenceDataContext.jsx
  │   ├── device/
  │   │   ├── DeviceStateProvider.tsx          # From components/providers/
  │   │   └── DeviceActivationProvider.tsx     # From components/providers/
  │   ├── marketplace/
  │   │   └── MarketplaceUserProvider.tsx      # From components/providers/
  │   ├── Providers.tsx                        # Root provider composition
  │   ├── index.ts                             # Re-export all
  │   └── __tests__/
  │
  ├── api/                                     # Shared API utilities
  │   ├── api-config.ts                        # From api-config.js
  │   ├── flecs-core/
  │   │   └── api-client.ts
  │   └── __mocks__/
  │
  ├── hooks/                                   # Custom React hooks (2 files)
  │   ├── usePagination.ts                     # From hooks/usePagination.js
  │   ├── useLocalStorage.ts                   # From components/LocalStorage.js
  │   └── __tests__/
  │
  ├── models/                                  # TypeScript types/interfaces (5 files)
  │   ├── shared/                              # Shared models
  │   │   ├── job.ts                           # From models/job.tsx
  │   │   └── version.ts                       # From models/version.ts (+ VersionInterfaces.tsx)
  │   └── __mocks__/
  │
  ├── utils/                                   # Utility functions (4 files)
  │   ├── html-utils.ts
  │   ├── version-utils.ts
  │   └── __tests__/
  │
  ├── styles/                                  # Theming and styles (4 files)
  │   ├── ThemeHandler.tsx
  │   ├── theme.tsx
  │   ├── tokens.tsx
  │   └── fonts.css
  │
  ├── whitelabeling/                           # Custom branding (4 files)
  │   ├── WhiteLabelLogo.tsx
  │   ├── custom-theme.tsx
  │   ├── custom-tokens.tsx
  │   └── custom-fonts.css
  │
  ├── assets/                                  # Static assets
  │   ├── fonts/
  │   ├── images/
  │   ├── third-party-licenses.txt
  │   ├── sbom.json
  │   └── favicon.ico
  │
  ├── test/                                    # Test utilities (6 files)
  │   ├── setup.ts
  │   ├── test-utils.ts
  │   ├── oauth-setup.ts
  │   ├── oauth-test-utils.tsx
  │   ├── README.md
  │   └── README-OAuth-Testing.md
  │
  └── __mocks__/                               # Root-level mocks (3 files)
      ├── api.ts
      ├── core-client-ts.ts
      └── auth-provider-client-ts.ts
```

**Key Changes Across Entire Project:**

1. **Feature-Based Organization:**
   - Each feature (`apps/`, `marketplace/`, `instances/`, etc.) contains its own:
     - Components
     - API services
     - Models
     - Tests
     - Utilities
   - Clear boundaries and reduced coupling

2. **Consolidated Contexts:**
   - All providers moved from `components/providers/` and `data/` to `contexts/`
   - Clear separation of concerns
   - Easy to understand app-wide state

3. **Proper Hook Location:**
   - `LocalStorage.js` moved from `components/` to `hooks/useLocalStorage.ts`
   - All hooks in one place

4. **Feature Cohesion:**
   - Related API services, components, and models grouped together
   - E.g., `features/apps/` contains app cards, installation, buttons, AND app API
   - Easier to find everything related to a feature

5. **Cleaner Root:**
   - `App.tsx` and `main.tsx` moved to `app/` folder
   - Root level only has high-level folders

6. **Consistent Naming:**
   - Pages renamed with `Page` suffix for clarity
   - Components use descriptive names (AppCard instead of just Card)
   - All folders use kebab-case or PascalCase consistently

7. **Type Consolidation:**
   - Models grouped by domain or moved to feature folders
   - Shared models kept in `models/shared/`

**Migration Benefits:**

1. **Feature Autonomy:**
   - Each feature is self-contained
   - Easy to understand all parts of a feature
   - Reduced cross-cutting concerns

2. **Improved Discoverability:**
   - New developers can navigate by feature
   - Related code is physically close
   - Clear hierarchy from high-level to implementation

3. **Better Scalability:**
   - Add new features without affecting others
   - Easy to extract features as separate packages
   - Clear dependencies between features

4. **Reduced Import Complexity:**
   - With path aliases: `@features/apps/components/AppCard`
   - Or: `@ui/buttons/LoadButton`
   - No more `../../../` chains

5. **Easier Maintenance:**
   - Changes to one feature don't affect others
   - Easy to find and update related code
   - Tests co-located with implementation

**Implementation Strategy:**

**Phase 1: Foundation (Low Risk)**

1. Create new folder structure
2. Move `contexts/` providers (consolidate from components/providers/ and data/)
3. Move `hooks/` (including LocalStorage → useLocalStorage)
4. Update path aliases in tsconfig.json and vite.config.ts

**Phase 2: Layout & UI (Medium Risk)**

1. Reorganize `layout/` components
2. Consolidate `ui/` components
3. Update imports using IDE refactoring

**Phase 3: Features (High Value, Incremental)**

1. Move one feature at a time (start with smallest: help, export)
2. For each feature:
   - Create feature folder structure
   - Move components
   - Move related API services
   - Move related models
   - Move related utilities
   - Update all imports
   - Run tests to verify
3. Recommended order:
   - help/ (1 component)
   - export/ (2 components)
   - system/ (3 components)
   - auth/ (6 files)
   - device/ (11 files)
   - quests/ (8 files)
   - onboarding/ (9 files)
   - instances/ (14 files)
   - apps/ (31 files)
   - marketplace/ (5 files + API)

**Phase 4: Final Cleanup**

1. Move `app/` folder items
2. Clean up old folder structure
3. Update documentation
4. Final import cleanup

**Estimated Effort:** 20-30 hours for complete reorganization

#### Step 2.3: Enhance TypeScript Path Aliases

**Priority:** MEDIUM (After Step 2.2 completion)

**Note:** This step should be implemented AFTER the component and source structure reorganization (Step 2.2) to align path aliases with the new folder structure.

**Current Aliases:**

```json
"paths": {
  "@components/*": ["./src/components/*"],
  "@api/*": ["./src/api/*"]
}
```

**Proposed Additions (Basic Level - Implement First):**

```json
"paths": {
  "@components/*": ["./src/components/*"],
  "@contexts/*": ["./src/contexts/*"],
  "@pages/*": ["./src/pages/*"],
  "@hooks/*": ["./src/hooks/*"],
  "@utils/*": ["./src/utils/*"],
  "@models/*": ["./src/models/*"],
  "@api/*": ["./src/api/*"],
  "@test/*": ["./src/test/*"],
  "@assets/*": ["./src/assets/*"],
  "@styles/*": ["./src/styles/*"],
  "@data/*": ["./src/data/*"]
}
```

**Proposed Additions (After Step 2.2 Reorganization - Granular Aliases):**

Once the component structure is reorganized per Step 2.2, add these feature-based aliases:

```json
"paths": {
  // Top-level folders
  "@app/*": ["./src/app/*"],
  "@pages/*": ["./src/pages/*"],
  "@contexts/*": ["./src/contexts/*"],
  "@hooks/*": ["./src/hooks/*"],
  "@utils/*": ["./src/utils/*"],
  "@models/*": ["./src/models/*"],
  "@api/*": ["./src/api/*"],
  "@test/*": ["./src/test/*"],
  "@assets/*": ["./src/assets/*"],
  "@styles/*": ["./src/styles/*"],

  // Feature-based aliases (after Step 2.2)
  "@features/*": ["./src/features/*"],
  "@layout/*": ["./src/layout/*"],
  "@ui/*": ["./src/ui/*"]
}
```

**Actions:**

1. **Update `tsconfig.json`** (Basic aliases immediately, granular after Step 2.2):

   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         // ... see proposed additions above
       }
     }
   }
   ```

2. **Update `vite.config.ts`** (add resolve.alias):

   ```typescript
   import path from 'path';

   export default defineConfig({
     // ...
     resolve: {
       alias: {
         '@app': path.resolve(__dirname, './src/app'),
         '@features': path.resolve(__dirname, './src/features'),
         '@layout': path.resolve(__dirname, './src/layout'),
         '@ui': path.resolve(__dirname, './src/ui'),
         '@contexts': path.resolve(__dirname, './src/contexts'),
         '@pages': path.resolve(__dirname, './src/pages'),
         '@hooks': path.resolve(__dirname, './src/hooks'),
         '@utils': path.resolve(__dirname, './src/utils'),
         '@models': path.resolve(__dirname, './src/models'),
         '@api': path.resolve(__dirname, './src/api'),
         '@test': path.resolve(__dirname, './src/test'),
         '@assets': path.resolve(__dirname, './src/assets'),
         '@styles': path.resolve(__dirname, './src/styles'),
       },
     },
   });
   ```

3. **Example usage after reorganization:**

   ```typescript
   // Before:
   import { useProtectedApi } from '../../../components/providers/ApiProvider';
   import ConfirmDialog from '../../../components/ConfirmDialog';
   import InstallButton from '../../../components/buttons/app/InstallButton';

   // After (with new aliases):
   import { useProtectedApi } from '@contexts/api/ApiProvider';
   import ConfirmDialog from '@ui/dialogs/ConfirmDialog';
   import InstallButton from '@features/apps/buttons/InstallButton';
   import { AppBar } from '@layout/AppBar/AppBar';
   import { LoadButton } from '@ui/buttons/LoadButton';
   import DeviceLogin from '@pages/DeviceLoginPage';
   ```

**Benefits:**

- **Shorter imports:** No more `../../../` chains
- **Location independent:** Move files without breaking imports
- **Self-documenting:** Clear where components come from
- **IDE support:** Better autocomplete and navigation
- **Refactor-friendly:** Easier to reorganize structure

**Implementation Strategy:**

1. Add basic aliases (top-level folders) after Step 2.1 (context consolidation)
2. Add granular aliases (features, layout, ui) after Step 2.2 (full reorganization)
3. Update imports incrementally during the reorganization process
4. Use IDE's "Refactor → Move" feature to automatically update imports

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
src/data/AppList.jsx → src/data/AppList.tsx
src/data/FilterContext.jsx → src/data/FilterContext.tsx
src/data/SystemData.jsx → src/data/SystemData.tsx
src/data/ReferenceDataContext.jsx → src/data/ReferenceDataContext.tsx
```

**Tier 3 - Core Components:**

```
src/components/Frame.jsx → src/components/Frame.tsx
src/components/AppInstanceRow.jsx → src/components/AppInstanceRow.tsx
src/components/InstalledAppsList.jsx → src/components/InstalledAppsList.tsx
src/components/MarketplaceList.jsx → src/components/MarketplaceList.tsx
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
src/components/LocalStorage.js → src/utils/localStorage.ts (also move)
```

**Mocks:**

```
src/api/__mocks__/auth-header.js → .ts
src/api/marketplace/__mocks__/*.js → .ts
src/data/__mocks__/*.js → .ts
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

- **Phase 2 (Structure Changes):** Mass file moves can break imports
  - **Mitigation:** Use IDE refactoring tools, verify builds frequently, implement feature-by-feature
  - **Rollback Plan:** Multiple smaller PRs for easy isolated reverts

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

- ⚪ **Phase 2:** Project structure reorganization (context consolidation, comprehensive restructuring, path aliases)
- ⚪ **Phase 3:** React import cleanup and code modernization
- ⚪ **Phase 4:** Documentation updates and final cleanup
- ⚪ **Phase 5:** TypeScript migration (~80 JSX → TSX, ~19 JS → TS, PropTypes replacement)

### Qualitative Metrics

**Completed:**

- ✅ Developers can debug tests in VS Code
- ✅ Faster test execution (Vitest vs Jest)
- ✅ Cleaner dependency tree
- ✅ No dual testing configurations

**Remaining:**

- ⚪ Clearer project structure (Phase 2)
- ⚪ Reduced cognitive load for new developers (Phase 2)
- ⚪ Improved code navigation with path aliases (Phase 2)
- ⚪ Feature-based architecture (Phase 2)
- ⚪ Modern React 19 code practices (Phase 3)
- ⚪ Full type safety in all components (Phase 5)
- ⚪ Consistent file naming across project (Phase 5)

---

## Implementation Timeline

### Current Status (Updated February 16, 2026)

**✅ Completed:**

- Phase 1: Legacy artifact removal - DONE
- Phase 2, Step 2.1: Context/provider consolidation - DONE

**⏸️ Deferred to Future Initiative:**

- TypeScript Migration (Former Phase 2) - To be planned separately

**📋 Remaining Phases:**

**Phase 2: Project Structure Improvements** (In Progress)

- ✅ Step 2.1: Consolidate context/provider files - DONE
- ⭐ Step 2.2: Reorganize component and source structure - NEXT

**Phase 3: Code Modernization** (Est. 4-6 hours)

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

**Completed Achievements (Phase 1):**

1. ✅ **Removed technical debt** - Eliminated 454 obsolete packages (~35% reduction)
2. ✅ **Improved developer experience** - Working debug tools for Vitest
3. ✅ **Cleaner configuration** - No dual test runner setup
4. ✅ **Faster development** - Vitest performance improvements
5. ✅ **Reduced bundle size** - Lighter dependency footprint

**Remaining Work:**

The plan continues with Phases 2-4 focused on code modernization, project structure improvements, and final cleanup. TypeScript migration has been deferred to a dedicated future initiative to allow for focused, comprehensive type coverage without mixing concerns.

**Current Status:** Phase 1 complete, Phase 2 Step 2.1 complete. Context/provider files consolidated into `src/contexts/` with full path alias support. All 419 tests passing, build successful.

**Next Steps:**

- Phase 2, Step 2.2: Reorganize component and source structure
- Phase 3: Code Modernization (fix React imports, remove unnecessary imports)
- Phase 4: Final Cleanup (documentation updates, unused file audit)
- Future: TypeScript Migration (separate dedicated initiative)
