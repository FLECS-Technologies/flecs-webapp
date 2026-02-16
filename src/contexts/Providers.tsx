/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Aug 05 2025
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
import { ProtectedApiProvider, PublicApiProvider } from './api/ApiProvider';
import { OAuth4WebApiAuthProvider } from './auth/OAuth4WebApiAuthProvider';
import { DeviceStateProvider } from './device/DeviceStateProvider';
import { QuestContextProvider } from './quests/QuestContext';
import { FilterContextProvider } from '@contexts/data/FilterContext';
import { SystemContextProvider } from '@contexts/data/SystemProvider';
import { ReferenceDataContextProvider } from '@contexts/data/ReferenceDataContext';
import { MarketplaceUserProvider } from './marketplace/MarketplaceUserProvider';
import { PublicAuthProviderApiProvider } from './api/AuthProviderApiProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PublicApiProvider>
      <PublicAuthProviderApiProvider>
        <DeviceStateProvider>
          <OAuth4WebApiAuthProvider>
            <ProtectedApiProvider>
              <MarketplaceUserProvider>
                <QuestContextProvider>
                  <FilterContextProvider>
                    <SystemContextProvider>
                      <ReferenceDataContextProvider>{children}</ReferenceDataContextProvider>
                    </SystemContextProvider>
                  </FilterContextProvider>
                </QuestContextProvider>
              </MarketplaceUserProvider>
            </ProtectedApiProvider>
          </OAuth4WebApiAuthProvider>
        </DeviceStateProvider>
      </PublicAuthProviderApiProvider>
    </PublicApiProvider>
  );
}
