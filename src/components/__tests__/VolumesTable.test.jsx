/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Apr 07 2022
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
import '@testing-library/jest-dom'
import { act } from 'react-dom/test-utils'
import { render, screen } from '@testing-library/react'
import VolumesTable from '../VolumesTable'

const testData = [
  {
    name: 'var',
    path: '/var/lib'
  },
  {
    name: 'log',
    path: '/etc/log'
  }
]
describe('HostContainerTable', () => {
  test('renders HostContainerTable component', async () => {
    await act(async () => {
      render(<VolumesTable volumes={testData}></VolumesTable>)
    })

    expect(screen.getByText('var')).toBeVisible()
    expect(screen.getByText('/var/lib')).toBeVisible()
    expect(screen.getByText('log')).toBeVisible()
    expect(screen.getByText('/etc/log')).toBeVisible()
  })
})
