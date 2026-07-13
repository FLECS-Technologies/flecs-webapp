/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Fri Jun 20 2025
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

import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import { loadTenant } from './tenant';
import { TenantContext } from './app/theme/TenantContext';
import { themingAssetPath } from './brandAssets';

const tenant = await loadTenant();
document.title = tenant.app_title;

// The favicon is a white-label file under theming/, so it's linked at runtime
// (against the mount prefix) rather than statically in index.html, where a
// root-absolute /favicon.ico would miss both the proxy prefix and theming/.
const iconLink = document.createElement('link');
iconLink.rel = 'icon';
iconLink.href = themingAssetPath('favicon.ico');
document.head.appendChild(iconLink);

// Append theme.css last so it overrides the Tailwind bundle in both dev and prod.
const themeLink = document.createElement('link');
themeLink.rel = 'stylesheet';
themeLink.href = themingAssetPath('theme.css');
document.head.appendChild(themeLink);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TenantContext.Provider value={tenant}>
      <Router>
        <App />
      </Router>
    </TenantContext.Provider>
  </React.StrictMode>,
);
