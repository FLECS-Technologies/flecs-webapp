/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Mon Dec 20 2021
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
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AppInstanceData from './AppInstanceData'

describe('AppInstanceData', () => {
  const data = ['app1.t', 'app1.u', 'app1.v', 'app1.w', 'app1.x', 'app1.y', 'app1.z', 'app2.a', 'app2.b', 'app2.b.b1', 'app2.b.b2', 'app2.c', 'app2.d', 'app2.e', 'app2.f.f0', 'app2.f.f1']
  test('Render AppInstanceData', () => {
    const { getByTestId, getByText } = render(
        <AppInstanceData
            instanceName='Test Instance'
            instanceData={data}
        >

        </AppInstanceData>
    )

    const expandAllButton = getByTestId('expand-button')
    const treeView = getByTestId('app-instances-data-tree')
    const root = getByText('Test Instance')

    fireEvent.click(root)
    fireEvent.click(expandAllButton)

    expect(expandAllButton).toBeInTheDocument()
    expect(treeView).toBeInTheDocument()
  })
})
