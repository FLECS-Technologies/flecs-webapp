/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Jan 30 2024
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

/* tslint:disable:no-empty */

import React from 'react'

export interface DeviceActivationContextProps {
  readonly validate: () => Promise<void>
  readonly validating: boolean
  readonly activated: boolean
  readonly activate: () => Promise<void>
  readonly activating: boolean
}

export const DeviceActivationContext =
  React.createContext<DeviceActivationContextProps>({
    validate: async () => {},
    validating: false,
    activated: false,
    activate: async () => {},
    activating: false
  })
