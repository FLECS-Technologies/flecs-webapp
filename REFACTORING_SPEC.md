# FLECS WebApp Refactoring Specification

**Date Created:** February 9, 2026  
**Version:** 1.0.0  
**Current Branch:** FLX-1214-store-visible-menu-items-in-state

## Executive Summary

This document outlines a comprehensive refactoring plan for the FLECS WebApp project. After migrating from Create React App (CRA) with react-scripts to Vite and from Jest to Vitest, several legacy artifacts and structural inconsistencies remain. This specification identifies issues and provides an actionable implementation plan to modernize the codebase, improve maintainability, and eliminate technical debt.

---

## Table of Contents

1. [Issues Discovered](#issues-discovered)
2. [Refactoring Goals](#refactoring-goals)
3. [Implementation Plan](#implementation-plan)
4. [Risk Assessment](#risk-assessment)
5. [Success Metrics](#success-metrics)

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
import { React } from 'react';  // ❌ Wrong syntax

// Unnecessary default import (80+ files):
import React from 'react';  // ⚠️ Not needed with new JSX transform
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

### Primary Goals
1. **Complete Migration to Vite/Vitest:** Remove all Jest and react-scripts artifacts
2. **TypeScript Consistency:** Convert all `.jsx` and `.js` files to `.tsx`/`.ts`
3. **Modernize React Usage:** Remove unnecessary React imports, migrate PropTypes to TypeScript
4. **Improve Project Structure:** Organize components logically, utilize path aliases
5. **Reduce Dependencies:** Remove ~10 unnecessary packages
6. **Fix VS Code Integration:** Update debug configurations for Vitest

### Secondary Goals
1. Improve code documentation
2. Establish clear architectural patterns
3. Enhance developer experience
4. Reduce bundle size

---

## Implementation Plan

### Phase 1: Remove Legacy Migration Artifacts (Low Risk, High Impact)
**Estimated Time:** 2-4 hours  
**Risk Level:** 🟢 Low

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
    'vitest-globals/env': true,  // Changed from jest: true
  },
  extends: [
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',  // Added for React 19
    'standard',
    'prettier'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',  // Changed from 12
    sourceType: 'module',
  },
  plugins: ['react', 'vitest-globals'],  // Added vitest-globals
  rules: {
    camelcase: 'off',
    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'no-undef': 'off',
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    'react/react-in-jsx-scope': 'off',  // Not needed with new JSX transform
    'react/prop-types': 'off',  // We'll use TypeScript instead
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

### Phase 2: TypeScript Migration (Medium Risk, High Value)
**Estimated Time:** 8-16 hours  
**Risk Level:** 🟡 Medium

#### Step 2.1: Migrate Priority Files to TypeScript
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

#### Step 2.2: Migrate JavaScript Files to TypeScript
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

### Phase 3: Code Modernization (Low Risk, Medium Value)
**Estimated Time:** 4-6 hours  
**Risk Level:** 🟢 Low

#### Step 3.1: Remove Unnecessary React Imports
**Priority:** LOW

**Actions:**
1. **Fix incorrect React imports** in files using `import { React }`:
   ```typescript
   // Files: src/App.jsx, src/pages/Marketplace.jsx
   // Before:
   import { React } from 'react';  // ❌ Wrong
   
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

#### Step 3.2: Remove PropTypes Package (After TypeScript Migration)
**Priority:** LOW (do after Phase 2)

**Actions:**
1. **Verify** all PropTypes have been replaced with TypeScript
2. **Remove** `prop-types` dependency:
   ```bash
   pnpm remove prop-types
   ```

3. **Search** for any remaining PropTypes usage:
   ```bash
   grep -r "PropTypes" src/
   grep -r "propTypes" src/
   ```

---

### Phase 4: Project Structure Improvements (Medium Risk, High Value)
**Estimated Time:** 6-12 hours  
**Risk Level:** 🟡 Medium

#### Step 4.1: Consolidate Context/Provider Files
**Priority:** HIGH

**Current State:**
- Providers in: `src/components/providers/`
- Data providers in: `src/data/`

**Proposed Structure:**
```
src/
  ├── contexts/  (NEW - consolidate all context/providers)
  │   ├── api/
  │   │   ├── ApiProvider.tsx
  │   │   └── AuthProviderApiProvider.tsx
  │   ├── auth/
  │   │   └── OAuth4WebApiAuthProvider.tsx
  │   ├── data/
  │   │   ├── AppListContext.tsx
  │   │   ├── FilterContext.tsx
  │   │   ├── ReferenceDataContext.tsx
  │   │   └── SystemContext.tsx
  │   ├── device/
  │   │   └── DeviceStateProvider.tsx
  │   ├── marketplace/
  │   │   └── MarketplaceUserProvider.tsx
  │   ├── quests/
  │   │   └── QuestContext.tsx
  │   ├── Providers.tsx  (Root provider composition)
  │   └── index.ts  (Re-export all)
```

**Actions:**
1. Create `src/contexts/` directory
2. Move files:
   ```bash
   # From components/providers
   mv src/components/providers/* src/contexts/
   
   # From data (context-related)
   mv src/data/FilterContext.tsx src/contexts/data/
   mv src/data/SystemProvider.tsx src/contexts/data/
   mv src/data/ReferenceDataContext.tsx src/contexts/data/
   ```

3. Keep in `src/data/`:
   - `AppList.tsx` (if it's just a data fetcher, not a context)
   - `SystemData.tsx` (ditto)

4. Create barrel export `src/contexts/index.ts`:
   ```typescript
   export * from './api/ApiProvider';
   export * from './auth/OAuth4WebApiAuthProvider';
   export * from './data/FilterContext';
   // ... etc
   ```

5. Update all imports across codebase
6. Add path alias to `tsconfig.json`:
   ```json
   "@contexts/*": ["./src/contexts/*"]
   ```

---

#### Step 4.2: Enhance TypeScript Path Aliases
**Priority:** MEDIUM

**Current Aliases:**
```json
"paths": {
  "@components/*": ["./src/components/*"],
  "@api/*": ["./src/api/*"]
}
```

**Proposed Additions:**
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
  "@styles/*": ["./src/styles/*"]
}
```

**Actions:**
1. Update `tsconfig.json`
2. Update `vite.config.ts` (add resolve.alias):
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
       },
     },
   });
   ```

3. Gradually replace relative imports with aliases:
   ```typescript
   // Before:
   import { useProtectedApi } from '../../../components/providers/ApiProvider';
   
   // After:
   import { useProtectedApi } from '@contexts/api/ApiProvider';
   ```

**Recommendation:** Do this incrementally, file by file, during other refactoring tasks

---

#### Step 4.3: Reorganize Component Structure
**Priority:** LOW (Future consideration)

**Current Issues:**
- Mix of flat and nested structure
- Unclear naming conventions
- Domain vs UI components mixed

**Proposed Structure (for future consideration):**
```
src/
  ├── components/
  │   ├── ui/              # Generic UI components
  │   │   ├── buttons/
  │   │   ├── dialogs/
  │   │   ├── forms/
  │   │   ├── tables/
  │   │   └── ...
  │   ├── layout/          # Layout components
  │   │   ├── AppBar/
  │   │   ├── Drawer/
  │   │   └── Frame/
  │   ├── features/        # Feature-specific components
  │   │   ├── apps/
  │   │   ├── device/
  │   │   ├── marketplace/
  │   │   ├── auth/
  │   │   └── ...
  │   └── shared/          # Shared across features
```

**Note:** This is a larger refactor. Consider doing this in a separate, isolated PR after the other phases are complete.

---

### Phase 5: Final Cleanup (Low Risk, Low Value)
**Estimated Time:** 2-3 hours  
**Risk Level:** 🟢 Low

#### Step 5.1: Update Documentation
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

#### Step 5.2: Audit Unused Files
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

#### Step 5.3: Final Dependency Audit
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

## Risk Assessment

### High-Risk Items
- **Phase 2 (TypeScript Migration):** Breaking changes if types are incorrect
  - **Mitigation:** Migrate incrementally, run tests after each file
  - **Rollback Plan:** Git allows reverting individual file migrations

- **Phase 4 (Structure Changes):** Mass file moves can break imports
  - **Mitigation:** Use IDE refactoring tools, verify builds frequently
  - **Rollback Plan:** Separate PR for easy revert

### Medium-Risk Items
- **Phase 1 (Removing Dependencies):** Test suite could break
  - **Mitigation:** Test immediately after removal
  - **Rollback Plan:** Quick re-install of removed packages

### Low-Risk Items
- **Phase 3 (Code Modernization):** Mostly cosmetic changes
- **Phase 5 (Cleanup):** No functional changes

---

## Success Metrics

### Quantitative Metrics
- ✅ **0** remaining `.jsx` files (currently ~80)
- ✅ **0** remaining `.js` component/service files (currently ~19)
- ✅ **10-15** fewer dependencies (currently 74 total)
- ✅ **30+ MB** smaller `node_modules` size
- ✅ **100%** test pass rate maintained
- ✅ **0** ESLint errors related to test environment
- ✅ **0** legacy config files (jest.config.js, babel.config.js)

### Qualitative Metrics
- ✅ Developers can debug tests in VS Code
- ✅ Consistent file naming across project
- ✅ Type safety in all components
- ✅ Faster test execution (Vitest vs Jest)
- ✅ Clearer project structure
- ✅ Reduced cognitive load for new developers

---

## Implementation Timeline

### Recommended Approach: Incremental, By Phase

**Week 1:**
- Phase 1: Complete removal of legacy artifacts (Steps 1.1-1.4)
- Testing and validation

**Week 2-3:**
- Phase 2: TypeScript migration (Tiers 1-2 first, then 3-4)
- Continuous testing

**Week 4:**
- Phase 3: Code modernization
- Phase 4: Structure improvements (if time permits)

**Week 5:**
- Phase 5: Final cleanup and documentation
- Complete testing and PR review

### Alternative: Parallel Track Approach
- Multiple developers can work on different phases simultaneously
- Phases 1, 3, and 5 are largely independent
- Phase 2 and 4 should be coordinated to avoid conflicts

---

## Appendix

### A. Commands Reference

```bash
# Remove legacy dependencies
pnpm remove jest jest-environment-jsdom babel-jest ts-jest @types/jest \
  @babel/plugin-proposal-private-property-in-object @babel/preset-env \
  @babel/preset-react @babel/preset-typescript @babel/runtime ts-loader

# Install new dev dependency
pnpm add -D eslint-plugin-vitest-globals

# Run tests
pnpm test

# Run tests with coverage
pnpm run coverage

# Run linter
pnpm run lint

# Build project
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

This refactoring specification provides a comprehensive, phased approach to modernizing the FLECS WebApp codebase. By systematically removing legacy artifacts, migrating to TypeScript, and improving project structure, we will achieve:

1. **Better maintainability** through consistent TypeScript usage
2. **Improved developer experience** with working debug tools and clear structure
3. **Reduced technical debt** by removing obsolete configurations
4. **Faster development** with better tooling and clearer patterns
5. **Smaller bundle size** through dependency elimination

The plan is designed to be implemented incrementally with clear rollback points, minimizing risk while maximizing value delivery.

**Next Steps:** Review this specification with the team, prioritize phases based on current sprint goals, and begin with Phase 1 as it provides immediate value with minimal risk.
