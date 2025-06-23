/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jun 01 2022
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
import React from 'react'
import { render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import '@testing-library/jest-dom'
import { AppList } from '../AppList'
import { useReferenceDataContext } from '../ReferenceDataContext'
import { vitest } from 'vitest'

vitest.mock('../../api/marketplace/ProductService')
vitest.mock('../../api/device/DeviceAPI')
vitest.mock('../ReferenceDataContext', () => ({ useReferenceDataContext: vitest.fn() }))

const mockReferenceDataContext = {
  setAppList: vitest.fn(),
  setAppListLoading: vitest.fn(),
  setAppListError: vitest.fn(),
  setUpdateAppList: vitest.fn(),
  setLoadedProducts: vitest.fn(),
  updateAppList: false,
  appListLoading: false
}

describe('AppList', () => {
  afterAll(() => {
    vitest.clearAllMocks()
  })
  test('renders AppList component', async () => {
    useReferenceDataContext.mockReturnValue(mockReferenceDataContext)
    await act(async () => {
      render(<AppList></AppList>)
    })
  })
})
