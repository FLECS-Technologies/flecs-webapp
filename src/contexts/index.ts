/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on February 9, 2026
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

// Root providers composition
export { default as Providers } from './Providers';

// API providers
export * from './api/ApiProvider';
export * from './api/AuthProviderApiProvider';

// Auth providers
export * from './auth/OAuth4WebApiAuthProvider';
export * from './auth/oauth/useOAuthCallback';
export * from './auth/oauth/useOAuthFlow';
export * from './auth/oauth/useAuthSession';
export * from './auth/oauth/useOAuthConfig';

// Device providers
export * from './device/DeviceStateProvider';
export * from './device/DeviceActivationProvider';
export * from './device/DeviceActivationContext';

// Marketplace providers
export * from './marketplace/MarketplaceUserProvider';

// Data contexts
export * from '@contexts/data/FilterContext';
export * from '@contexts/data/ReferenceDataContext';
export * from '@contexts/data/SystemProvider';

// Quest context
export * from './quests/QuestContext';
